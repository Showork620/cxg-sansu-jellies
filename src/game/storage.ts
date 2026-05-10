import {
  COLLECTION_JELLY_TOTAL,
  COLLECTION_PROBLEM_COUNT,
  DEFAULT_SETTINGS,
  MAX_ANSWER,
  MIN_ANSWER,
  RECENT_PROBLEM_LIMIT,
  STORAGE_KEYS,
  createCollectionSession,
  createDefaultProgress
} from "./constants";
import type { AppSettings, CollectionSession, GameMode, Level, ProgressState } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMode(value: unknown): value is GameMode {
  return value === "addition" || value === "subtraction";
}

function isLevel(value: unknown): value is Level {
  return value === 1 || value === 2 || value === 3;
}

function isWholeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function isValidAnswerPlan(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === COLLECTION_PROBLEM_COUNT &&
    value.every((answer) => isWholeNumber(answer) && answer >= MIN_ANSWER && answer <= MAX_ANSWER) &&
    sum(value) === COLLECTION_JELLY_TOTAL
  );
}

function readJson(key: string): unknown {
  try {
    return window.localStorage.getItem(key) ? JSON.parse(window.localStorage.getItem(key) ?? "") : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // LocalStorage can be unavailable in private browsing or constrained PWA contexts.
  }
}

export function sanitizeSettings(value: unknown): AppSettings {
  if (!isObject(value) || value.schemaVersion !== 1) {
    return DEFAULT_SETTINGS;
  }

  return {
    schemaVersion: 1,
    mode: isMode(value.mode) ? value.mode : DEFAULT_SETTINGS.mode,
    level: isLevel(value.level) ? value.level : DEFAULT_SETTINGS.level,
    soundEnabled: typeof value.soundEnabled === "boolean" ? value.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    soundVolume:
      typeof value.soundVolume === "number" && value.soundVolume >= 0 && value.soundVolume <= 1
        ? value.soundVolume
        : DEFAULT_SETTINGS.soundVolume,
    hapticsEnabled: typeof value.hapticsEnabled === "boolean" ? value.hapticsEnabled : DEFAULT_SETTINGS.hapticsEnabled,
    assistEnabled: typeof value.assistEnabled === "boolean" ? value.assistEnabled : DEFAULT_SETTINGS.assistEnabled,
    setupCompleted: typeof value.setupCompleted === "boolean" ? value.setupCompleted : DEFAULT_SETTINGS.setupCompleted
  };
}

export function sanitizeCollectionSession(value: unknown): CollectionSession {
  if (!isObject(value) || value.schemaVersion !== 1 || !isValidAnswerPlan(value.answerPlan)) {
    return createCollectionSession();
  }

  const rawIndex = isWholeNumber(value.currentIndex) ? value.currentIndex : 0;
  const currentIndex = clamp(rawIndex, 0, COLLECTION_PROBLEM_COUNT);
  const answerPlan = [...value.answerPlan];
  const collectedStack = answerPlan.slice(0, currentIndex);
  const collectedTotal = sum(collectedStack);
  const completed = currentIndex === COLLECTION_PROBLEM_COUNT && collectedTotal === COLLECTION_JELLY_TOTAL;

  return {
    schemaVersion: 1,
    id: typeof value.id === "string" && value.id.length > 0 ? value.id : createCollectionSession().id,
    targetTotal: COLLECTION_JELLY_TOTAL,
    totalRounds: COLLECTION_PROBLEM_COUNT,
    answerPlan,
    currentIndex,
    collectedStack,
    collectedTotal,
    status: completed ? "completed" : "active"
  };
}

export function sanitizeProgress(value: unknown): ProgressState {
  if (!isObject(value) || (value.schemaVersion !== 1 && value.schemaVersion !== 2)) {
    return createDefaultProgress();
  }

  const totalAnswered = typeof value.totalAnswered === "number" && value.totalAnswered >= 0 ? value.totalAnswered : 0;
  const totalCorrect = typeof value.totalCorrect === "number" && value.totalCorrect >= 0 ? value.totalCorrect : 0;
  const currentStreak = typeof value.currentStreak === "number" && value.currentStreak >= 0 ? value.currentStreak : 0;
  const bestStreak = typeof value.bestStreak === "number" && value.bestStreak >= 0 ? value.bestStreak : 0;
  const lastProblemIds = Array.isArray(value.lastProblemIds)
    ? value.lastProblemIds.filter((id): id is string => typeof id === "string").slice(-RECENT_PROBLEM_LIMIT)
    : [];

  return {
    schemaVersion: 2,
    totalAnswered,
    totalCorrect: Math.min(totalCorrect, totalAnswered),
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    lastProblemIds,
    collectionSession: sanitizeCollectionSession(value.collectionSession)
  };
}

export function loadSettings(): AppSettings {
  return sanitizeSettings(readJson(STORAGE_KEYS.settings));
}

export function saveSettings(settings: AppSettings): void {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function loadProgress(): ProgressState {
  return sanitizeProgress(readJson(STORAGE_KEYS.progress));
}

export function saveProgress(progress: ProgressState): void {
  writeJson(STORAGE_KEYS.progress, progress);
}

export function resetProgress(): ProgressState {
  const progress = createDefaultProgress();
  saveProgress(progress);
  return progress;
}
