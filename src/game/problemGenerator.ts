import { LEVEL_CONFIG, MAX_NUMBER, RECENT_PROBLEM_LIMIT } from "./constants";
import type { GameMode, Level, Problem } from "./types";

type ProblemParts = Pick<Problem, "mode" | "left" | "right" | "answer">;

export function getProblemId(mode: GameMode, left: number, right: number): string {
  return `${mode}:${left}:${right}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toProblem(parts: ProblemParts): Problem {
  return {
    ...parts,
    id: getProblemId(parts.mode, parts.left, parts.right)
  };
}

function answerFromProblemId(problemId: string): number | null {
  const [mode, leftText, rightText] = problemId.split(":");
  const left = Number(leftText);
  const right = Number(rightText);

  if ((mode !== "addition" && mode !== "subtraction") || Number.isNaN(left) || Number.isNaN(right)) {
    return null;
  }

  return mode === "addition" ? left + right : left - right;
}

function isOverusedAnswer(candidate: Problem, lastProblemIds: string[]): boolean {
  const recentAnswers = lastProblemIds
    .slice(-2)
    .map(answerFromProblemId)
    .filter((answer): answer is number => answer !== null);

  return recentAnswers.length >= 2 && recentAnswers.every((answer) => answer === candidate.answer);
}

function isRecentDuplicate(candidate: Problem, lastProblemIds: string[]): boolean {
  return lastProblemIds.slice(-RECENT_PROBLEM_LIMIT).includes(candidate.id);
}

export function generateAdditionProblem(level: Level, lastProblemIds: string[] = []): Problem {
  const maxAnswer = LEVEL_CONFIG[level].maxAdditionAnswer;
  let fallback = toProblem({ mode: "addition", left: 0, right: 0, answer: 0 });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const left = randomInt(0, maxAnswer);
    const right = randomInt(0, maxAnswer - left);
    const candidate = toProblem({
      mode: "addition",
      left,
      right,
      answer: left + right
    });

    fallback = candidate;

    if (!isRecentDuplicate(candidate, lastProblemIds) && !isOverusedAnswer(candidate, lastProblemIds)) {
      return candidate;
    }
  }

  return fallback;
}

export function generateSubtractionProblem(lastProblemIds: string[] = []): Problem {
  let fallback = toProblem({ mode: "subtraction", left: 0, right: 0, answer: 0 });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const left = randomInt(0, MAX_NUMBER);
    const right = randomInt(0, left);
    const candidate = toProblem({
      mode: "subtraction",
      left,
      right,
      answer: left - right
    });

    fallback = candidate;

    if (!isRecentDuplicate(candidate, lastProblemIds) && !isOverusedAnswer(candidate, lastProblemIds)) {
      return candidate;
    }
  }

  return fallback;
}

export function generateProblem(mode: GameMode, level: Level, lastProblemIds: string[] = []): Problem {
  if (mode === "subtraction") {
    return generateSubtractionProblem(lastProblemIds);
  }

  return generateAdditionProblem(level, lastProblemIds);
}
