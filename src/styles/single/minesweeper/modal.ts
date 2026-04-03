import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

export const ModalBox = styled.div`
  background: #16213e;
  border: 2px solid #0f3460;
  border-radius: 14px;
  padding: 28px 24px 24px;
  min-width: 280px;
  max-width: 360px;
  width: 90%;
  color: #fff;
  text-align: center;
`;

export const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 20px;
  letter-spacing: 1px;
`;

export const DifficultyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

export const DifficultyBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid ${(p) => (p.$active ? "#e94560" : "#0f3460")};
  background: ${(p) => (p.$active ? "rgba(233,69,96,0.15)" : "rgba(15,52,96,0.3)")};
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  transition: border-color 0.15s, background 0.15s;
  text-align: left;
  &:hover {
    background: rgba(233, 69, 96, 0.1);
    border-color: #e94560;
  }
`;

export const DifficultyDesc = styled.span`
  font-size: 12px;
  color: #9ab;
`;

export const StartButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #e94560 0%, #c0392b 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

export const ResultEmoji = styled.div`
  font-size: 52px;
  margin-bottom: 8px;
`;

export const ResultTime = styled.div`
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 3px;
  color: #a8d8ea;
  margin-bottom: 12px;
  font-family: "Courier New", monospace;
`;

export const BestRecordBox = styled.div`
  font-size: 13px;
  color: #ffd700;
  margin-bottom: 20px;
`;

export const ActionButton = styled.button<{ $secondary?: boolean }>`
  width: 100%;
  padding: 11px;
  margin-top: 8px;
  background: ${(p) =>
    p.$secondary
      ? "transparent"
      : "linear-gradient(135deg, #e94560 0%, #c0392b 100%)"};
  color: #fff;
  border: ${(p) => (p.$secondary ? "1px solid #0f3460" : "none")};
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
`;
