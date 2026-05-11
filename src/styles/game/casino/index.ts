import styled from "styled-components";

// ─── 공통 ────────────────────────────────────────────────────────────
export const CasinoOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 8px;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-y: auto;
`;

// ─── CasinoHub ──────────────────────────────────────────────────────
export const HubWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 1rem;
`;

export const HubTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  flex-shrink: 0;
`;

export const BalanceDisplay = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: #f0c040;
  letter-spacing: 0.04em;
`;

export const TimerDisplay = styled.div<{ $urgent?: boolean }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ $urgent }) => ($urgent ? "#ff6b6b" : "#aaa")};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
`;

export const HubBody = styled.div`
  display: flex;
  flex: 1;
  gap: 1rem;
  min-height: 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  flex: 1;
  align-content: start;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const GameCard = styled.button`
  background: linear-gradient(135deg, #0d5c2e 0%, #0a3d1e 100%);
  border: 2px solid rgba(240, 192, 64, 0.25);
  border-radius: 8px;
  padding: 0.6rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    border-color: #f0c040;
    box-shadow: 0 4px 16px rgba(240, 192, 64, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const GameCardIcon = styled.div`
  font-size: 1.5rem;
  line-height: 1;
`;

export const GameCardName = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #e0d0a0;
`;

export const GamePlayButton = styled.div`
  font-size: 0.68rem;
  color: #f0c040;
  background: rgba(240, 192, 64, 0.15);
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
`;

export const VoteSection = styled.div`
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const VoteButton = styled.button`
  background: linear-gradient(135deg, #c0392b 0%, #8b0000 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 1.4rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

export const VoteInfo = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

// ─── CasinoLeaderboard ───────────────────────────────────────────────
export const LeaderboardWrapper = styled.div`
  width: 200px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    max-height: 160px;
  }
`;

export const LeaderboardTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: #f0c040;
  text-align: center;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(240, 192, 64, 0.2);
`;

export const LeaderboardRow = styled.div<{ $isMe?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: ${({ $isMe }) => ($isMe ? "#f0c040" : "#ccc")};
  font-weight: ${({ $isMe }) => ($isMe ? 700 : 400)};
  background: ${({ $isMe }) => ($isMe ? "rgba(240, 192, 64, 0.1)" : "transparent")};
  border-radius: 4px;
  padding: 0.2rem 0.3rem;
`;

export const RankBadge = styled.div`
  width: 18px;
  text-align: center;
  font-size: 0.75rem;
  color: #888;
  flex-shrink: 0;
`;

export const PlayerNick = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BalanceCell = styled.div`
  font-size: 0.78rem;
  white-space: nowrap;
`;

export const ProfitCell = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 0.72rem;
  color: ${({ $positive, $negative }) =>
    $positive ? "#2ecc71" : $negative ? "#e74c3c" : "#888"};
  white-space: nowrap;
`;

export const CurrentGameIcon = styled.div`
  font-size: 0.9rem;
  flex-shrink: 0;
`;

// ─── CasinoSetupModal ────────────────────────────────────────────────
export const SetupModalOverlay = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SetupModalBox = styled.div`
  background: linear-gradient(160deg, #0d2e17 0%, #0a1e0f 100%);
  border: 1px solid rgba(240, 192, 64, 0.3);
  border-radius: 14px;
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SetupTitle = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f0c040;
  text-align: center;
`;

export const SetupSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

export const SetupLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #ccc;
`;

export const OptionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const OptionButton = styled.button<{ $selected?: boolean }>`
  background: ${({ $selected }) =>
    $selected
      ? "linear-gradient(135deg, #f0c040 0%, #c8920a 100%)"
      : "rgba(255,255,255,0.07)"};
  border: 1px solid ${({ $selected }) => ($selected ? "#f0c040" : "rgba(255,255,255,0.15)")};
  border-radius: 6px;
  color: ${({ $selected }) => ($selected ? "#1a1a1a" : "#ccc")};
  font-size: 0.82rem;
  font-weight: ${({ $selected }) => ($selected ? 700 : 400)};
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    border-color: #f0c040;
    color: ${({ $selected }) => ($selected ? "#1a1a1a" : "#f0c040")};
  }
`;

export const StartButton = styled.button<{ $disabled?: boolean }>`
  background: ${({ $disabled }) =>
    $disabled
      ? "rgba(255,255,255,0.1)"
      : "linear-gradient(135deg, #c0392b 0%, #8b0000 100%)"};
  border: none;
  border-radius: 8px;
  color: ${({ $disabled }) => ($disabled ? "#666" : "#fff")};
  font-size: 1rem;
  font-weight: 700;
  padding: 0.8rem 1.5rem;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: opacity 0.2s;

  &:hover {
    opacity: ${({ $disabled }) => ($disabled ? 1 : 0.85)};
  }
`;

export const NonHostMessage = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #888;
  padding: 0.5rem 0;
`;

// ─── CasinoResultModal ───────────────────────────────────────────────
export const ResultModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

export const ResultModalBox = styled.div`
  background: linear-gradient(160deg, #0d2e17 0%, #0a1e0f 100%);
  border: 1px solid rgba(240, 192, 64, 0.4);
  border-radius: 14px;
  padding: 2rem;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const ResultTitle = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #f0c040;
  text-align: center;
`;

export const ResultReason = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #aaa;
`;

export const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th {
    color: #f0c040;
    font-weight: 600;
    border-bottom: 1px solid rgba(240, 192, 64, 0.3);
    padding: 0.5rem 0.5rem;
    text-align: center;
  }

  td {
    color: #ddd;
    padding: 0.5rem 0.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export const ResultProfitCell = styled.td<{ $positive?: boolean; $negative?: boolean }>`
  color: ${({ $positive, $negative }) =>
    $positive ? "#2ecc71" : $negative ? "#e74c3c" : "#888"} !important;
  font-weight: 600;
`;

export const ChartWrapper = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
`;

export const CloseButton = styled.button`
  align-self: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ccc;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.7rem 1.8rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;
