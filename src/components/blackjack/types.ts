import type { Card } from "../../types/game";

export interface BjHand {
  cards: Card[];
  bet: number;
  status: "active" | "stand" | "bust" | "blackjack" | "doubled";
  result?: "win" | "lose" | "push";
  payout?: number;
}

export interface BjPlayerInfo {
  playerId: string;
  nickname: string;
  order: number;
  chips: number;
  // 액션 페이즈에서 타인 핸드는 카드 수 + 상태만 공개
  handInfo: Array<{ cardCount: number; status: string; bet: number; value: number }>;
  actionDone: boolean;
  bettingDone: boolean;
}

export interface BjDealerState {
  visibleCards: Card[]; // 딜러 페이즈 전: 1장, 이후: 전체
  handValue: number;
  isBust: boolean;
  isBlackjack: boolean;
}

export interface BjHandResult {
  cards: Card[];
  value: number;
  result: "win" | "lose" | "push";
  bet: number;
  payout: number;
  isBlackjack: boolean;
}

export interface BjPlayerResult {
  playerId: string;
  nickname: string;
  hands: BjHandResult[];
  chipsAfter: number;
}

export interface BjRoundResult {
  round: number;
  totalRounds: number;
  dealerHand: Card[];
  dealerValue: number;
  dealerBust: boolean;
  dealerBlackjack: boolean;
  playerResults: BjPlayerResult[];
  chips: Record<string, number>;
}
