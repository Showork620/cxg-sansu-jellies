import { MAX_ANSWER, MAX_MOVABLE_JELLIES } from "./constants";
import type { CollectionSession, GameMode, JellyColor, Problem } from "./types";

type ProblemParts = Pick<
  Problem,
  | "mode"
  | "left"
  | "right"
  | "answer"
  | "leftColor"
  | "rightColor"
  | "collectionSessionId"
  | "collectionIndex"
  | "jellyCount"
  | "transferDirection"
  | "movableCount"
>;

const JELLY_COLOR_PALETTE: JellyColor[] = ["red", "blue", "yellow", "green", "purple"];

export function getProblemId(session: CollectionSession, parts: ProblemParts): string {
  return [
    session.id,
    parts.collectionIndex,
    parts.mode,
    parts.left,
    parts.right,
    parts.answer,
    parts.leftColor,
    parts.rightColor
  ].join(":");
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickJellyColors(): Pick<ProblemParts, "leftColor" | "rightColor"> {
  const leftIndex = randomInt(0, JELLY_COLOR_PALETTE.length - 1);
  let rightIndex = randomInt(0, JELLY_COLOR_PALETTE.length - 2);

  if (rightIndex >= leftIndex) {
    rightIndex += 1;
  }

  return {
    leftColor: JELLY_COLOR_PALETTE[leftIndex],
    rightColor: JELLY_COLOR_PALETTE[rightIndex]
  };
}

function toProblem(session: CollectionSession, parts: ProblemParts): Problem {
  return {
    ...parts,
    id: getProblemId(session, parts)
  };
}

function generateAdditionProblem(session: CollectionSession, jellyCount: number, collectionIndex: number): Problem {
  const answer = jellyCount;
  const minRight = Math.max(1, answer - MAX_MOVABLE_JELLIES);
  const maxRight = Math.min(MAX_MOVABLE_JELLIES, answer - 1);
  const right = randomInt(minRight, maxRight);
  const left = answer - right;

  return toProblem(session, {
    mode: "addition",
    left,
    right,
    answer,
    ...pickJellyColors(),
    collectionSessionId: session.id,
    collectionIndex,
    jellyCount,
    transferDirection: "right-to-left",
    movableCount: right
  });
}

function generateSubtractionProblem(session: CollectionSession, answer: number, collectionIndex: number): Problem {
  const maxRight = Math.min(MAX_MOVABLE_JELLIES, MAX_ANSWER - answer);
  const right = maxRight > 0 ? randomInt(1, maxRight) : 0;
  const left = answer + right;

  return toProblem(session, {
    mode: "subtraction",
    left,
    right,
    answer,
    ...pickJellyColors(),
    collectionSessionId: session.id,
    collectionIndex,
    jellyCount: answer,
    transferDirection: "left-to-right",
    movableCount: right
  });
}

export function generateProblem(mode: GameMode, session: CollectionSession): Problem {
  const collectionIndex = Math.min(session.currentIndex, session.answerPlan.length - 1);
  const jellyCount = session.answerPlan[collectionIndex];

  if (mode === "subtraction") {
    return generateSubtractionProblem(session, jellyCount, collectionIndex);
  }

  return generateAdditionProblem(session, jellyCount, collectionIndex);
}
