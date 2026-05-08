export type GameMode = "addition" | "subtraction";

export type Level = 1 | 2 | 3;

export type GameState = "presenting" | "dropping" | "manipulating" | "answering" | "correct" | "wrong";

export type Problem = {
  id: string;
  mode: GameMode;
  left: number;
  right: number;
  answer: number;
};

export type CharacterState = "idle" | "watching" | "thinking" | "confused" | "happy" | "excited";

export type SoundId =
  | "uiTap"
  | "menuOpen"
  | "jellyGrab"
  | "jellyDrop"
  | "jellySnap"
  | "answerWrong"
  | "answerCorrect"
  | "successFanfare"
  | "nextProblem";

export type AppSettings = {
  schemaVersion: 1;
  mode: GameMode;
  level: Level;
  soundEnabled: boolean;
  soundVolume: number;
  hapticsEnabled: boolean;
  setupCompleted: boolean;
};

export type ProgressState = {
  schemaVersion: 1;
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  lastProblemIds: string[];
};

export type JellyGroup = "left" | "right" | "merged" | "removed";

export type JellyColor = "blue" | "red" | "green";

export type Jelly = {
  id: string;
  valueGroup: JellyGroup;
  color: JellyColor;
  index: number;
  placed: boolean;
};

export type DragResult = {
  jellyId: string;
  dropped: boolean;
};
