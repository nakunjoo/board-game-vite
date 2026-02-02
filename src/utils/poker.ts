import type { Card } from "../types/game";

export type HandRank =
  | "high-card"
  | "one-pair"
  | "two-pair"
  | "three-of-a-kind"
  | "straight"
  | "flush"
  | "full-house"
  | "four-of-a-kind"
  | "straight-flush"
  | "royal-straight-flush";

export interface HandResult {
  rank: HandRank;
  rankName: string;
  detailName: string; // 상세 정보 (예: "A 하이카드", "K 원페어", "A 탑 스트레이트")
  cards: Card[];
  score: number;
}

// value는 1-13 (Ace=1, Jack=11, Queen=12, King=13)
// 하지만 포커에서는 A가 가장 강하므로 14로 변환
const VALUE_TO_RANK: { [key: number]: number } = {
  1: 14,  // A
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11, // J
  12: 12, // Q
  13: 13  // K
};

const HAND_SCORES = {
  "high-card": 1,
  "one-pair": 2,
  "two-pair": 3,
  "three-of-a-kind": 4,
  "straight": 5,
  "flush": 6,
  "full-house": 7,
  "four-of-a-kind": 8,
  "straight-flush": 9,
  "royal-straight-flush": 10
};

const HAND_NAMES = {
  "high-card": "하이카드",
  "one-pair": "원페어",
  "two-pair": "투페어",
  "three-of-a-kind": "트리플",
  "straight": "스트레이트",
  "flush": "플러시",
  "full-house": "풀하우스",
  "four-of-a-kind": "포카드",
  "straight-flush": "스트레이트 플러시",
  "royal-straight-flush": "로얄 스트레이트 플러시"
};

function getRankValue(value: number): number {
  return VALUE_TO_RANK[value] || value;
}

function getValueDisplayName(value: number): string {
  if (value === 1) return "A";
  if (value === 11) return "J";
  if (value === 12) return "Q";
  if (value === 13) return "K";
  return value.toString();
}

function countRanks(cards: Card[]): Map<number, Card[]> {
  const counts = new Map<number, Card[]>();
  for (const card of cards) {
    const existing = counts.get(card.value) || [];
    existing.push(card);
    counts.set(card.value, existing);
  }
  return counts;
}

function countSuits(cards: Card[]): Map<string, Card[]> {
  const counts = new Map<string, Card[]>();
  for (const card of cards) {
    const existing = counts.get(card.type) || [];
    existing.push(card);
    counts.set(card.type, existing);
  }
  return counts;
}

function isStraight(cards: Card[]): boolean {
  if (cards.length < 5) return false;

  const sortedCards = [...cards].sort((a, b) => getRankValue(a.value) - getRankValue(b.value));

  // 일반 스트레이트 체크
  for (let i = 0; i <= sortedCards.length - 5; i++) {
    let isConsecutive = true;
    for (let j = 0; j < 4; j++) {
      if (getRankValue(sortedCards[i + j + 1].value) !== getRankValue(sortedCards[i + j].value) + 1) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) return true;
  }

  // A-2-3-4-5 스트레이트 체크 (백스트레이트)
  const hasAce = sortedCards.some(c => c.value === 1);
  const has2 = sortedCards.some(c => c.value === 2);
  const has3 = sortedCards.some(c => c.value === 3);
  const has4 = sortedCards.some(c => c.value === 4);
  const has5 = sortedCards.some(c => c.value === 5);

  if (hasAce && has2 && has3 && has4 && has5) return true;

  return false;
}

function getStraightCards(cards: Card[]): Card[] {
  if (cards.length < 5) return [];

  const sortedCards = [...cards].sort((a, b) => getRankValue(a.value) - getRankValue(b.value));

  // 일반 스트레이트 찾기
  for (let i = 0; i <= sortedCards.length - 5; i++) {
    let isConsecutive = true;
    for (let j = 0; j < 4; j++) {
      if (getRankValue(sortedCards[i + j + 1].value) !== getRankValue(sortedCards[i + j].value) + 1) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) {
      return sortedCards.slice(i, i + 5);
    }
  }

  // A-2-3-4-5 백스트레이트
  const ace = sortedCards.find(c => c.value === 1);
  const two = sortedCards.find(c => c.value === 2);
  const three = sortedCards.find(c => c.value === 3);
  const four = sortedCards.find(c => c.value === 4);
  const five = sortedCards.find(c => c.value === 5);

  if (ace && two && three && four && five) {
    return [ace, two, three, four, five];
  }

  return [];
}

function isFlush(cards: Card[]): boolean {
  const suitCounts = countSuits(cards);
  for (const count of suitCounts.values()) {
    if (count.length >= 5) return true;
  }
  return false;
}

function getFlushCards(cards: Card[]): Card[] {
  const suitCounts = countSuits(cards);
  for (const suitCards of suitCounts.values()) {
    if (suitCards.length >= 5) {
      return suitCards.sort((a, b) => getRankValue(b.value) - getRankValue(a.value)).slice(0, 5);
    }
  }
  return [];
}

function isStraightFlush(cards: Card[]): boolean {
  const suitCounts = countSuits(cards);
  for (const suitCards of suitCounts.values()) {
    if (suitCards.length >= 5 && isStraight(suitCards)) {
      return true;
    }
  }
  return false;
}

function getStraightFlushCards(cards: Card[]): Card[] {
  const suitCounts = countSuits(cards);
  for (const suitCards of suitCounts.values()) {
    if (suitCards.length >= 5) {
      const straightCards = getStraightCards(suitCards);
      if (straightCards.length === 5) {
        return straightCards;
      }
    }
  }
  return [];
}

