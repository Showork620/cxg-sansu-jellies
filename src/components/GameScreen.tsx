import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateChoices } from "../game/choiceGenerator";
import {
  COLLECTION_JELLY_TOTAL,
  LEVEL_CONFIG,
  RECENT_PROBLEM_LIMIT,
  advanceCollectionSession,
  createCollectionSession
} from "../game/constants";
import { generateProblem } from "../game/problemGenerator";
import type { AppSettings, CharacterState, CollectionSession, GameState, Problem, ProgressState } from "../game/types";
import { playFeedback } from "../feedback/feedbackManager";
import { useReducedMotion } from "../hooks/useReducedMotion";
import AnswerChoices from "./AnswerChoices";
import Character from "./Character";
import Equation from "./Equation";
import JellyBoard from "./JellyBoard";
import ParentMenu from "./ParentMenu";
import ParentMenuHandle from "./ParentMenuHandle";
import ProgressMeter from "./ProgressMeter";
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
  movedJellyIds: string[];
};

type SuccessPhase = "idle" | "reading" | "collecting" | "overlay";

type CollectionRun = {
  problemId: string;
  from: number;
  to: number;
  added: number;
  trueClear: boolean;
};

const READING_DURATION_MS = 3100;
const DROPPING_DURATION_MS = 2200;
const SUCCESS_READING_DURATION_MS = 3900;
const COLLECTION_STEP_MS = 44;
const COLLECTION_WRAP_MS = 620;
const REDUCED_MOTION_READING_DURATION_MS = 280;
const REDUCED_MOTION_DROPPING_DURATION_MS = 180;
const REDUCED_MOTION_SUCCESS_READING_DURATION_MS = 220;
const REDUCED_MOTION_COLLECTION_DURATION_MS = 180;

function getInitialGameState(problem: Problem, settings: Pick<AppSettings, "mode" | "level">): GameState {
  if (!LEVEL_CONFIG[settings.level].draggable || problem.movableCount === 0) {
    return "answering";
  }

  return "manipulating";
}

