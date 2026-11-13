import styled from "styled-components";
import { MyHandArea } from "..";
import { getSeatPosition } from "../../pages/Room";

export const DeckDisplay = styled.div`
  position: absolute;
  bottom: 4px;
  left: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 10;
  cursor: pointer;
`;

export const DeckCard = styled.div`
  width: 36px;
  height: 50px;
  border-radius: 4px;
  background: #0d0d12;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.03) 0px,
    rgba(255, 255, 255, 0.03) 2px,
    transparent 2px,
    transparent 8px
  );
  border: 2px solid rgba(255, 255, 255, 0.75);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.5);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  ${DeckDisplay}:hover & {
    border-color: rgba(255, 255, 255, 1);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.6);
  }
`;

export const DeckLabel = styled.span`
  font-size: 0.65rem;
  color: #7f8c8d;
`;

export const TrickCardSlot = styled.div<{
  $totalPlayers: number;
  $seatIndex: number;
}>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 15;
  pointer-events: none;

  ${({ $totalPlayers, $seatIndex }) => {
    const pos = getSeatPosition($totalPlayers, $seatIndex);
    if (pos.bottom === "0" && pos.left === "50%") {
      return `bottom: calc(100% + 130px); left: 50%; transform: translateX(-50%);`;
    }
    if (pos.top === "0" && pos.left === "50%") {
      return `top: calc(100% + 36px); left: 50%; transform: translateX(-50%);`;
    }
    if (pos.left === "0") {
      return `left: calc(100% + 36px); top: 50%; transform: translateY(-50%);`;
    }
    if (pos.right === "0") {
      return `right: calc(100% + 36px); top: 50%; transform: translateY(-50%);`;
    }
    return `bottom: calc(100% + 36px); left: 50%; transform: translateX(-50%);`;
  }}
`;

export const OrderBadge = styled.div<{ $isActive?: boolean; $isLead?: boolean; $isTop?: boolean; $isRightSide?: boolean }>`
  position: absolute;
  ${({ $isTop }) => $isTop ? "bottom: -10px;" : "top: -10px;"}
  ${({ $isRightSide }) => $isRightSide ? "left: -10px;" : "right: -10px;"}
  width: 20px;
  height: 20px;
  background: ${({ $isLead, $isActive }) =>
    $isLead ? "rgba(52, 152, 219, 0.9)" : $isActive ? "#f39c12" : "rgba(0, 0, 0, 0.75)"};
  border: 1px solid ${({ $isLead, $isActive }) =>
    $isLead ? "rgba(255, 255, 255, 0.5)" : $isActive ? "#f39c12" : "rgba(255, 255, 255, 0.35)"};
  border-radius: 50%;
  font-size: ${({ $isLead }) => $isLead ? "0.75rem" : "0.7rem"};
  color: ${({ $isActive, $isLead }) => ($isActive && !$isLead) ? "#1a1a2e" : "white"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

export const PlayerInfoBadge = styled.div`
  font-size: 0.78rem;
  color: #bdc3c7;
  text-align: center;
  white-space: nowrap;
`;

export const ConfirmCardButton = styled.button`
  position: absolute;
  bottom: 170px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 20;
  white-space: nowrap;

  @media (max-width: 768px) {
    bottom: 140px;
    font-size: 0.8rem;
    padding: 6px 18px;
  }
`;

// 휴대폰 손패가 가로로 넘칠 때 가려진 쪽에 남은 장수를 띄운다.
// 카드를 덮지 않도록 손패 상자 바깥 위쪽 모서리에 붙인다.
export const HandScrollWrap = styled.div`
  position: absolute;
  bottom: 55px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  @media (max-width: 768px) {
    bottom: 50px;
  }
`;

export const HandScrollArea = styled(MyHandArea)`
  position: relative;
  bottom: auto;
  left: auto;
  transform: none;

  @media (max-width: 768px) {
    bottom: auto;
  }
`;

export const HandMoreHintBadge = styled.button<{
  $side: "left" | "right";
  $highlight: boolean;
}>`
  position: absolute;
  bottom: calc(100% + 4px);
  ${({ $side }) => ($side === "left" ? "left: 0;" : "right: 0;")}
  padding: 2px 8px;
  border: 1px solid
    ${({ $highlight }) => ($highlight ? "#f1c40f" : "rgba(255, 255, 255, 0.35)")};
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: ${({ $highlight }) => ($highlight ? "#f1c40f" : "#fff")};
  font-size: 0.72rem;
  font-weight: bold;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  ${({ $highlight }) => ($highlight ? "animation: handHintPulse 1s ease-in-out infinite;" : "")}

  @keyframes handHintPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;
