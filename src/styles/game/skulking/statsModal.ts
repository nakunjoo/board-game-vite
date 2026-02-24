import styled from "styled-components";

export const StatsOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
`;

export const StatsModal = styled.div`
  background: #1a1a2e;
  border: 1px solid #2c3e50;
  border-radius: 10px;
  padding: 16px;
  width: 92vw;
  color: #ecf0f1;
`;

export const StatsTitle = styled.div`
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #e74c3c;
  text-align: center;
`;

export const StatsTable = styled.table`
  border-collapse: collapse;
  font-size: 0.72rem;
  width: 100%;

  th {
    font-weight: 700;
    padding: 3px 6px;
    text-align: center;
    border-bottom: 1px solid #2c3e50;
  }

  td {
    padding: 3px 6px;
    text-align: center;
    border-bottom: 1px solid #1e2a38;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;
