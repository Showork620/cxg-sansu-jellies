export type FeedbackEventId =
  | "jellyPress"
  | "jellyDragStart"
  | "jellyDragMove"
  | "jellyDropMiss"
  | "jellyDropSuccess"
  | "jellyMergeComplete"
  | "answerPress"
  | "answerWrong"
  | "answerCorrect"
  | "menuLongPressProgress"
  | "menuOpen"
  | "nextProblem";

export type HapticPatternId = "none" | "tap" | "softTick" | "softImpact" | "success" | "wrong";
