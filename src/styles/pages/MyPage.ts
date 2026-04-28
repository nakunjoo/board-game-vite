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
