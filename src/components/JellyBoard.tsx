import { useCallback, useEffect, useMemo, useRef } from "react";
import type { FeedbackOptions } from "../feedback/feedbackManager";
import { playFeedback } from "../feedback/feedbackManager";
import { LEVEL_CONFIG } from "../game/constants";
import { createProblemJellies, getRightJellyId } from "../game/jellyLayout";
import type { GameState, Level, Problem } from "../game/types";
import { useDragJellies } from "../hooks/useDragJellies";
import JellyBlock from "./JellyBlock";

type JellyBoardProps = {
  problem: Problem;
  level: Level;
  gameState: GameState;
  placedRightIds: string[];
  feedbackOptions: Omit<FeedbackOptions, "visualTarget">;
  onJellyPlaced: (jellyId: string) => void;
};

const JELLY_HIT_TARGET_SCALE = 1.2;

function getSourceJellyStyle(index: number): React.CSSProperties {
  return {
    "--jelly-drop-delay": `${index * 80}ms`
  } as React.CSSProperties;
}

function getClosestDraggableJelly(root: HTMLElement, x: number, y: number): HTMLElement | null {
  const candidates = root.querySelectorAll<HTMLElement>(".jelly-block.is-draggable[data-jelly-id]");
  let closestElement: HTMLElement | null = null;
  let closestDistance = Infinity;

  candidates.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const extraX = (rect.width * (JELLY_HIT_TARGET_SCALE - 1)) / 2;
    const extraY = (rect.height * (JELLY_HIT_TARGET_SCALE - 1)) / 2;

    if (x < rect.left - extraX || x > rect.right + extraX || y < rect.top - extraY || y > rect.bottom + extraY) {
      return;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = (x - centerX) ** 2 + (y - centerY) ** 2;

    if (distance < closestDistance) {
      closestDistance = distance;
      closestElement = element;
    }
  });

  return closestElement;
}

function PlateCount({ count }: { count: number }) {
  return (
    <span className="plate-count" aria-hidden="true">
      {count}
    </span>
  );
}

function TransferIndicator({ mode }: { mode: Problem["mode"] }) {
  if (mode === "addition") {
    return (
      <span className="source-transfer is-move" role="img" aria-label="みぎのゼリーをひだりへうごかす">
        <svg aria-hidden="true" viewBox="0 0 52 52" focusable="false">
          <path className="transfer-arrow-shadow" d="M18 16 8 26l10 10" />
          <path className="transfer-arrow-shadow" d="M10 26h34" />
          <path className="transfer-arrow" d="M18 16 8 26l10 10" />
          <path className="transfer-arrow" d="M10 26h34" />
        </svg>
      </span>
    );
  }

  return (
    <span className="source-transfer is-minus" role="img" aria-label="ひく">
      -
    </span>
  );
}

