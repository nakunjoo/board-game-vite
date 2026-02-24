import styled from "styled-components";

export const TigressOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
`;

export const TigressModal = styled.div`
  background: #1a1a2e;
  border: 2px solid #e67e22;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  color: #ecf0f1;
`;

export const TigressBtn = styled.button<{ $type: "escape" | "pirate" }>`
  padding: 10px 24px;
  margin: 0 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  background: ${({ $type }) => ($type === "escape" ? "#95a5a6" : "#e74c3c")};
  color: white;
`;