function createRound(settings: Pick<AppSettings, "mode" | "level">, collectionSession: CollectionSession): RoundState {
  const problem = generateProblem(settings.mode, collectionSession);
  const initialGameState = getInitialGameState(problem, settings);

  return {
    problem,
    choices: generateChoices(problem.answer),
    gameState: initialGameState === "manipulating" ? "presenting" : initialGameState,
    selectedAnswer: null,
    movedJellyIds: []
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
  const [round, setRound] = useState<RoundState>(() => createRound(settings, progress.collectionSession));
  const [successPhase, setSuccessPhase] = useState<SuccessPhase>(() =>
    progress.collectionSession.status === "completed" ? "overlay" : "idle"
  );
  const [collectionRun, setCollectionRun] = useState<CollectionRun | null>(null);
  const [meterValue, setMeterValue] = useState(progress.collectionSession.collectedTotal);
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

      if (target instanceof Element && target.closest(".parent-menu, .success-panel")) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("touchmove", preventGameScreenScroll, { passive: false });

    return () => document.removeEventListener("touchmove", preventGameScreenScroll);
  }, []);

  const resetRound = useCallback(
    (collectionSession: CollectionSession) => {
      setSuccessPhase(collectionSession.status === "completed" ? "overlay" : "idle");
      setCollectionRun(null);
      setMeterValue(collectionSession.collectedTotal);
      setRound(createRound({ mode: settings.mode, level: settings.level }, collectionSession));
    },
    [settings.level, settings.mode]
  );

  useEffect(() => {
    resetRound(progressRef.current.collectionSession);
  }, [resetRound]);

  useEffect(() => {
    if (successPhase !== "idle" || round.problem.collectionSessionId === progress.collectionSession.id) {
      return;
    }

    const timerId = window.setTimeout(() => resetRound(progress.collectionSession), 0);

    return () => window.clearTimeout(timerId);
  }, [progress.collectionSession, resetRound, round.problem.collectionSessionId, successPhase]);

  useEffect(() => {
    if (successPhase === "overlay") {
      return;
    }

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
  }, [reducedMotion, round.gameState, round.problem.id, settings.level, settings.mode, successPhase]);

  const handleJellyPlaced = (jellyId: string) => {
    setRound((current) => {
      if (current.movedJellyIds.includes(jellyId)) {
        return current;
      }

      const movedJellyIds = [...current.movedJellyIds, jellyId];
      const allPlaced = movedJellyIds.length >= current.problem.movableCount;

      return {
        ...current,
        movedJellyIds,
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

      const currentSession = progressRef.current.collectionSession;
      const shouldCollect =
        currentSession.status === "active" &&
        currentSession.id === round.problem.collectionSessionId &&
        currentSession.currentIndex === round.problem.collectionIndex;
      const nextSession = shouldCollect ? advanceCollectionSession(currentSession) : currentSession;
      const run: CollectionRun = {
        problemId: round.problem.id,
        from: currentSession.collectedTotal,
        to: nextSession.collectedTotal,
        added: Math.max(0, nextSession.collectedTotal - currentSession.collectedTotal),
        trueClear: currentSession.status !== "completed" && nextSession.status === "completed"
      };

      setMeterValue(run.from);
      setCollectionRun(run);
      setSuccessPhase("reading");

      onProgressChange((current) => {
        const nextStreak = current.currentStreak + 1;
        const canAdvanceCollection =
          current.collectionSession.status === "active" &&
          current.collectionSession.id === round.problem.collectionSessionId &&
          current.collectionSession.currentIndex === round.problem.collectionIndex;

        return {
          schemaVersion: 2,
          totalAnswered: current.totalAnswered + 1,
          totalCorrect: current.totalCorrect + 1,
          currentStreak: nextStreak,
          bestStreak: Math.max(current.bestStreak, nextStreak),
          lastProblemIds: [...current.lastProblemIds, round.problem.id].slice(-RECENT_PROBLEM_LIMIT),
          collectionSession: canAdvanceCollection
            ? advanceCollectionSession(current.collectionSession)
            : current.collectionSession
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

    if (progressRef.current.collectionSession.status === "completed") {
      const nextSession = createCollectionSession();

      onProgressChange((current) => ({
        ...current,
        collectionSession: nextSession,
        lastProblemIds: []
      }));
      resetRound(nextSession);
      return;
    }

    resetRound(progressRef.current.collectionSession);
  };

  const handleSkipSuccess = () => {
    if (collectionRun) {
      setMeterValue(collectionRun.to);
    }

    setSuccessPhase("overlay");
  };

  const handleMenuOpen = (target: HTMLElement) => {
    playFeedback("menuOpen", {
      ...feedbackOptions,
      visualTarget: target
    });
    setMenuOpen(true);
  };

  useEffect(() => {
    if (successPhase === "idle" || successPhase === "overlay") {
      return;
    }

    if (successPhase === "reading") {
      const timerId = window.setTimeout(
        () => setSuccessPhase("collecting"),
        reducedMotion ? REDUCED_MOTION_SUCCESS_READING_DURATION_MS : SUCCESS_READING_DURATION_MS
      );

      return () => window.clearTimeout(timerId);
    }

    if (!collectionRun) {
      const timerId = window.setTimeout(() => setSuccessPhase("overlay"), 0);

      return () => window.clearTimeout(timerId);
    }

    if (reducedMotion || collectionRun.added <= 0) {
      const timerId = window.setTimeout(() => {
        setMeterValue(collectionRun.to);
        setSuccessPhase("overlay");
      }, REDUCED_MOTION_COLLECTION_DURATION_MS);

      return () => window.clearTimeout(timerId);
    }

    let currentValue = collectionRun.from;
    const intervalId = window.setInterval(() => {
      currentValue = Math.min(collectionRun.to, currentValue + 1);
      setMeterValue(currentValue);

      if (currentValue >= collectionRun.to) {
        window.clearInterval(intervalId);
      }
    }, COLLECTION_STEP_MS);
    const timerId = window.setTimeout(
      () => setSuccessPhase("overlay"),
      collectionRun.added * COLLECTION_STEP_MS + COLLECTION_WRAP_MS
    );

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timerId);
    };
  }, [collectionRun, reducedMotion, successPhase]);

  const answerReady = round.gameState === "answering" || round.gameState === "wrong" || round.gameState === "correct";
  const answerDisabled = round.gameState !== "answering";
  const characterState = getCharacterState(round.gameState, round.movedJellyIds.length);
  const presenting = round.gameState === "presenting";
  const successReading = successPhase === "reading";
  const collecting = successPhase === "collecting";
  const trueClear = collectionRun?.trueClear || progress.collectionSession.status === "completed";
  const characterLarge = answerReady || successPhase !== "idle";
  const displayedMeterValue = successPhase === "idle" ? progress.collectionSession.collectedTotal : meterValue;
  const answerSheetHidden = !answerReady || collecting;
  const gameScreenClassName = `screen game-screen${answerReady ? " has-answer-sheet" : ""}${
    successPhase !== "idle" && successPhase !== "overlay" ? " has-success-skip" : ""
  }`;
  const gameContentClassName = `game-content${presenting ? " is-presenting" : ""}${
    successReading ? " is-success-reading" : ""
  }`;
  const bottomHudClassName = `bottom-hud${answerReady ? " has-answer-sheet" : ""}${
    collecting ? " is-collecting" : ""
  }`;

  return (
    <section className={gameScreenClassName}>
      <ParentMenuHandle onOpen={handleMenuOpen} progressLabel="長押しでメニュー" />

      <div className="orientation-prompt" role="status" aria-live="polite">
        <svg className="orientation-icon" aria-hidden="true" viewBox="0 0 96 96" focusable="false">
          <rect x="34" y="18" width="28" height="54" rx="7" />
          <path d="M71 35c7 6 10 16 6 25-3 8-10 14-18 16" />
          <path d="M61 66l-3 10 10 2" />
        </svg>
        <strong>スマホを横向きにしてね</strong>
      </div>

      <div className={gameContentClassName}>
        <Equation
          animateKey={`${round.problem.id}-${successReading ? "success" : "question"}`}
          problem={round.problem}
          revealAnswer={round.gameState === "correct"}
          settling={round.gameState === "dropping"}
          successReading={successReading}
          variant={round.gameState === "presenting" || successReading ? "featured" : "compact"}
        />
        <JellyBoard
          problem={round.problem}
          level={settings.level}
          gameState={round.gameState}
          movedJellyIds={round.movedJellyIds}
          assistEnabled={settings.assistEnabled}
          feedbackOptions={feedbackOptions}
          onJellyPlaced={handleJellyPlaced}
        />
        <div className={bottomHudClassName}>
          <ProgressMeter
            value={displayedMeterValue}
            target={COLLECTION_JELLY_TOTAL}
            collecting={collecting}
            completed={displayedMeterValue >= COLLECTION_JELLY_TOTAL}
          />
          <div
            className={`answer-sheet-slot ${answerReady ? "is-ready" : ""}`}
            aria-hidden={answerSheetHidden ? true : undefined}
          >
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
        {collecting && collectionRun && <div className="collection-flyers" aria-hidden="true">
          {Array.from({ length: Math.min(collectionRun.added, 10) }, (_, index) => (
            <span
              className="collection-flyer"
              key={`${collectionRun.problemId}-${index}`}
              style={{ "--flyer-index": index } as React.CSSProperties}
            />
          ))}
        </div>}
      </div>

      <div className={`game-character ${characterLarge ? "is-large" : ""}`}>
        <Character state={characterState} size={characterLarge ? "large" : "normal"} />
      </div>

      {successPhase !== "idle" && successPhase !== "overlay" && (
        <button className="success-skip-button" type="button" onClick={handleSkipSuccess}>
          スキップ
        </button>
      )}

      {successPhase === "overlay" && (
        <SuccessOverlay
          problem={round.problem}
          trueClear={trueClear}
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
