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

const READING_DURATION_MS = 3100;
const DROPPING_DURATION_MS = 2200;
const REDUCED_MOTION_READING_DURATION_MS = 280;
const REDUCED_MOTION_DROPPING_DURATION_MS = 180;

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
  const initialGameState = getInitialGameState(problem, settings);

  return {
    problem,
    choices: generateChoices(problem.answer),
    gameState: initialGameState === "manipulating" ? "presenting" : initialGameState,
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

  useEffect(() => {
    const preventGameScreenScroll = (event: TouchEvent) => {
      const target = event.target;

      if (target instanceof Element && target.closest(".parent-menu")) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("touchmove", preventGameScreenScroll, { passive: false });

    return () => document.removeEventListener("touchmove", preventGameScreenScroll);
  }, []);

  const resetRound = useCallback(
    (lastProblemIds: string[]) => {
      setRound(createRound({ mode: settings.mode, level: settings.level }, lastProblemIds));
    },
    [settings.level, settings.mode]
  );

  useEffect(() => {
    resetRound(progressRef.current.lastProblemIds);
  }, [resetRound]);

  useEffect(() => {
    if (round.gameState !== "presenting" && round.gameState !== "dropping") {
      return;
    }

    const phaseDuration =
      round.gameState === "presenting"
        ? reducedMotion
          ? REDUCED_MOTION_READING_DURATION_MS
          : READING_DURATION_MS
        : reducedMotion
          ? REDUCED_MOTION_DROPPING_DURATION_MS
          : DROPPING_DURATION_MS;

    const timerId = window.setTimeout(
      () => {
        setRound((current) =>
          current.problem.id === round.problem.id && current.gameState === round.gameState
            ? {
                ...current,
                gameState:
                  current.gameState === "presenting"
                    ? "dropping"
                    : getInitialGameState(current.problem, { mode: settings.mode, level: settings.level })
              }
            : current
        );
      },
      phaseDuration
    );

    return () => window.clearTimeout(timerId);
  }, [reducedMotion, round.gameState, round.problem.id, settings.level, settings.mode]);

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

  const answerReady = round.gameState === "answering" || round.gameState === "wrong" || round.gameState === "correct";
  const answerDisabled = round.gameState !== "answering";
  const characterState = getCharacterState(round.gameState, round.placedRightIds.length);
  const presenting = round.gameState === "presenting";
  const gameContentClassName = `game-content${presenting ? " is-presenting" : ""}`;

  return (
    <section className="screen game-screen">
      <ParentMenuHandle onOpen={handleMenuOpen} progressLabel="長押しでメニュー" />

      <div className="orientation-prompt" role="status" aria-live="polite">
        <svg className="orientation-icon" aria-hidden="true" viewBox="0 0 96 96" focusable="false">
          <rect x="34" y="18" width="28" height="54" rx="7" />
          <path d="M71 35c7 6 10 16 6 25-3 8-10 14-18 16" />
          <path d="M61 66l-3 10 10 2" />
        </svg>
        <strong>スマホを横向きにしてね</strong>
      </div>

      <div className={gameContentClassName} aria-live="polite">
        <Equation
          animateKey={round.problem.id}
          problem={round.problem}
          revealAnswer={round.gameState === "correct"}
          settling={round.gameState === "dropping"}
          variant={round.gameState === "presenting" ? "featured" : "compact"}
        />
        <JellyBoard
          problem={round.problem}
          level={settings.level}
          gameState={round.gameState}
          placedRightIds={round.placedRightIds}
          feedbackOptions={feedbackOptions}
          onJellyPlaced={handleJellyPlaced}
        />
        <div className={`answer-slot ${answerReady ? "is-ready" : ""}`} aria-hidden={answerReady ? undefined : true}>
          {answerReady && (
            <AnswerChoices
              choices={round.choices}
              selectedAnswer={round.selectedAnswer}
              correctAnswer={round.problem.answer}
              disabled={answerDisabled}
              gameState={round.gameState}
              onSelect={handleSelectAnswer}
            />
          )}
        </div>
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
