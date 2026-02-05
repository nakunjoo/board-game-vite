import type { Card } from "../types/game";

// 카드 이미지 경로 반환
export const getCardImage = (card: Card): string => {
  return card.image;
};

// 카드 고유 이름 반환
export const getCardName = (card: Card): string => {
  return card.name;
};

// 카드 문양 유니코드 반환
export const getSuitSymbol = (suit: string): string => {
  const symbols: Record<string, string> = {
    spades: "♠",
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
  };
  return symbols[suit] || "";
};

// 카드 값 문자열 반환 (1 or 14 -> A, 11 -> J, 12 -> Q, 13 -> K)
export const getCardValueLabel = (value: number): string => {
  if (value === 1 || value === 14) return "A";
  if (value === 11) return "J";
  if (value === 12) return "Q";
  if (value === 13) return "K";
  return value.toString();
};

// 카드 레이블 반환 (예: "♠A", "♥10")
export const getCardLabel = (card: Card): string => {
  return `${getSuitSymbol(card.type)}${getCardValueLabel(card.value)}`;
};
