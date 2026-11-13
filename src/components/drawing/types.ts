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

/** guess: 그리기 시간이 끝난 뒤 맞히기만 하는 30초 */
/** ready: 뽑힌 제시어를 그리는 사람이 확인하는 3초 */
export type DrawingPhase = "waiting" | "firstDraw" | "ready" | "draw" | "guess" | "reveal" | "over";

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
  turnNumber: number;
  totalTurns: number;
  turnOrder: string[];
  phase: "firstDraw" | "ready" | "draw" | "guess" | "reveal";
  firstDraw: Record<string, number>;
  firstPlayerId: string | null;
  nextDrawerId: string | null;
  drawerId: string;
  word: string | null;
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
