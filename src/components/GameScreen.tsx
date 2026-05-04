import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateChoices } from "../game/choiceGenerator";
import { LEVEL_CONFIG, RECENT_PROBLEM_LIMIT } from "../game/constants";
import { generateProblem } from "../game/problemGenerator";
import type { AppSettings, CharacterState, GameState, Problem, ProgressState } from "../game/types";
import { playFeedback } from "../feedback/feedbackManager";
import { useReducedMotion } from "../hooks/useReducedMotion";
import AnswerChoices from "./AnswerChoices";
import Character from "./Character";
import Equation from "./Equation";
import JellyBoard from "./JellyBoard";
import ParentMenu from "./ParentMenu";
import ParentMenuHandle from "./ParentMenuHandle";
import SuccessOverlay from "./SuccessOverlay";

type GameScreenProps = {
  settings: AppSettings;
  progress: ProgressState;
  onSettingsChange: (settings: AppSettings | ((current: AppSettings) => AppSettings)) => void;
  onProgressChange: (progress: ProgressState | ((current: ProgressState) => ProgressState)) => void;
};

type RoundState = {
  problem: Problem;
  choices: number[];
  gameState: GameState;
  selectedAnswer: number | null;
  placedRightIds: string[];
};

function getInitialGameState(problem: Problem, settings: Pick<AppSettings, "mode" | "level">): GameState {
  if (settings.mode === "subtraction") {
    return "answering";
  }

  if (!LEVEL_CONFIG[settings.level].draggable || problem.right === 0) {
    return "answering";
  }

  return "manipulating";
}

function createRound(settings: Pick<AppSettings, "mode" | "level">, lastProblemIds: string[]): RoundState {
  const problem = generateProblem(settings.mode, settings.level, lastProblemIds);

  return {
    problem,
    choices: generateChoices(problem.answer),
    gameState: getInitialGameState(problem, settings),
    selectedAnswer: null,
    placedRightIds: []
  };
}

function getCharacterState(gameState: GameState, placedCount: number): CharacterState {
  if (gameState === "correct") {
    return "excited";
  }

  if (gameState === "wrong") {
    return "confused";
  }

  if (gameState === "answering") {
    return "thinking";
  }

  return placedCount > 0 ? "watching" : "idle";
}

function GameScreen({ settings, progress, onSettingsChange, onProgressChange }: GameScreenProps) {
  const reducedMotion = useReducedMotion();
  const progressRef = useRef(progress);
  const [round, setRound] = useState<RoundState>(() => createRound(settings, progress.lastProblemIds));
  const [menuOpen, setMenuOpen] = useState(false);

  const feedbackOptions = useMemo(
    () => ({
      soundEnabled: settings.soundEnabled,
      hapticsEnabled: settings.hapticsEnabled,
      reducedMotion
    }),
    [reducedMotion, settings.hapticsEnabled, settings.soundEnabled]
  );

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const resetRound = useCallback(
    (lastProblemIds: string[]) => {
      setRound(createRound({ mode: settings.mode, level: settings.level }, lastProblemIds));
    },
    [settings.level, settings.mode]
  );

  useEffect(() => {
    resetRound(progressRef.current.lastProblemIds);
  }, [resetRound]);

  const handleJellyPlaced = (jellyId: string) => {
    setRound((current) => {
      if (current.placedRightIds.includes(jellyId)) {
        return current;
      }

      const placedRightIds = [...current.placedRightIds, jellyId];
      const allPlaced = placedRightIds.length >= current.problem.right;

      return {
        ...current,
        placedRightIds,
        gameState: allPlaced ? "answering" : current.gameState
      };
    });
  };

  const handleSelectAnswer = (answer: number, target: HTMLElement) => {
    if (round.gameState !== "answering") {
      return;
    }

    playFeedback("answerPress", {
      ...feedbackOptions,
      visualTarget: target
    });

    const correct = answer === round.problem.answer;

    setRound((current) => ({
      ...current,
      selectedAnswer: answer,
      gameState: correct ? "correct" : "wrong"
    }));

    if (correct) {
      playFeedback("answerCorrect", {
        ...feedbackOptions,
        visualTarget: target
      });

      onProgressChange((current) => {
        const nextStreak = current.currentStreak + 1;

        return {
          schemaVersion: 1,
          totalAnswered: current.totalAnswered + 1,
          totalCorrect: current.totalCorrect + 1,
          currentStreak: nextStreak,
          bestStreak: Math.max(current.bestStreak, nextStreak),
          lastProblemIds: [...current.lastProblemIds, round.problem.id].slice(-RECENT_PROBLEM_LIMIT)
        };
      });

      return;
    }

    playFeedback("answerWrong", {
      ...feedbackOptions,
      visualTarget: target
    });

    onProgressChange((current) => ({
      ...current,
      totalAnswered: current.totalAnswered + 1,
      currentStreak: 0
    }));

    window.setTimeout(() => {
      setRound((current) =>
        current.gameState === "wrong"
          ? {
              ...current,
              selectedAnswer: null,
              gameState: "answering"
            }
          : current
      );
    }, reducedMotion ? 220 : 520);
  };

  const handleNextProblem = (target: HTMLElement) => {
    playFeedback("nextProblem", {
      ...feedbackOptions,
      visualTarget: target
    });
    resetRound(progressRef.current.lastProblemIds);
  };

  const handleMenuOpen = (target: HTMLElement) => {
    playFeedback("menuOpen", {
      ...feedbackOptions,
      visualTarget: target
    });
    setMenuOpen(true);
  };

  const answerDisabled = round.gameState !== "answering";
  const characterState = getCharacterState(round.gameState, round.placedRightIds.length);

  return (
    <section className="screen game-screen">
      <ParentMenuHandle onOpen={handleMenuOpen} progressLabel="長押しでメニュー" />

      <div className="game-content" aria-live="polite">
        <Equation problem={round.problem} revealAnswer={round.gameState === "correct"} />
        <JellyBoard
          problem={round.problem}
          level={settings.level}
          gameState={round.gameState}
          placedRightIds={round.placedRightIds}
          feedbackOptions={feedbackOptions}
          onJellyPlaced={handleJellyPlaced}
        />
        <AnswerChoices
          choices={round.choices}
          selectedAnswer={round.selectedAnswer}
          correctAnswer={round.problem.answer}
          disabled={answerDisabled}
          gameState={round.gameState}
          onSelect={handleSelectAnswer}
        />
      </div>

      <div className="game-character">
        <Character state={characterState} />
      </div>

      {round.gameState === "correct" && (
        <SuccessOverlay
          problem={round.problem}
          onNext={handleNextProblem}
          reducedMotion={reducedMotion}
        />
      )}

      {menuOpen && (
        <ParentMenu
          settings={settings}
          progress={progress}
          onSettingsChange={onSettingsChange}
          onProgressChange={onProgressChange}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </section>
  );
}

export default GameScreen;
