/** 서버 drawing.handler.ts의 StrokeOp와 같은 모양. 좌표는 그림판 크기와 무관하게 0~1000 */
export type StrokeOp =
  | { t: "b"; id: number; c: string; s: number; p: number[] }
  | { t: "m"; id: number; p: number[] }
  | { t: "u" }
  | { t: "x" };

export interface Stroke {
  id: number;
  color: string;
  size: number;
  points: number[];
}

export type DrawingPhase = "waiting" | "choose" | "draw" | "reveal" | "over";

export type DrawingViewMode = "bubble" | "chat";

export interface DrawingRankEntry {
  playerId: string;
  nickname: string;
  score: number;
  rank: number;
}

export interface DrawingGameOver {
  reason: "finished" | "notEnough";
  ranking: DrawingRankEntry[];
}

/** roomJoined에 실려 오는 진행 상태 (재연결 복원용) */
export interface DrawingRestoreState {
  totalRounds: number;
  drawTimeSec: number;
  round: number;
  turnOrder: string[];
  phase: "choose" | "draw" | "reveal";
  drawerId: string;
  word: string | null;
  choices: string[] | null;
  hint: (string | null)[];
  strokes: Stroke[];
  guessed: string[];
  scores: Record<string, number>;
  gains: Record<string, number> | null;
  timeLeftMs: number;
  away: string[];
}

export interface DrawingSeat {
  playerId: string;
  nickname: string;
  color: string;
  score: number;
  isDrawer: boolean;
  guessed: boolean;
  away: boolean;
  isMe: boolean;
}

/** 말풍선 하나 (사람마다 최신 1개) */
export interface DrawingBubble {
  key: number;
  text: string;
  kind: "chat" | "correct" | "insider";
}
