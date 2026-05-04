import type { SoundId } from "../game/types";

export type SoundConfig = {
  id: SoundId;
  sources: string[];
  volume: number;
  minIntervalMs: number;
};

export const SOUND_MANIFEST: SoundConfig[] = [
  { id: "jellyGrab", sources: [], volume: 0.45, minIntervalMs: 80 },
  { id: "jellyDrop", sources: [], volume: 0.38, minIntervalMs: 100 },
  { id: "jellySnap", sources: [], volume: 0.55, minIntervalMs: 120 },
  { id: "answerWrong", sources: [], volume: 0.42, minIntervalMs: 220 },
  { id: "answerCorrect", sources: [], volume: 0.62, minIntervalMs: 300 },
  { id: "successFanfare", sources: [], volume: 0.52, minIntervalMs: 900 },
  { id: "uiTap", sources: [], volume: 0.32, minIntervalMs: 80 },
  { id: "menuOpen", sources: [], volume: 0.36, minIntervalMs: 250 },
  { id: "nextProblem", sources: [], volume: 0.35, minIntervalMs: 160 }
];
