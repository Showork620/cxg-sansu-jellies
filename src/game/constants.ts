import type { AppSettings, Level, ProgressState } from "./types";

export const MAX_NUMBER = 10;
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
    maxAdditionAnswer: 5,
    draggable: true,
    showMergedCount: true
  },
  2: {
    maxAdditionAnswer: 10,
    draggable: true,
    showMergedCount: false
  },
  3: {
    maxAdditionAnswer: 10,
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
  setupCompleted: false
};

export const DEFAULT_PROGRESS: ProgressState = {
  schemaVersion: 1,
  totalAnswered: 0,
  totalCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastProblemIds: []
};
