import { soundManager } from "../audio/soundManager";
import type { SoundId } from "../game/types";
import type { FeedbackEventId, HapticPatternId } from "./feedbackTypes";
import { playHaptic } from "./haptics";
import { playVisualFeedback } from "./visualFeedback";

export type FeedbackOptions = {
  visualTarget?: HTMLElement | null;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
};

const SOUND_BY_EVENT: Partial<Record<FeedbackEventId, SoundId | SoundId[]>> = {
  jellyDragStart: "jellyGrab",
  jellyDropMiss: "jellyDrop",
  jellyDropSuccess: "jellySnap",
  answerPress: "uiTap",
  answerWrong: "answerWrong",
  answerCorrect: ["answerCorrect", "successFanfare"],
  menuOpen: "menuOpen",
  nextProblem: "nextProblem"
};

const HAPTIC_BY_EVENT: Partial<Record<FeedbackEventId, HapticPatternId>> = {
  jellyPress: "tap",
  jellyDragStart: "softTick",
  jellyDropMiss: "softTick",
  jellyDropSuccess: "softImpact",
  jellyPackTighten: "softTick",
  jellyMergeComplete: "softImpact",
  answerPress: "tap",
  answerWrong: "wrong",
  answerCorrect: "success",
  menuOpen: "softTick",
  nextProblem: "tap"
};

export function playFeedback(eventId: FeedbackEventId, options: FeedbackOptions): void {
  playVisualFeedback(eventId, options.visualTarget, options.reducedMotion);

  const soundIds = SOUND_BY_EVENT[eventId];

  if (Array.isArray(soundIds)) {
    soundIds.forEach((soundId, index) => {
      soundManager.play(soundId, {
        enabled: options.soundEnabled,
        delayMs: index === 0 ? 0 : 90
      });
    });
  } else if (soundIds) {
    soundManager.play(soundIds, { enabled: options.soundEnabled });
  }

  playHaptic(HAPTIC_BY_EVENT[eventId] ?? "none", {
    enabled: options.hapticsEnabled,
    reducedMotion: options.reducedMotion
  });
}
