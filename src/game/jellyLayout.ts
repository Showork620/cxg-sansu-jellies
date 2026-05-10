import type { Jelly, Problem } from "./types";
import { JELLY_COLUMNS } from "./constants";

export type JellySlot = {
  id: string;
  index: number;
  row: number;
  col: number;
};

export function getJellySlot(index: number): JellySlot {
  return {
    id: `slot-${index}`,
    index,
    row: Math.floor(index / JELLY_COLUMNS),
    col: index % JELLY_COLUMNS
  };
}

export function getJellySlots(count: number): JellySlot[] {
  return Array.from({ length: count }, (_, index) => getJellySlot(index));
}

export function createProblemJellies(problem: Problem, placedRightIds: string[] = []): Jelly[] {
  const stableLeftCount = problem.mode === "subtraction" ? problem.answer : problem.left;
  const leftJellies: Jelly[] = Array.from({ length: stableLeftCount }, (_, index) => ({
    id: `left-${problem.id}-${index}`,
    valueGroup: "left",
    color: problem.leftColor,
    index,
    placed: true
  }));

  const rightJellies: Jelly[] = Array.from({ length: problem.right }, (_, index) => {
    const id = `right-${problem.id}-${index}`;

    return {
      id,
      valueGroup: "right",
      color: problem.rightColor,
      index,
      placed: placedRightIds.includes(id)
    };
  });

  return [...leftJellies, ...rightJellies];
}

export function getRightJellyId(problem: Problem, index: number): string {
  return `right-${problem.id}-${index}`;
}
