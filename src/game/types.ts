export type GameMode = "addition" | "subtraction";

export type Level = 1 | 2 | 3;

export type GameState = "presenting" | "dropping" | "manipulating" | "answering" | "correct" | "wrong";

export type TransferDirection = "right-to-left" | "left-to-right";

export type JellyColor = "blue" | "red" | "yellow" | "green" | "purple";

export type Problem = {
  id: string;
  mode: GameMode;
  left: number;
  right: number;
  answer: number;
  leftColor: JellyColor;
  rightColor: JellyColor;
  collectionSessionId: string;
  collectionIndex: number;
  jellyCount: number;
  transferDirection: TransferDirection;
  movableCount: number;
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
  assistEnabled: boolean;
  setupCompleted: boolean;
};

export type CollectionSession = {
  schemaVersion: 1;
  id: string;
  targetTotal: number;
  totalRounds: number;
  answerPlan: number[];
  currentIndex: number;
  collectedStack: number[];
  collectedTotal: number;
  status: "active" | "completed";
};

export type ProgressState = {
  schemaVersion: 2;
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  lastProblemIds: string[];
  collectionSession: CollectionSession;
};

export type JellyGroup = "left" | "right" | "merged" | "removed";

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
