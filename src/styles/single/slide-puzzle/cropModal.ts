import styled from "styled-components";

export const CropModalBox = styled.div`
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(95vw, 680px);

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
  }
`;

export const CropArea = styled.div`
  position: relative;
  width: 100%;
  height: clamp(240px, 50vw, 420px);
  background: #0a0a0a;
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
`;

export const CropBox = styled.div`
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
  cursor: move;
  z-index: 3;
  touch-action: none;
`;

export const CropHandle = styled.div<{ $corner: "nw" | "ne" | "sw" | "se" }>`
  position: absolute;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2px solid rgba(100, 108, 255, 0.9);
  border-radius: 3px;
  box-sizing: border-box;
  z-index: 4;
  touch-action: none;

  ${({ $corner }) => $corner === "nw" && "top: -7px; left: -7px; cursor: nw-resize;"}
  ${({ $corner }) => $corner === "ne" && "top: -7px; right: -7px; cursor: ne-resize;"}
  ${({ $corner }) => $corner === "sw" && "bottom: -7px; left: -7px; cursor: sw-resize;"}
  ${({ $corner }) => $corner === "se" && "bottom: -7px; right: -7px; cursor: se-resize;"}
`;

export const CropOverlaySvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
`;

export const CropButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

export const CropBtn = styled.button<{ $primary?: boolean }>`
  padding: 0.5rem 1.4rem;
  border-radius: 8px;
  border: none;
  background: ${({ $primary }) => ($primary ? "#646cff" : "#2e2e2e")};
  color: ${({ $primary }) => ($primary ? "#fff" : "#ccc")};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${({ $primary }) => ($primary ? "#535bf2" : "#3a3a3a")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const CropLoading = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 0.9rem;
  gap: 0.5rem;
`;

export const CropHint = styled.p`
  margin: 0;
  font-size: 0.7rem;
  color: #444;
  text-align: center;
`;
