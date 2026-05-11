import styled from "styled-components";

export const MyPageWrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 0 0.5rem;
`;

export const MyPageHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #2a2a2a;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #fff;
  }
`;

export const MyPageTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #e0e0e0;
`;

export const Section = styled.section`
  background: #1a1a1a;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

export const SectionTitle = styled.h2`
  margin: 0 0 1.25rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const AvatarBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const AvatarFallback = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #646cff 0%, #9b59b6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

export const AvatarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .current-nickname {
    font-size: 1.1rem;
    font-weight: 600;
    color: #e0e0e0;
  }

  .sub {
    font-size: 0.8rem;
    color: #666;
  }
`;

export const NicknameForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const NicknameInput = styled.input<{ $disabled?: boolean }>`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid ${({ $disabled }) => ($disabled ? "#2a2a2a" : "#4a4a4a")};
  border-radius: 8px;
  background-color: ${({ $disabled }) => ($disabled ? "#151515" : "#252525")};
  color: ${({ $disabled }) => ($disabled ? "#555" : "#e0e0e0")};
  font-size: 1rem;
  box-sizing: border-box;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "text")};

  &:focus {
    outline: none;
    border-color: ${({ $disabled }) => ($disabled ? "#2a2a2a" : "#646cff")};
  }

  &::placeholder {
    color: #555;
  }
`;

export const InfoText = styled.p<{ $warning?: boolean; $error?: boolean }>`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ $warning, $error }) =>
    $error ? "#ff6b6b" : $warning ? "#f39c12" : "#666"};
  line-height: 1.5;
`;

export const SaveButton = styled.button`
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: #646cff;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #535bf2;
  }

  &:disabled {
    background: #2a2a2a;
    color: #555;
    cursor: not-allowed;
  }
`;

export const PlaceholderBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  color: #444;
  font-size: 0.9rem;
`;

export const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const HistoryItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #252525;
  border-radius: 8px;
  border-left: 3px solid ${({ $status }) =>
    $status === "abandoned_voluntary"
      ? "#f39c12"
      : $status === "abandoned_disconnected"
        ? "#555"
        : "transparent"};
  cursor: pointer;
  &:hover { background: #2e2e2e; }
`;

export const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const DetailBox = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 14px;
  padding: 1.5rem;
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #2a2a2a;
`;

export const DetailTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #e0e0e0;
`;

export const DetailClose = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  &:hover { color: #aaa; }
`;

export const DetailMeta = styled.div`
  font-size: 0.78rem;
  color: #666;
  margin-top: 0.1rem;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #252525;
  font-size: 0.88rem;
  color: #aaa;
  span:last-child { color: #e0e0e0; font-weight: 600; }
`;

export const DetailSectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.25rem;
`;

export const WinLossDots = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const WinLossDot = styled.span<{ $win: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  background: ${({ $win }) => ($win ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)")};
  color: ${({ $win }) => ($win ? "#22c55e" : "#ef4444")};
`;

export const RoundScoreRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const RoundScoreBadge = styled.span<{ $positive: boolean }>`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 600;
  background: ${({ $positive }) => ($positive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)")};
  color: ${({ $positive }) => ($positive ? "#22c55e" : "#ef4444")};
`;

export const GamePlayedTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const GamePlayedRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #888;
  span:last-child { color: #ccc; }
`;

export const SkulkingRoundTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  th {
    color: #555;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #2a2a2a;
    text-align: center;
  }

  td {
    padding: 0.32rem 0.5rem;
    color: #aaa;
    text-align: center;
    border-bottom: 1px solid #1e1e1e;
    white-space: nowrap;
  }

  tr.total-row td {
    border-top: 1px solid #333;
    border-bottom: none;
    color: #ccc;
    font-weight: 700;
    padding-top: 0.5rem;
  }
`;

export const PlayersTableWrap = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;

  th {
    color: #555;
    font-weight: 600;
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #2a2a2a;
    text-align: center;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  td {
    padding: 0.35rem 0.5rem;
    color: #aaa;
    text-align: center;
    border-bottom: 1px solid #1e1e1e;
    white-space: nowrap;
  }

  td[style*="text-align: left"],
  td[style*="text-align:left"] {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const PlayerRow = styled.tr<{ $isMe: boolean }>`
  background: ${({ $isMe }) => ($isMe ? "rgba(100,108,255,0.08)" : "transparent")};

  td {
    color: ${({ $isMe }) => ($isMe ? "#c8cbff" : "#aaa")};
    font-weight: ${({ $isMe }) => ($isMe ? "600" : "400")};
  }
`;

export const MeTag = styled.span`
  display: inline-block;
  margin-left: 5px;
  font-size: 0.65rem;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(100,108,255,0.25);
  color: #9fa6ff;
  font-weight: 700;
  vertical-align: middle;
`;

export const HistoryBadge = styled.span<{ $gameType: string; $abandoned?: boolean }>`
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: ${({ $gameType, $abandoned }) =>
    $abandoned
      ? "#333"
      : $gameType === "gang"
        ? "rgba(155,89,182,0.3)"
        : $gameType === "spice"
          ? "rgba(230,126,34,0.3)"
          : "rgba(231,76,60,0.3)"};
  color: ${({ $gameType, $abandoned }) =>
    $abandoned
      ? "#666"
      : $gameType === "gang"
        ? "#c39bd3"
        : $gameType === "spice"
          ? "#f0a060"
          : "#e88"};
`;

export const HistoryInfo = styled.div`
  flex: 1;
  min-width: 0;

  .title {
    font-size: 0.9rem;
    color: #ccc;
  }

  .sub {
    font-size: 0.78rem;
    color: #555;
    margin-top: 0.1rem;
  }
`;

export const HistoryResult = styled.div<{ $isWinner?: boolean | null }>`
  flex-shrink: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ $isWinner }) =>
    $isWinner === true ? "#22c55e" : $isWinner === false ? "#ef4444" : "#666"};
`;
