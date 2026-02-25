import type { Card } from "../../types/game";

export interface TrickEntry {
  playerId: string;
  nickname: string;
  card: Card;
  tigressDeclared?: "escape" | "pirate";
}

export interface SkulkingPlayer {
  playerId: string;
  nickname: string;
  isMe: boolean;
  order: number;
  cardCount: number;
  bid?: number;        // undefined = 아직 비드 안 함
  tricks: number;      // 이번 라운드 획득 트릭 수
  score: number;       // 누적 점수
  roundScores: number[]; // 라운드별 점수 기록
}

export interface RoundResult {
  round: number;
  bids: Record<string, number>;
  tricks: Record<string, number>;
  roundScores: Record<string, number>;
  totalScores: Record<string, number>;
  roundScoreHistory: Record<string, number[]>;
  roundBidTrickHistory: Array<{ round: number; bids: Record<string, number>; tricks: Record<string, number> }>;
  isLastRound: boolean;
}

export interface GameOverResult {
  finalScores: Record<string, number>;
  ranking: Array<{
    playerId: string;
    nickname: string;
    score: number;
    rank: number;
  }>;
  roundScoreHistory: Record<string, number[]>;
}
