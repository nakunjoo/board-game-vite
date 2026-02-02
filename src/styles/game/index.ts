import styled from "styled-components";

export const GameArea = styled.div`
  flex: 1;
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  @media (max-width: 1080px) {
    flex: 1;
    width: 100%;
    max-width: 100%;
    min-height: 300px;
  }

  @media (max-width: 768px) {
    flex: 1;
    width: 100%;
    min-height: 0;
    padding: 0.5rem;
  }
`;

export const GameBoard = styled.div`
  aspect-ratio: 1;
  width: 100%;
  max-width: min(100%, calc(100vh - 200px));
  max-height: 100%;
  position: relative;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: visible;

  @media (max-width: 1080px) {
    max-width: 100%;
  }

  @media (max-width: 768px) {
    aspect-ratio: auto;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
  }
`;

export const PlayerCircle = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

// 내 손패 영역
export const MyHandArea = styled.div`
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: -20px;
  z-index: 10;

  @media (max-width: 768px) {
    bottom: 65px;
  }
`;

// 손패 카드
export const HandCard = styled.div`
  width: 60px;
  height: 84px;
  border-radius: 4px;
  overflow: visible;
  cursor: pointer;
  transition: transform 0.2s;
  margin-left: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:first-child {
    margin-left: 0;
  }

  &:hover {
    transform: translateY(-10px);
  }

  @media (max-width: 768px) {
    width: 45px;
    height: 63px;
    margin-left: 3px;
  }
`;

export const CardImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const CardLabel = styled.div<{ $suit: string }>`
  margin-top: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $suit }) =>
    $suit === "hearts" || $suit === "diamonds" ? "#ff4444" : "#fff"};
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 1px 4px;
    margin-top: 2px;
  }
`;

// 카드 덱 컨테이너
export const CardDeck = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 70px;
  z-index: 1;

  @media (max-width: 768px) {
    width: 30px;
    height: 42px;
  }
`;

// 카드 래퍼 (플립 효과용)
export const CardWrapper = styled.div<{
  $isFlipped: boolean;
  $index: number;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 1000px;
  cursor: pointer;
  top: ${({ $index }) => Math.floor($index / 8) * 1}px;
  left: ${({ $index }) => Math.floor($index / 8) * 1}px;

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.5s;
    transform-style: preserve-3d;
    transform: ${({ $isFlipped }) =>
      $isFlipped ? "rotateY(180deg)" : "rotateY(0)"};
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 4px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .card-back {
    background-color: #1a4d8c;
  }

  .card-front {
    transform: rotateY(180deg);
    background-color: white;
  }
`;
