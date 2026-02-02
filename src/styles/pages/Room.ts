import styled, { css } from "styled-components";
import type { SeatPosition } from "../../types/game";
import { SEAT_POSITIONS } from "../../utils/constants";

// Room 페이지 컨테이너
export const RoomPage = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);

  @media (max-width: 1080px) {
    height: auto;
    min-height: calc(100vh - 4rem);
  }

  @media (max-width: 768px) {
    height: calc(100vh - 1.5rem);
    position: relative;
  }
`;

// 헤더
export const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #3a3a3a;
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  @media (max-width: 768px) {
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;

    h1 {
      font-size: 1.1rem;
    }
  }
`;

export const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

export const MemberCount = styled.span`
  color: #888;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

export const LeaveButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #cc3333;
    border-color: transparent;
  }

  .leave-icon {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 0.3rem;

    .leave-text {
      display: none;
    }

    .leave-icon {
      display: block;
      width: 16px;
      height: 16px;
    }
  }
`;

// 콘텐츠 영역
export const RoomContent = styled.div`
  display: flex;
  flex: 1;
  gap: 1rem;
  min-height: 0;

  @media (max-width: 1080px) {
    flex-direction: column;
  }
`;

// 플레이어 좌석 관련
export const getSeatPosition = (
  totalPlayers: number,
  seatIndex: number
): SeatPosition => {
  const positions =
    SEAT_POSITIONS[Math.min(totalPlayers, 6)] || SEAT_POSITIONS[6];
  return positions[seatIndex] ?? { bottom: "0", left: "50%" };
};

export const PlayerSeat = styled.div<{
  $totalPlayers: number;
  $seatIndex: number;
  $isMe: boolean;
}>`
  position: absolute;

  overflow: visible;

  ${({ $totalPlayers, $seatIndex }) => {
    const pos = getSeatPosition($totalPlayers, $seatIndex);

    return css`
      ${pos.top !== undefined && `top: ${pos.top};`}
      ${pos.bottom !== undefined && `bottom: ${pos.bottom};`}
      ${pos.left !== undefined && `left: ${pos.left};`}
      ${pos.right !== undefined && `right: ${pos.right};`}

      transform: translate(
        ${pos.left === "50%"
        ? "-50%"
        : pos.left === "0"
          ? "0"
          : pos.right === "0"
            ? "0"
            : "-50%"},
        ${pos.top === "50%"
        ? "-50%"
        : pos.top === "0"
          ? "0"
          : pos.bottom === "0"
            ? "0"
            : "-50%"}
      );
    `;
  }}
`;

const AVATAR_COLORS = [
  { bg: "#646cff", border: "#535bf2" },
  { bg: "#e85d75", border: "#d44a63" },
  { bg: "#4caf50", border: "#3d9141" },
  { bg: "#ff9800", border: "#e68a00" },
  { bg: "#9c27b0", border: "#8520a0" },
  { bg: "#00bcd4", border: "#009aab" },
];

export const PlayerAvatar = styled.div<{ $isMe: boolean; $colorIndex: number; $isVertical?: boolean }>`
  background-color: ${({ $colorIndex }) => AVATAR_COLORS[$colorIndex % AVATAR_COLORS.length].bg};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border: 2px solid ${({ $colorIndex }) => AVATAR_COLORS[$colorIndex % AVATAR_COLORS.length].border};
  padding: ${({ $isVertical }) => $isVertical ? '0.8rem 0.3rem' : '0.3rem 0.8rem'};

  ${({ $isVertical }) => $isVertical && css`
    writing-mode: vertical-rl;
    text-orientation: mixed;
  `}

  @media (max-width: 768px) {
    font-size: 0.6rem;
    padding: ${({ $isVertical }) => $isVertical ? '0.6rem 0.2rem' : '0.2rem 0.6rem'};
  }
`;

// 카드 위치 계산 함수
export const getCardPosition = (
  totalPlayers: number,
  seatIndex: number
): { top?: string; bottom?: string; left?: string; right?: string } => {
  const pos = getSeatPosition(totalPlayers, seatIndex);
  const offset = "60px";

  // 6시 방향 (bottom: 0, left: 50%)
  if (pos.bottom === "0" && pos.left === "50%") {
    return { bottom: offset, left: "50%" };
  }
  // 12시 방향 (top: 0, left: 50%)
  if (pos.top === "0" && pos.left === "50%") {
    return { top: offset, left: "50%" };
  }
  // 왼쪽 (left: 0)
  if (pos.left === "0") {
    return { top: pos.top, bottom: pos.bottom, left: offset };
  }
  // 오른쪽 (right: 0)
  if (pos.right === "0") {
    return { top: pos.top, bottom: pos.bottom, right: offset };
  }

  return { top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right };
};

// 다른 플레이어 손패 영역
export const OtherPlayerHand = styled.div<{
  $totalPlayers: number;
  $seatIndex: number;
}>`
  position: absolute;
  display: flex;
  justify-content: center;

  ${({ $totalPlayers, $seatIndex }) => {
    const pos = getSeatPosition($totalPlayers, $seatIndex);

    // 6시 방향 (bottom: 0, left: 50%) - 카드를 위로
    if (pos.bottom === "0" && pos.left === "50%") {
      return css`
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 8px;
        flex-direction: row;
      `;
    }
    // 12시 방향 (top: 0, left: 50%) - 카드를 아래로
    if (pos.top === "0" && pos.left === "50%") {
      return css`
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 8px;
        flex-direction: row;
      `;
    }
    // 왼쪽 (left: 0) - 카드를 오른쪽으로 (세로 배치)
    if (pos.left === "0") {
      return css`
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        margin-left: 8px;
        flex-direction: column;
      `;
    }
    // 오른쪽 (right: 0) - 카드를 왼쪽으로 (세로 배치)
    if (pos.right === "0") {
      return css`
        top: 50%;
        right: 100%;
        transform: translateY(-50%);
        margin-right: 8px;
        flex-direction: column;
      `;
    }

    return css`
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 8px;
      flex-direction: row;
    `;
  }}
`;

// 다른 플레이어 카드 (뒷면)
export const OtherPlayerCard = styled.div<{ $vertical?: boolean }>`
  width: 20px;
  height: 28px;
  border-radius: 2px;
  overflow: hidden;

  ${({ $vertical }) =>
    $vertical
      ? css`
          transform: rotate(90deg);
          margin-top: -4px;
          &:first-child {
            margin-top: 0;
          }
        `
      : css`
          margin-left: -4px;
          &:first-child {
            margin-left: 0;
          }
        `}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 16px;
    height: 22px;
    ${({ $vertical }) =>
      $vertical
        ? css`
            margin-top: -3px;
          `
        : css`
            margin-left: -3px;
          `}
  }
`;
