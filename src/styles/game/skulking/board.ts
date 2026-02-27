import styled from "styled-components";
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

export const OrderBadge = styled.div<{ $isActive?: boolean; $isLead?: boolean }>`
  position: absolute;
  top: -10px;
  right: -10px;
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
