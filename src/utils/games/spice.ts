import type { Card, GameConfig } from "../../types/game";

// 향신료 문양 3종
const SPICE_SUITS = ["pepper", "cinnamon", "saffron"] as const;

// 문양별 색상 (렌더링에 활용)
export const SPICE_SUIT_COLORS: Record<string, string> = {
  pepper: "#27ae60",
  cinnamon: "#c0392b",
  saffron: "#f39c12",
  "wild-number": "#8e44ad",
  "wild-suit": "#2980b9",
};

// 문양별 아이콘 (이모지 깨짐 방지: 텍스트 기반)
export const SPICE_SUIT_LABELS: Record<string, string> = {
  pepper: "P",
  cinnamon: "C",
  saffron: "S",
  "wild-number": "W",
  "wild-suit": "W",
};

// 문양별 한글 이름
export const SPICE_SUIT_NAMES: Record<string, string> = {
  pepper: "후추",
  cinnamon: "계피",
  saffron: "사프란",
  "wild-number": "와일드",
  "wild-suit": "와일드",
};

// 향신료 덱 생성 (100장)
//  - 문양 3종 × 숫자 1~10 × 각 3장 = 90장
//  - 와일드-숫자: 1~10 각 1장   = 10장
//  합계 100장
const createDeck = (): Card[] => {
  const deck: Card[] = [];

  // 일반 카드: 문양 3종 × 1~10 × 3장
  for (const suit of SPICE_SUITS) {
    for (let value = 1; value <= 10; value++) {
      for (let copy = 1; copy <= 3; copy++) {
        deck.push({
          type: suit,
          value,
          image: "",
          name: `${suit}_${value}_${copy}`,
        });
      }
    }
  }

  // 와일드-숫자: 1~10 각 1장
  for (let value = 1; value <= 10; value++) {
    deck.push({
      type: "wild-number",
      value,
      image: "",
      name: `wild_number_${value}`,
    });
  }

  return deck;
};

export const SPICE_CONFIG: GameConfig = {
  gameType: "spice",
  displayName: "향신료",
  createDeck,
  cardBack: "",
  initialHandSize: 0,
  maxPlayers: 6,
};