function JellyBoard({ problem, level, gameState, placedRightIds, feedbackOptions, onJellyPlaced }: JellyBoardProps) {
  const leftPlateRef = useRef<HTMLDivElement | null>(null);
  const rightPlateRef = useRef<HTMLDivElement | null>(null);
  const mergeAnimatedRef = useRef(false);
  const previousPlacedCountRef = useRef(placedRightIds.length);
  const jellies = useMemo(() => createProblemJellies(problem, placedRightIds), [placedRightIds, problem]);
  const leftJellies = jellies.filter((jelly) => jelly.valueGroup === "left");
  const rightJellies = jellies.filter((jelly) => jelly.valueGroup === "right");
  const leftPlateJellies = [
    ...leftJellies,
    ...rightJellies
      .filter((jelly) => placedRightIds.includes(jelly.id))
      .map((jelly, index) => ({
        ...jelly,
        id: `left-plate-${jelly.id}`,
        valueGroup: "left" as const,
        index: problem.left + index,
        placed: true
      }))
  ];
  const draggable = problem.mode === "addition" && LEVEL_CONFIG[level].draggable && gameState === "manipulating";
  const leftPlateCount = leftPlateJellies.length;
  const rightPlateCount = rightJellies.filter((_, index) => !placedRightIds.includes(getRightJellyId(problem, index))).length;
  const allPlaced = problem.right > 0 && placedRightIds.length >= problem.right;
  const leftPlateLabel = problem.mode === "addition" ? "ひだりのさら" : "ひだりのさらのみどりゼリー";
  const rightPlateLabel = problem.mode === "addition" ? "みぎのさらのあかいゼリー" : "みぎのさらのみどりゼリー";

  const { getHandlers, startDrag } = useDragJellies({
    disabled: !draggable,
    dropZoneRef: leftPlateRef,
    feedbackOptions,
    onDropSuccess: onJellyPlaced
  });

  const handleSourcePointerDownCapture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || event.button !== 0 || !rightPlateRef.current) {
        return;
      }

      const target = getClosestDraggableJelly(rightPlateRef.current, event.clientX, event.clientY);
      const jellyId = target?.dataset.jellyId;

      if (!target || !jellyId) {
        return;
      }

      if (startDrag(jellyId, target, event)) {
        event.stopPropagation();
      }
    },
    [draggable, startDrag]
  );

  const handleJellyPress = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      playFeedback("jellyPress", {
        ...feedbackOptions,
        visualTarget: event.currentTarget
      });
    },
    [feedbackOptions]
  );

  useEffect(() => {
    mergeAnimatedRef.current = false;
    previousPlacedCountRef.current = 0;
  }, [problem.id]);

  useEffect(() => {
    const previousPlacedCount = previousPlacedCountRef.current;
    previousPlacedCountRef.current = placedRightIds.length;

    if (placedRightIds.length > previousPlacedCount && rightPlateCount > 0) {
      playFeedback("jellyPackTighten", {
        ...feedbackOptions,
        visualTarget: rightPlateRef.current
      });
    }
  }, [feedbackOptions, placedRightIds.length, rightPlateCount]);

  useEffect(() => {
    if (allPlaced && !mergeAnimatedRef.current) {
      mergeAnimatedRef.current = true;
      playFeedback("jellyMergeComplete", {
        ...feedbackOptions,
        visualTarget: leftPlateRef.current
      });
    }
  }, [allPlaced, feedbackOptions]);

  return (
    <section
      className={`jelly-board level-${level} ${gameState === "presenting" ? "is-reading" : ""} ${
        gameState === "dropping" ? "is-dropping" : ""
      }`}
      aria-label="ゼリー"
    >
      <div className="jelly-source-row" onPointerDownCapture={handleSourcePointerDownCapture}>
        <div
          className={`source-group left-plate ${draggable ? "is-drop-target" : ""}`}
          ref={leftPlateRef}
          aria-label={`${leftPlateLabel} ${leftPlateCount}こ`}
        >
          <PlateCount count={leftPlateCount} />
          {leftPlateJellies.length === 0 ? (
            <span className="zero-note">0</span>
          ) : (
            leftPlateJellies.map((jelly, index) => (
              <JellyBlock jelly={jelly} key={jelly.id} onPress={handleJellyPress} style={getSourceJellyStyle(index)} />
            ))
          )}
        </div>
        <TransferIndicator mode={problem.mode} />
        <div className="source-group right-plate" ref={rightPlateRef} aria-label={`${rightPlateLabel} ${rightPlateCount}こ`}>
          <PlateCount count={rightPlateCount} />
          {rightJellies.length === 0 ? (
            <span className="zero-note">0</span>
          ) : (
            rightJellies.map((jelly, index) => {
              const jellyId = getRightJellyId(problem, index);
              const isPlaced = placedRightIds.includes(jellyId);

              if (isPlaced) {
                return null;
              }

              return (
                <JellyBlock
                  draggable={draggable && !isPlaced}
                  dragHandlers={getHandlers(jellyId)}
                  ghost={level === 3 && !isPlaced}
                  jelly={{ ...jelly, id: jellyId, placed: isPlaced }}
                  key={jellyId}
                  onPress={draggable && !isPlaced ? undefined : handleJellyPress}
                  style={getSourceJellyStyle(index)}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default JellyBoard;
