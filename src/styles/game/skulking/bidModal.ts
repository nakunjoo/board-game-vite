import styled from "styled-components";

export const BidOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
`;

export const BidModal = styled.div`
  background: #1a1a2e;
  border: 2px solid #f39c12;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(92vw, 480px);
  max-height: 90vh;
  overflow-y: auto;
`;

export const BidTitle = styled.div`
  color: #f39c12;
  font-size: 0.85rem;
  font-weight: bold;
  text-align: center;
`;

export const BidButtons = styled.div<{ $round?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  ${({ $round }) => {
    if ($round && $round > 5) {
      const total = $round + 1;
      const perRow = Math.ceil(total / 2);
      const maxWidthPc = perRow * 40 + (perRow - 1) * 5;   // PC: 36px + border 4px = 40px
      const maxWidthMobile = perRow * 34 + (perRow - 1) * 5; // 모바일: 30px + border 4px = 34px
      return `
        max-width: ${maxWidthPc}px;
        @media (max-width: 768px) {
          max-width: ${maxWidthMobile}px;
        }
      `;
    }
    return "";
  }}
`;

export const BidButton = styled.button<{ $selected?: boolean }>`
  width: 36px;
  height: 36px;
  box-sizing: border-box;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#f39c12" : "#2c3e50")};
  background: ${({ $selected }) => ($selected ? "#f39c12" : "#1a1a2e")};
  color: ${({ $selected }) => ($selected ? "#1a1a2e" : "#ecf0f1")};
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    border-color: #f39c12;
  }

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
`;

export const BidConfirmButton = styled.button`
  padding: 6px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;
