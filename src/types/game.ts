// 플레이어 좌석 위치 타입
export interface SeatPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

// 플레이어 타입
export interface Player {
  nickname: string;
  isMe: boolean;
  order?: number;
}

// 카드 타입
export interface Card {
  type: string;   // "spades", "hearts", "diamonds", "clubs"
  value: number;  // 1-13 (Ace=1, Jack=11, Queen=12, King=13)
  image: string;  // 카드 이미지 경로
  name: string;   // 카드 고유 이름
}

// 플레이어별 손패 정보
export interface PlayerHand {
  nickname: string;
  cardCount: number;
}

// 게임 설정 타입
export interface GameConfig {
  gameType: string;
  displayName: string;
  createDeck: () => Card[];
  cardBack: string;
  initialHandSize: number;
  maxPlayers: number;
}
