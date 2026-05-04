import type { HapticPatternId } from "./feedbackTypes";

const HAPTIC_PATTERNS: Record<HapticPatternId, number | number[]> = {
  none: 0,
  tap: 8,
  softTick: 12,
  softImpact: 18,
  success: [18, 35, 28],
  wrong: [12, 30, 12]
};

const MIN_INTERVAL_MS: Record<HapticPatternId, number> = {
  none: 0,
  tap: 70,
  softTick: 90,
  softImpact: 130,
  success: 550,
  wrong: 320
};

let lastHapticAt = 0;

export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator && typeof navigator.vibrate === "function";
}

export function playHaptic(
  patternId: HapticPatternId,
  options: { enabled: boolean; reducedMotion: boolean }
): void {
  if (!options.enabled || patternId === "none" || !canVibrate()) {
    return;
  }

  if (typeof document !== "undefined" && document.visibilityState !== "visible") {
    return;
  }

  if (options.reducedMotion && patternId !== "success") {
    return;
  }

  const now = performance.now();

  if (now - lastHapticAt < MIN_INTERVAL_MS[patternId]) {
    return;
  }

  lastHapticAt = now;

  try {
    navigator.vibrate(HAPTIC_PATTERNS[patternId]);
  } catch {
    // Vibration support differs across mobile browsers; failure is intentionally ignored.
  }
}
