import type { Card, GameConfig } from "../../types/game";

// 스컬킹 수트 색상
export const SKULKING_SUIT_COLORS: Record<string, string> = {
  "sk-black": "#1a1a2e",
  "sk-yellow": "#f39c12",
  "sk-purple": "#8e44ad",
  "sk-green": "#27ae60",
  "sk-escape": "#95a5a6",
  "sk-pirate": "#e74c3c",
  "sk-mermaid": "#3498db",
  "sk-skulking": "#2c3e50",
  "sk-tigress": "#e67e22",
};

// 수트별 한글 이름
export const SKULKING_SUIT_NAMES: Record<string, string> = {
  "sk-black": "졸리 로저 (검정)",
  "sk-yellow": "보물 상자 (노랑)",
  "sk-purple": "졸리 로저 (보라)",
  "sk-green": "인어의 왕관 (초록)",
  "sk-escape": "탈출",
  "sk-pirate": "해적",
  "sk-mermaid": "인어",
  "sk-skulking": "해골왕",
  "sk-tigress": "타이그레스",
};

// 수트별 짧은 라벨
export const SKULKING_SUIT_LABELS: Record<string, string> = {
  "sk-black": "♠",
  "sk-yellow": "★",
  "sk-purple": "♦",
  "sk-green": "♣",
  "sk-escape": "E",
  "sk-pirate": "P",
  "sk-mermaid": "M",
  "sk-skulking": "☠",
  "sk-tigress": "T",
};

// 특수 카드 여부
export const isSpecialCard = (type: string): boolean =>
  ["sk-escape", "sk-pirate", "sk-mermaid", "sk-skulking", "sk-tigress"].includes(type);

// 스컬킹 덱 생성 (66장)
const createDeck = (): Card[] => {
  const suits = ["sk-black", "sk-yellow", "sk-purple", "sk-green"] as const;
  const deck: Card[] = [];

  // 숫자 수트 4종 × 1~13 = 52장
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        type: suit,
        value,
        image: "",
        name: `${suit}_${value}`,
      });
    }
  }

  // Escape 5장
  for (let i = 1; i <= 5; i++) {
    deck.push({ type: "sk-escape", value: 0, image: "", name: `escape_${i}` });
  }

  // Pirate 5장
  for (let i = 1; i <= 5; i++) {
    deck.push({ type: "sk-pirate", value: 0, image: "", name: `pirate_${i}` });
  }

  // Mermaid 2장
  for (let i = 1; i <= 2; i++) {
    deck.push({ type: "sk-mermaid", value: 0, image: "", name: `mermaid_${i}` });
  }

  // Skull King 1장
  deck.push({ type: "sk-skulking", value: 0, image: "", name: "skull_king" });

  // Tigress 1장
  deck.push({ type: "sk-tigress", value: 0, image: "", name: "tigress" });

  return deck;
};

export const SKULKING_CONFIG: GameConfig = {
  gameType: "skulking",
  displayName: "스컬킹",
  createDeck,
  cardBack: "",
  initialHandSize: 0,
  maxPlayers: 6,
};
