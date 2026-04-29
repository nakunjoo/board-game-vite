import type { GameConfig } from "../../types/game";

// 방장이 선택할 수 있는 초기 칩 옵션
export const BJ_INITIAL_CHIPS_OPTIONS = [50, 100, 200, 500] as const;

// 최대 베팅 = 초기 칩 / 2
export function getBjMaxBet(initialChips: number): number {
  return Math.floor(initialChips / 2);
}

// 칩 수에 따른 베팅 단위 (균등 분할 4단계)
export function getBjBetChips(initialChips: number): number[] {
  const max = getBjMaxBet(initialChips);
  const step = Math.max(1, Math.floor(max / 4));
  return [step, step * 2, step * 3, max];
}

export const BJ_ACTION_TIME_LIMIT = 30; // 초

// 수트 색상 (표준 카드와 동일)
export const BJ_SUIT_COLORS: Record<string, string> = {
  clubs: "#1a1a2e",
  spades: "#16213e",
  hearts: "#e74c3c",
  diamonds: "#e74c3c",
};

export const BJ_SUIT_SYMBOLS: Record<string, string> = {
  clubs: "♣",
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
};

export const BLACKJACK_CONFIG: GameConfig = {
  gameType: "blackjack",
  displayName: "블랙잭",
  minPlayers: 2,
  maxPlayers: 5,
};
