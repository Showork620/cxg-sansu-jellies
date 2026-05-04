import { CHOICE_COUNT, MAX_NUMBER } from "./constants";

function shuffle<T>(items: T[]): T[] {
  const copied = [...items];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
  }

  return copied;
}

function addIfValid(choices: Set<number>, candidate: number): void {
  if (candidate >= 0 && candidate <= MAX_NUMBER) {
    choices.add(candidate);
  }
}

export function generateChoices(answer: number): number[] {
  const choices = new Set<number>([answer]);
  const nearbyOffsets = [-1, 1, -2, 2, -3, 3];

  for (const offset of nearbyOffsets) {
    if (choices.size >= CHOICE_COUNT) {
      break;
    }

    addIfValid(choices, answer + offset);
  }

  const remaining = shuffle(
    Array.from({ length: MAX_NUMBER + 1 }, (_, index) => index).filter((candidate) => !choices.has(candidate))
  );

  for (const candidate of remaining) {
    if (choices.size >= CHOICE_COUNT) {
      break;
    }

    choices.add(candidate);
  }

  return shuffle(Array.from(choices).slice(0, CHOICE_COUNT));
}
