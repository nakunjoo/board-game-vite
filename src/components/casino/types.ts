export interface CasinoPlayer {
  playerId: string;
  nickname: string;
  balance: number;
  currentGame: string | null;
  history: { t: number; b: number }[];
}

export interface CasinoGameOverData {
  reason: "timer" | "vote";
  players: {
    playerId: string;
    nickname: string;
    finalBalance: number;
    profit: number;
    rank: number;
    gamesPlayed: Record<string, number>;
    history: { t: number; b: number }[];
  }[];
}
