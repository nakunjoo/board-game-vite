/** waiting: 시작 전 · over: 최종 결과 (나머지는 서버 phase와 같다) */
export type LiarPhase = "waiting" | "word" | "describe" | "discuss" | "liarGuess" | "result" | "over";

export interface LiarDescription {
  playerId: string;
  nickname: string;
  text: string;
  lap: number;
  skipped: boolean;
}

export interface LiarRoundResult {
  round: number;
  liarId: string;
  liarNickname: string;
  topic: string;
  word: string;
  liarWord: string;
  accusedId: string | null;
  tally: Record<string, number>;
  votes: Record<string, string>;
  liarGuess: string | null;
  winner: "liar" | "citizens" | "none";
  reason: "tie" | "wrongAccused" | "guessed" | "guessFailed" | "liarLeft";
  gains: Record<string, number>;
}

export interface LiarGameOver {
  reason: "finished" | "notEnough";
  ranking: { playerId: string; nickname: string; score: number; rank: number }[];
}

/** roomJoined.liar — 새로고침·재연결 때 복원 */
export interface LiarRestoreState {
  totalRounds: number;
  laps: number;
  discussTimeSec: number;
  round: number;
  phase: Exclude<LiarPhase, "waiting" | "over">;
  topic: string;
  word: string;
  /** 지목돼서 제시어를 맞힐 때에야 true */
  isLiar: boolean;
  speakOrder: string[];
  speakerId: string | null;
  lap: number | null;
  descriptions: LiarDescription[];
  voted: string[];
  myVote: string | null;
  accusedId: string | null;
  result: LiarRoundResult | null;
  isLast: boolean;
  scores: Record<string, number>;
  timeLeftMs: number;
  away: string[];
}

export interface LiarSeat {
  playerId: string;
  nickname: string;
  color: string;
  score: number;
  isMe: boolean;
  away: boolean;
  speaking: boolean;
  voted: boolean;
}

export interface LiarLogEntry {
  key: number;
  tone: "chat" | "desc" | "skip" | "system" | "good" | "bad";
  nickname?: string;
  color?: string;
  text: string;
}
