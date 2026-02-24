import styled from "styled-components";

export const ResultOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ResultModal = styled.div`
  background: #1a1a2e;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  padding: 24px;
  max-width: 540px;
  width: 92%;
  max-height: 85vh;
  overflow-y: auto;
  color: #ecf0f1;
`;

export const ResultTitle = styled.h2`
  font-size: 1.4rem;
  color: #e74c3c;
  margin: 0 0 16px;
  text-align: center;
`;

export const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 16px;
`;

export const ResultTh = styled.th`
  background: #2c3e50;
  padding: 8px;
  text-align: center;
  color: #ecf0f1;
  font-size: 0.8rem;
`;

export const ResultTd = styled.td<{
  $highlight?: boolean;
  $positive?: boolean;
  $negative?: boolean;
}>`
  padding: 7px 8px;
  text-align: center;
  border-bottom: 1px solid #2c3e50;
  color: ${({ $positive, $negative }) =>
    $positive ? "#2ecc71" : $negative ? "#e74c3c" : "#bdc3c7"};
  font-weight: ${({ $highlight }) => ($highlight ? "bold" : "normal")};
`;

export const ResultButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
`;

export const ResultButton = styled.button<{ $primary?: boolean }>`
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  background: ${({ $primary }) => ($primary ? "#e74c3c" : "#2c3e50")};
  color: white;
  &:hover {
    opacity: 0.85;
  }
`;

export const RankBadge = styled.span<{ $rank: number }>`
  font-weight: bold;
  color: ${({ $rank }) =>
    $rank === 1
      ? "#f39c12"
      : $rank === 2
        ? "#bdc3c7"
        : $rank === 3
          ? "#cd7f32"
          : "#7f8c8d"};
`;