function isRoyalStraightFlush(cards: Card[]): boolean {
  const straightFlushCards = getStraightFlushCards(cards);
  if (straightFlushCards.length === 5) {
    const values = straightFlushCards.map(c => c.value).sort((a, b) => a - b);
    // 1(A), 10, 11(J), 12(Q), 13(K)
    return values.join(",") === "1,10,11,12,13";
  }
  return false;
}

export function evaluateHand(myCards: Card[], openCards: Card[]): HandResult {
  const allCards = [...myCards, ...openCards];

  // 로얄 스트레이트 플러시
  if (isRoyalStraightFlush(allCards)) {
    const cards = getStraightFlushCards(allCards);
    return {
      rank: "royal-straight-flush",
      rankName: HAND_NAMES["royal-straight-flush"],
      detailName: "10-J-Q-K-A 로얄 스트레이트 플러시",
      cards,
      score: HAND_SCORES["royal-straight-flush"]
    };
  }

  // 스트레이트 플러시
  if (isStraightFlush(allCards)) {
    const cards = getStraightFlushCards(allCards);
    const topCard = cards.sort((a, b) => getRankValue(b.value) - getRankValue(a.value))[0];
    return {
      rank: "straight-flush",
      rankName: HAND_NAMES["straight-flush"],
      detailName: `${getValueDisplayName(topCard.value)} 탑 스트레이트 플러시`,
      cards,
      score: HAND_SCORES["straight-flush"]
    };
  }

  const rankCounts = countRanks(allCards);
  const countArray = Array.from(rankCounts.entries()).sort((a, b) => {
    if (b[1].length !== a[1].length) {
      return b[1].length - a[1].length;
    }
    return getRankValue(b[0]) - getRankValue(a[0]);
  });

  // 포카드
  if (countArray.length > 0 && countArray[0][1].length === 4) {
    const value = countArray[0][0];
    return {
      rank: "four-of-a-kind",
      rankName: HAND_NAMES["four-of-a-kind"],
      detailName: `${getValueDisplayName(value)} 포카드`,
      cards: countArray[0][1],
      score: HAND_SCORES["four-of-a-kind"]
    };
  }

  // 풀하우스
  if (countArray.length >= 2 && countArray[0][1].length === 3 && countArray[1][1].length >= 2) {
    const tripleValue = countArray[0][0];
    const pairValue = countArray[1][0];
    return {
      rank: "full-house",
      rankName: HAND_NAMES["full-house"],
      detailName: `${getValueDisplayName(tripleValue)} 풀하우스 (${getValueDisplayName(pairValue)} 페어)`,
      cards: [...countArray[0][1], ...countArray[1][1].slice(0, 2)],
      score: HAND_SCORES["full-house"]
    };
  }

  // 플러시
  if (isFlush(allCards)) {
    const flushCards = getFlushCards(allCards);
    const topCard = flushCards[0];
    return {
      rank: "flush",
      rankName: HAND_NAMES["flush"],
      detailName: `${getValueDisplayName(topCard.value)} 탑 플러시`,
      cards: flushCards,
      score: HAND_SCORES["flush"]
    };
  }

  // 스트레이트
  if (isStraight(allCards)) {
    const straightCards = getStraightCards(allCards);
    const topCard = straightCards.sort((a, b) => getRankValue(b.value) - getRankValue(a.value))[0];
    // 백스트레이트 (A-2-3-4-5) 체크
    const isBackStraight = straightCards.some(c => c.value === 1) && straightCards.some(c => c.value === 5);
    return {
      rank: "straight",
      rankName: HAND_NAMES["straight"],
      detailName: isBackStraight ? "5 탑 스트레이트" : `${getValueDisplayName(topCard.value)} 탑 스트레이트`,
      cards: straightCards,
      score: HAND_SCORES["straight"]
    };
  }

  // 트리플
  if (countArray.length > 0 && countArray[0][1].length === 3) {
    const value = countArray[0][0];
    return {
      rank: "three-of-a-kind",
      rankName: HAND_NAMES["three-of-a-kind"],
      detailName: `${getValueDisplayName(value)} 트리플`,
      cards: countArray[0][1],
      score: HAND_SCORES["three-of-a-kind"]
    };
  }

  // 투페어
  if (countArray.length >= 2 && countArray[0][1].length === 2 && countArray[1][1].length === 2) {
    const highValue = countArray[0][0];
    const lowValue = countArray[1][0];
    return {
      rank: "two-pair",
      rankName: HAND_NAMES["two-pair"],
      detailName: `${getValueDisplayName(highValue)}-${getValueDisplayName(lowValue)} 투페어`,
      cards: [...countArray[0][1], ...countArray[1][1]],
      score: HAND_SCORES["two-pair"]
    };
  }

  // 원페어
  if (countArray.length > 0 && countArray[0][1].length === 2) {
    const value = countArray[0][0];
    return {
      rank: "one-pair",
      rankName: HAND_NAMES["one-pair"],
      detailName: `${getValueDisplayName(value)} 원페어`,
      cards: countArray[0][1],
      score: HAND_SCORES["one-pair"]
    };
  }

  // 하이카드
  const highCard = allCards.sort((a, b) => getRankValue(b.value) - getRankValue(a.value))[0];
  return {
    rank: "high-card",
    rankName: HAND_NAMES["high-card"],
    detailName: `${getValueDisplayName(highCard.value)} 하이카드`,
    cards: [highCard],
    score: HAND_SCORES["high-card"]
  };
}
