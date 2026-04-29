import styled from "styled-components";

export const BjModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

export const BjModalBox = styled.div`
  background: #1c2833;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  min-width: 300px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BjModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin: 0;
`;

export const BjBetChipsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const BjBetChipBtn = styled.button<{ $selected: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid
    ${({ $selected }) => ($selected ? "#f1c40f" : "rgba(255,255,255,0.2)")};
  background: ${({ $selected }) =>
    $selected ? "rgba(241,196,15,0.2)" : "rgba(255,255,255,0.08)"};
  color: ${({ $selected }) => ($selected ? "#f1c40f" : "#fff")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: #f1c40f;
    background: rgba(241, 196, 15, 0.15);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const BjBetDisplay = styled.div`
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #f1c40f;
`;

export const BjBetSubText = styled.div`
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

export const BjConfirmBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #1a6b3c 0%, #0d4a28 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const BjCancelBtn = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

// 결과 모달
export const BjResultSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BjResultPlayerRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const BjResultNickname = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  min-width: 70px;
  padding-top: 2px;
`;

export const BjResultHandRow = styled.div<{ $result?: string }>`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ $result }) =>
    $result === "win"
      ? "rgba(46, 204, 113, 0.15)"
      : $result === "lose"
      ? "rgba(231, 76, 60, 0.15)"
      : "rgba(149, 165, 166, 0.1)"};
  border: 1px solid
    ${({ $result }) =>
      $result === "win"
        ? "rgba(46, 204, 113, 0.4)"
        : $result === "lose"
        ? "rgba(231, 76, 60, 0.4)"
        : "rgba(149, 165, 166, 0.3)"};
`;

export const BjResultBadge = styled.span<{ $result: string }>`
  font-size: 11px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: ${({ $result }) =>
    $result === "win"
      ? "#2ecc71"
      : $result === "lose"
      ? "#e74c3c"
      : "#7f8c8d"};
  color: #fff;
`;

export const BjResultPayout = styled.span<{ $result: string }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $result }) =>
    $result === "win"
      ? "#2ecc71"
      : $result === "lose"
      ? "#e74c3c"
      : "#95a5a6"};
`;

export const BjChipChange = styled.div<{ $delta: number }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $delta }) => ($delta > 0 ? "#2ecc71" : $delta < 0 ? "#e74c3c" : "#95a5a6")};
`;

// 대기 상태 (베팅 완료 등)
export const BjWaitingText = styled.div`
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  padding: 8px;
`;

export const BjProgressDots = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
`;

export const BjDot = styled.div<{ $filled: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $filled }) =>
    $filled ? "#2ecc71" : "rgba(255,255,255,0.2)"};
  transition: background 0.3s;
`;
