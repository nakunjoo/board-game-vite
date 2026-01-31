import type { Card } from "../types/game";

// 카드 이미지 경로 반환
export const getCardImage = (card: Card): string => {
  return card.image;
};

// 카드 고유 이름 반환
export const getCardName = (card: Card): string => {
  return card.name;
};
