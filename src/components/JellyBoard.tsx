import { useCallback, useEffect, useMemo, useRef } from "react";
import type { FeedbackOptions } from "../feedback/feedbackManager";
import { playFeedback } from "../feedback/feedbackManager";
import { LEVEL_CONFIG } from "../game/constants";
import { createProblemJellies } from "../game/jellyLayout";
import type { GameState, Level, Problem } from "../game/types";
import { useDragJellies } from "../hooks/useDragJellies";
import JellyBlock from "./JellyBlock";

type JellyBoardProps = {
  problem: Problem;
  level: Level;
  gameState: GameState;
  movedJellyIds: string[];
  assistEnabled: boolean;
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

function PlateCount({ count, visible }: { count: number; visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <span className="plate-count" aria-hidden="true">
      {count}
    </span>
  );
}

function TransferIndicator({ inactive, mode }: { inactive: boolean; mode: Problem["mode"] }) {
  const className = `source-transfer is-move ${mode === "subtraction" ? "is-reverse" : ""} ${
    inactive ? "is-inactive" : ""
  }`;

  if (mode === "addition") {
    return (
      <span className={className} role="img" aria-label="みぎのゼリーをひだりへうごかす">
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
    <span className={className} role="img" aria-label="あかいゼリーをみぎへうごかす">
      <svg aria-hidden="true" viewBox="0 0 52 52" focusable="false">
        <path className="transfer-arrow-shadow" d="M34 16 44 26 34 36" />
        <path className="transfer-arrow-shadow" d="M42 26H8" />
        <path className="transfer-arrow" d="M34 16 44 26 34 36" />
        <path className="transfer-arrow" d="M42 26H8" />
      </svg>
    </span>
  );
}

type PlateJelly = {
  jelly: ReturnType<typeof createProblemJellies>[number];
  sourceId?: string;
  styleIndex: number;
  landed?: boolean;
};

function JellyBoard({
  problem,
  level,
  gameState,
  movedJellyIds,
  assistEnabled,
  feedbackOptions,
  onJellyPlaced
}: JellyBoardProps) {
  const leftPlateRef = useRef<HTMLDivElement | null>(null);
  const rightPlateRef = useRef<HTMLDivElement | null>(null);
  const mergeAnimatedRef = useRef(false);
  const previousPlacedCountRef = useRef(movedJellyIds.length);
  const jellies = useMemo(() => createProblemJellies(problem, movedJellyIds), [movedJellyIds, problem]);
  const leftJellies = jellies.filter((jelly) => jelly.valueGroup === "left");
  const rightJellies = jellies.filter((jelly) => jelly.valueGroup === "right");
  const movedIdSet = useMemo(() => new Set(movedJellyIds), [movedJellyIds]);
  const draggable = LEVEL_CONFIG[level].draggable && gameState === "manipulating" && problem.movableCount > 0;
  const leftIsDropTarget = draggable && problem.transferDirection === "right-to-left";
  const rightIsDropTarget = draggable && problem.transferDirection === "left-to-right";
  const dropZoneRef = problem.transferDirection === "right-to-left" ? leftPlateRef : rightPlateRef;
  const sourcePlateRef = problem.transferDirection === "right-to-left" ? rightPlateRef : leftPlateRef;
  const allPlaced = problem.movableCount > 0 && movedJellyIds.length >= problem.movableCount;
  const resultReady =
    allPlaced && (gameState === "answering" || gameState === "wrong" || gameState === "correct");

  const leftPlateJellies: PlateJelly[] =
    problem.mode === "addition"
      ? [
          ...leftJellies.map((jelly, index) => ({ jelly, styleIndex: index })),
          ...rightJellies
            .filter((jelly) => movedIdSet.has(jelly.id))
            .map((jelly, index) => ({
              jelly: {
                ...jelly,
                id: `left-plate-${jelly.id}`,
                valueGroup: "left" as const,
                index: problem.left + index,
                placed: true
              },
              styleIndex: problem.left + index,
              landed: true
            }))
        ]
      : [
          ...leftJellies.map((jelly, index) => ({ jelly, styleIndex: index })),
          ...rightJellies
            .filter((jelly) => !movedIdSet.has(jelly.id))
            .map((jelly, index) => ({
              jelly,
              sourceId: jelly.id,
              styleIndex: problem.answer + index
            }))
        ];
  const rightPlateJellies: PlateJelly[] =
    problem.mode === "addition"
      ? rightJellies
          .filter((jelly) => !movedIdSet.has(jelly.id))
          .map((jelly, index) => ({
            jelly,
            sourceId: jelly.id,
            styleIndex: index
          }))
      : rightJellies
          .filter((jelly) => movedIdSet.has(jelly.id))
          .map((jelly, index) => ({
            jelly: {
              ...jelly,
              id: `right-plate-${jelly.id}`,
              placed: true
            },
            styleIndex: index,
            landed: true
          }));
  const leftPlateCount =
    problem.mode === "addition" ? leftPlateJellies.length : Math.max(problem.answer, problem.left - movedJellyIds.length);
  const rightPlateCount =
    problem.mode === "addition" ? rightPlateJellies.length : Math.min(problem.right, movedJellyIds.length);
  const leftPlateLabel = problem.mode === "addition" ? "ひだりのさら" : "ひだりのさら";
  const rightPlateLabel = problem.mode === "addition" ? "みぎのさらのあかいゼリー" : "みぎのさら";
  const getPlateLabel = (label: string, count: number) => (assistEnabled ? `${label} ${count}こ` : label);

  const { getHandlers, startDrag } = useDragJellies({
    disabled: !draggable,
    dropZoneRef,
    feedbackOptions,
    onDropSuccess: onJellyPlaced
  });

  const handleSourcePointerDownCapture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || event.button !== 0 || !sourcePlateRef.current) {
        return;
      }

      const target = getClosestDraggableJelly(sourcePlateRef.current, event.clientX, event.clientY);
      const jellyId = target?.dataset.jellyId;

      if (!target || !jellyId) {
        return;
      }

      if (startDrag(jellyId, target, event)) {
        event.stopPropagation();
      }
    },
    [draggable, sourcePlateRef, startDrag]
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
    previousPlacedCountRef.current = movedJellyIds.length;

    if (movedJellyIds.length > previousPlacedCount && movedJellyIds.length < problem.movableCount) {
      playFeedback("jellyPackTighten", {
        ...feedbackOptions,
        visualTarget: sourcePlateRef.current
      });
    }
  }, [feedbackOptions, movedJellyIds.length, problem.movableCount, sourcePlateRef]);

  useEffect(() => {
    if (allPlaced && !mergeAnimatedRef.current) {
      mergeAnimatedRef.current = true;
      playFeedback("jellyMergeComplete", {
        ...feedbackOptions,
        visualTarget: dropZoneRef.current
      });
    }
  }, [allPlaced, dropZoneRef, feedbackOptions]);

  const renderPlateJellies = (items: PlateJelly[], plate: "left" | "right") => (
    <div className="plate-jellies" data-count={items.length}>
      {items.length === 0 && plate === "left" ? (
        <span className="zero-note">0</span>
      ) : (
        items.map((item) => {
          const isDraggable = draggable && !!item.sourceId;

          return (
            <JellyBlock
              draggable={isDraggable}
              dragHandlers={item.sourceId ? getHandlers(item.sourceId) : undefined}
              jelly={item.sourceId ? { ...item.jelly, id: item.sourceId } : item.jelly}
              key={`${plate}-${item.jelly.id}`}
              landed={item.landed}
              onPress={isDraggable ? undefined : handleJellyPress}
              style={getSourceJellyStyle(item.styleIndex)}
            />
          );
        })
      )}
    </div>
  );

  return (
    <section
      className={`jelly-board level-${level} ${gameState === "presenting" ? "is-reading" : ""} ${
        gameState === "dropping" ? "is-dropping" : ""
      }`}
      aria-label="ゼリー"
    >
      <div className="jelly-source-row" onPointerDownCapture={handleSourcePointerDownCapture}>
        <div
          className={`source-group left-plate ${leftIsDropTarget ? "is-drop-target" : ""} ${
            resultReady ? "is-result-active" : ""
          }`}
          ref={leftPlateRef}
          aria-label={getPlateLabel(leftPlateLabel, leftPlateCount)}
        >
          <PlateCount count={leftPlateCount} visible={assistEnabled} />
          {renderPlateJellies(leftPlateJellies, "left")}
        </div>
        <TransferIndicator inactive={resultReady} mode={problem.mode} />
        <div
          className={`source-group right-plate ${rightIsDropTarget ? "is-drop-target" : ""} ${
            resultReady ? "is-result-inactive" : ""
          }`}
          ref={rightPlateRef}
          aria-label={getPlateLabel(rightPlateLabel, rightPlateCount)}
        >
          <PlateCount count={rightPlateCount} visible={assistEnabled} />
          {renderPlateJellies(rightPlateJellies, "right")}
        </div>
      </div>
    </section>
  );
}

export default JellyBoard;
