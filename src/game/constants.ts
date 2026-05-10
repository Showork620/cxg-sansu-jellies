import type { AppSettings, CollectionSession, Level, ProgressState } from "./types";

export const MIN_ANSWER = 2;
export const MAX_ANSWER = 10;
export const MAX_NUMBER = MAX_ANSWER;
export const MAX_MOVABLE_JELLIES = 5;
export const MAX_PLATE_JELLIES = 10;
export const COLLECTION_JELLY_TOTAL = 100;
export const COLLECTION_PROBLEM_COUNT = 16;
export const JELLY_COLUMNS = 5;
export const CHOICE_COUNT = 4;
export const RECENT_PROBLEM_LIMIT = 3;
export const LONG_PRESS_MS = 1000;
export const LONG_PRESS_MOVE_TOLERANCE = 12;

export const STORAGE_KEYS = {
  settings: "sansu-jellies:settings:v1",
  progress: "sansu-jellies:progress:v1"
} as const;

export const LEVEL_CONFIG: Record<Level, { maxAdditionAnswer: number; draggable: boolean; showMergedCount: boolean }> = {
  1: {
    maxAdditionAnswer: MAX_ANSWER,
    draggable: true,
    showMergedCount: true
  },
  2: {
    maxAdditionAnswer: MAX_ANSWER,
    draggable: true,
    showMergedCount: false
  },
  3: {
    maxAdditionAnswer: MAX_ANSWER,
    draggable: false,
    showMergedCount: false
  }
};

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: 1,
  mode: "addition",
  level: 1,
  soundEnabled: true,
  soundVolume: 0.8,
  hapticsEnabled: true,
  assistEnabled: true,
  setupCompleted: false
};

function createSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function countAnswerPlans(slots: number, total: number, memo = new Map<string, number>()): number {
  const key = `${slots}:${total}`;

  if (memo.has(key)) {
    return memo.get(key) ?? 0;
  }

  if (slots === 0) {
    return total === 0 ? 1 : 0;
  }

  const minPossible = slots * MIN_ANSWER;
  const maxPossible = slots * MAX_ANSWER;

  if (total < minPossible || total > maxPossible) {
    return 0;
  }

  let count = 0;

  for (let value = MIN_ANSWER; value <= MAX_ANSWER; value += 1) {
    count += countAnswerPlans(slots - 1, total - value, memo);
  }

  memo.set(key, count);
  return count;
}

export function createAnswerPlan(): number[] {
  const plan: number[] = [];
  const memo = new Map<string, number>();
  let remainingTotal = COLLECTION_JELLY_TOTAL;
  let remainingSlots = COLLECTION_PROBLEM_COUNT;

  while (remainingSlots > 0) {
    const candidates = Array.from({ length: MAX_ANSWER - MIN_ANSWER + 1 }, (_, index) => {
      const value = MIN_ANSWER + index;

      return {
        value,
        ways: countAnswerPlans(remainingSlots - 1, remainingTotal - value, memo)
      };
    }).filter((candidate) => candidate.ways > 0);
    const totalWays = candidates.reduce((sum, candidate) => sum + candidate.ways, 0);
    let roll = Math.random() * totalWays;
    const picked = candidates.find((candidate) => {
      roll -= candidate.ways;
      return roll <= 0;
    }) ?? candidates[candidates.length - 1];

    plan.push(picked.value);
    remainingTotal -= picked.value;
    remainingSlots -= 1;
  }

  return plan;
}

export function createCollectionSession(): CollectionSession {
  return {
    schemaVersion: 1,
    id: createSessionId(),
    targetTotal: COLLECTION_JELLY_TOTAL,
    totalRounds: COLLECTION_PROBLEM_COUNT,
    answerPlan: createAnswerPlan(),
    currentIndex: 0,
    collectedStack: [],
    collectedTotal: 0,
    status: "active"
  };
}

export function advanceCollectionSession(session: CollectionSession): CollectionSession {
  if (session.status === "completed" || session.currentIndex >= session.totalRounds) {
    return session;
  }

  const nextIndex = Math.min(session.currentIndex + 1, session.totalRounds);
  const collectedStack = session.answerPlan.slice(0, nextIndex);
  const collectedTotal = sum(collectedStack);
  const completed = nextIndex === session.totalRounds && collectedTotal === session.targetTotal;

  return {
    ...session,
    currentIndex: nextIndex,
    collectedStack,
    collectedTotal,
    status: completed ? "completed" : "active"
  };
}

export function createDefaultProgress(): ProgressState {
  return {
    schemaVersion: 2,
    totalAnswered: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastProblemIds: [],
    collectionSession: createCollectionSession()
  };
}

export const DEFAULT_PROGRESS: ProgressState = createDefaultProgress();
