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
    overflow: visible;
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
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: -20px;
  z-index: 10;

  @media (max-width: 768px) {
    bottom: 35px;
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
  margin-top: 30px;

  @media (max-width: 768px) {
    width: 30px;
    height: 42px;
    margin-top: 25px;
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

export const StartGameButton = styled.button<{ $disabled: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1.5rem 3rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: ${({ $disabled }) =>
    $disabled
      ? "linear-gradient(135deg, #555 0%, #333 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
  border: none;
  border-radius: 12px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 100;

  &:hover {
    transform: translate(-50%, -50%)
      ${({ $disabled }) => ($disabled ? "" : "scale(1.05)")};
    box-shadow: ${({ $disabled }) =>
      $disabled
        ? "0 4px 15px rgba(0, 0, 0, 0.3)"
        : "0 6px 20px rgba(0, 0, 0, 0.4)"};
  }

  &:active {
    transform: translate(-50%, -50%)
      ${({ $disabled }) => ($disabled ? "" : "scale(0.98)")};
  }

  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1.2rem;
  }
`;

export const OpenCardsArea = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 12px;
  z-index: 5;
  margin-top: -140px;

  @media (max-width: 768px) {
    gap: 8px 8px;
    margin-top: -110px;
  }
`;

export const OpenCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const OpenCardImage = styled.div`
  width: 60px;
  height: 84px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background-color: white;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 45px;
    height: 63px;
  }
`;

export const OpenCardLabel = styled.div<{ $suit: string }>`
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
  }
`;

export const ChipsArea = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  z-index: 5;
  margin-top: 100px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 80px;
  }
`;

const getChipColor = (state: number) => {
  switch (state) {
    case 0:
      return {
        bg: "linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)",
        border: "#999",
        color: "#333",
      };
    case 1:
      return {
        bg: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
        border: "#ff8c00",
        color: "#8b4513",
      };
    case 2:
      return {
        bg: "linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)",
        border: "#ff6600",
        color: "#fff",
      };
    case 3:
      return {
        bg: "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)",
        border: "#990000",
        color: "#fff",
      };
    default:
      return {
        bg: "linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)",
        border: "#999",
        color: "#333",
      };
  }
};

export const Chip = styled.div<{
  $state: number;
  $isSelected: boolean;
  $isLocked?: boolean;
}>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ $state }) => getChipColor($state).bg};
  border: 3px solid ${({ $state }) => getChipColor($state).border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ $state }) => getChipColor($state).color};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  opacity: ${({ $isSelected }) => ($isSelected ? 0.5 : 1)};
  transition: transform 0.2s;
  filter: ${({ $isLocked }) => ($isLocked ? "brightness(0.9)" : "none")};

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    border: 2px solid ${({ $state }) => getChipColor($state).border};
  }
`;

export const MyChipsArea = styled.div`
  position: absolute;
  bottom: 40px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;

  @media (max-width: 768px) {
    bottom: 35px;
    right: 10px;
    gap: 6px;
  }
`;

export const PlayerChip = styled.div<{ $state: number; $isVertical: boolean }>`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: ${({ $state }) => getChipColor($state).bg};
  border: 2px solid ${({ $state }) => getChipColor($state).border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  color: ${({ $state }) => getChipColor($state).color};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  position: absolute;

  ${({ $isVertical }) =>
    $isVertical
      ? `
    bottom: -45px;
    left: 50%;
    transform: translateX(-50%);
  `
      : `
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
  `}

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
    border: 1.5px solid ${({ $state }) => getChipColor($state).border};

    ${({ $isVertical }) =>
      $isVertical
        ? `
      bottom: -35px;
    `
        : `
      right: -38px;
    `}
  }
`;

export const NotificationToast = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 1000;
  pointer-events: none;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.75rem 1.25rem;
    top: 15px;
  }
`;

export const HandRankContainer = styled.div`
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  z-index: 100;
  white-space: nowrap;

  @media (max-width: 768px) {
    bottom: 110px;
    gap: 8px;
  }
`;

export const HandRankDisplay = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.6rem 1.2rem;
  }
`;

export const ReadyButton = styled.button<{ $disabled: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: ${({ $disabled }) =>
    $disabled
      ? "linear-gradient(135deg, #555 0%, #333 100%)"
      : "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"};
  border: none;
  border-radius: 8px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: ${({ $disabled }) => ($disabled ? "" : "scale(1.05)")};
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
`;

export const PreviousChips = styled.div<{
  $isVertical: boolean;
  $isLeftSide?: boolean;
  $chipCount?: number;
}>`
  position: absolute;
  display: flex;
  flex-direction: row;
  gap: 4px;
  justify-content: flex-start;

  ${({ $isVertical, $isLeftSide, $chipCount = 1 }) =>
    $isVertical
      ? $isLeftSide
        ? `
    top: -60px;
    left: ${($chipCount - 1) * 25}px;
  `
        : `
    top: -60px;
    right: ${($chipCount - 1) * 25}px;
  `
      : `
    left: ${-50 - ($chipCount - 1) * 25}px;
    top: 50%;
    transform: translateY(-50%);
  `}

  @media (max-width: 768px) {
    gap: 3px;
    ${({ $isVertical, $isLeftSide, $chipCount = 1 }) =>
      $isVertical
        ? $isLeftSide
          ? `
      top: -50px;
      left: ${($chipCount - 1) * 10}px;
    `
          : `
      top: -50px;
      right: ${($chipCount - 1) * 10}px;
    `
        : `
      left: ${-40 - ($chipCount - 1) * 20}px;
    `}
  }
`;

export const PreviousChip = styled.div<{ $state: number }>`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: ${({ $state }) => getChipColor($state).bg};
  border: 2px solid ${({ $state }) => getChipColor($state).border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  color: ${({ $state }) => getChipColor($state).color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 0.6rem;
    border: 1.5px solid ${({ $state }) => getChipColor($state).border};
  }
`;

export const GameFinishContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 700px;
  max-height: 80%;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 100;

  @media (max-width: 768px) {
    width: 95%;
    padding: 20px;
    max-height: 85%;
  }
`;

export const GameFinishHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

export const GameFinishTitle = styled.h2<{ $isSuccess?: boolean }>`
  color: ${({ $isSuccess }) => ($isSuccess ? '#4caf50' : '#f44336')};
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 10px ${({ $isSuccess }) =>
    $isSuccess ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

export const GameFinishCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
`;

export const OpenCardsDisplay = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
    margin-bottom: 15px;
  }
`;

export const OpenCardDisplayImage = styled.img`
  width: 55px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    width: 40px;
  }
`;

export const PlayerResultItem = styled.div<{ $isWinner?: boolean; $isLoser?: boolean }>`
  background: ${({ $isWinner, $isLoser }) =>
    $isWinner
      ? 'rgba(76, 175, 80, 0.15)'
      : $isLoser
      ? 'rgba(244, 67, 54, 0.15)'
      : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 12px;
  border: 2px solid ${({ $isWinner, $isLoser }) =>
    $isWinner
      ? 'rgba(76, 175, 80, 0.5)'
      : $isLoser
      ? 'rgba(244, 67, 54, 0.5)'
      : 'rgba(255, 255, 255, 0.1)'};

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 10px;
  }
`;

export const PlayerResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 8px;
  }
`;

export const PlayerResultNickname = styled.div`
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const PlayerResultChips = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const PlayerResultCards = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 4px;
    margin-bottom: 8px;
  }
`;

export const PlayerResultCard = styled.img`
  width: 50px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 38px;
  }
`;

export const PlayerResultRank = styled.div<{ $isWinner?: boolean; $isLoser?: boolean }>`
  color: ${({ $isWinner, $isLoser }) =>
    $isWinner ? '#4caf50' : $isLoser ? '#f44336' : '#ffd700'};
  font-size: 1rem;
  font-weight: bold;
  text-shadow: 0 1px 5px ${({ $isWinner, $isLoser }) =>
    $isWinner
      ? 'rgba(76, 175, 80, 0.5)'
      : $isLoser
      ? 'rgba(244, 67, 54, 0.5)'
      : 'rgba(255, 215, 0, 0.3)'};

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const ResultStatus = styled.span<{ $isWinner?: boolean }>`
  color: ${({ $isWinner }) => ($isWinner ? '#4caf50' : '#f44336')};
  font-size: 0.85rem;
  margin-left: 6px;
  font-weight: normal;
`;

export const GameFinishActions = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  z-index: 100;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

export const GameFinishActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  min-width: 200px;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 0.9rem 2rem;
    font-size: 1.1rem;
    min-width: 180px;
  }
`;

export const GameFinishBottomButton = styled.button`
  width: 100%;
  padding: 0.9rem 1.5rem;
  margin-top: 20px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #555 0%, #333 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &:hover {
    background: linear-gradient(135deg, #666 0%, #444 100%);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1.2rem;
    font-size: 0.95rem;
    margin-top: 15px;
  }
`;
