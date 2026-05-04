import { useEffect, useMemo, useRef } from "react";
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

function JellyBoard({ problem, level, gameState, placedRightIds, feedbackOptions, onJellyPlaced }: JellyBoardProps) {
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const mergeAnimatedRef = useRef(false);
  const jellies = useMemo(() => createProblemJellies(problem, placedRightIds), [placedRightIds, problem]);
  const leftJellies = jellies.filter((jelly) => jelly.valueGroup === "left");
  const rightJellies = jellies.filter((jelly) => jelly.valueGroup === "right");
  const draggable = problem.mode === "addition" && LEVEL_CONFIG[level].draggable && gameState !== "correct";
  const mergedCount = problem.left + placedRightIds.length;
  const answerSlots = Math.max(problem.answer, 1);
  const allPlaced = problem.right > 0 && placedRightIds.length >= problem.right;

  const { getHandlers } = useDragJellies({
    disabled: !draggable,
    dropZoneRef,
    feedbackOptions,
    onDropSuccess: onJellyPlaced
  });

  useEffect(() => {
    mergeAnimatedRef.current = false;
  }, [problem.id]);

  useEffect(() => {
    if (allPlaced && !mergeAnimatedRef.current) {
      mergeAnimatedRef.current = true;
      playFeedback("jellyMergeComplete", {
        ...feedbackOptions,
        visualTarget: dropZoneRef.current
      });
    }
  }, [allPlaced, feedbackOptions]);

  return (
    <section className={`jelly-board level-${level}`} aria-label="ゼリー">
      <div className="jelly-source-row">
        <div className="source-group blue-group" aria-label="あおいゼリー">
          {leftJellies.length === 0 ? (
            <span className="zero-note">0</span>
          ) : (
            leftJellies.map((jelly) => <JellyBlock jelly={jelly} key={jelly.id} />)
          )}
        </div>
        <span className="source-plus">{problem.mode === "addition" ? "+" : "-"}</span>
        <div className="source-group red-group" aria-label="あかいゼリー">
          {rightJellies.length === 0 ? (
            <span className="zero-note">0</span>
          ) : (
            rightJellies.map((jelly, index) => {
              const jellyId = getRightJellyId(problem, index);
              const isPlaced = placedRightIds.includes(jellyId);

              return (
                <JellyBlock
                  draggable={draggable && !isPlaced}
                  dragHandlers={getHandlers(jellyId)}
                  ghost={isPlaced || level === 3}
                  jelly={{ ...jelly, id: jellyId, placed: isPlaced }}
                  key={jellyId}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="merge-wrap">
        <div className="merge-zone" ref={dropZoneRef}>
          {Array.from({ length: answerSlots }, (_, index) => {
            const filledByLeft = index < problem.left;
            const filledByRight = index >= problem.left && index < mergedCount;
            const rightIndex = index - problem.left;

            if (problem.answer === 0) {
              return <span className="merge-slot is-empty" key="zero-slot" />;
            }

            if (filledByLeft) {
              return (
                <JellyBlock
                  compact
                  jelly={{
                    id: `merged-left-${problem.id}-${index}`,
                    valueGroup: "merged",
                    color: "blue",
                    index,
                    placed: true
                  }}
                  key={`left-${index}`}
                />
              );
            }

            if (filledByRight) {
              return (
                <JellyBlock
                  compact
                  jelly={{
                    id: `merged-right-${problem.id}-${rightIndex}`,
                    valueGroup: "merged",
                    color: "red",
                    index,
                    placed: true
                  }}
                  key={`right-${index}`}
                />
              );
            }

            return <span className="merge-slot" key={`slot-${index}`} />;
          })}
        </div>

        {LEVEL_CONFIG[level].showMergedCount && (
          <div className="merged-count" aria-live="polite">
            <span>あつめた かず</span>
            <strong>{mergedCount}</strong>
          </div>
        )}

        {level === 3 && <p className="level-hint">ゼリーを見て、こたえをえらぼう</p>}
      </div>
    </section>
  );
}

export default JellyBoard;
