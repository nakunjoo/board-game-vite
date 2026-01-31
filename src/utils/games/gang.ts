import type { Card, GameConfig } from "../../types/game";

const TYPES = ["clubs", "diamonds", "hearts", "spades"] as const;

const getValueFileName = (value: number): string => {
  switch (value) {
    case 1:
      return "ace";
    case 11:
      return "jack";
    case 12:
      return "queen";
    case 13:
      return "king";
    default:
      return String(value);
  }
};

// 52장 표준 카드 덱 생성
const createDeck = (): Card[] => {
  return TYPES.flatMap((type) =>
    Array.from({ length: 13 }, (_, i) => {
      const value = i + 1;
      const valueName = getValueFileName(value);
      return {
        type,
        value,
        image: `/images/cards/${type}_${valueName}.svg`,
        name: `${type}_${valueName}`,
      };
    })
  );
};

// 배열 셔플 (Fisher-Yates)
export const shuffleCards = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 셔플된 덱 생성
export const createShuffledDeck = (): Card[] => {
  return shuffleCards(createDeck());
};

// 덱에서 카드 한 장 뽑기
export const drawCard = (
  deck: Card[]
): { card: Card | null; remainingDeck: Card[] } => {
  if (deck.length === 0) {
    return { card: null, remainingDeck: [] };
  }
  const card = deck[deck.length - 1];
  const remainingDeck = deck.slice(0, -1);
  return { card, remainingDeck };
};

// 덱에서 여러 장 뽑기
export const drawCards = (
  deck: Card[],
  count: number
): { cards: Card[]; remainingDeck: Card[] } => {
  const cards: Card[] = [];
  let currentDeck = [...deck];

  for (let i = 0; i < count && currentDeck.length > 0; i++) {
    const { card, remainingDeck } = drawCard(currentDeck);
    if (card) {
      cards.push(card);
      currentDeck = remainingDeck;
    }
  }

  return { cards, remainingDeck: currentDeck };
};

export const GANG_CONFIG: GameConfig = {
  gameType: "gang",
  displayName: "갱스터",
  createDeck,
  cardBack: "/images/cards/back.svg",
  initialHandSize: 0,
  maxPlayers: 6,
};
