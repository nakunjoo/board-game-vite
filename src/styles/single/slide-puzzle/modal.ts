import styled, { keyframes } from "styled-components";

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
  position: relative;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  min-width: 280px;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #a5aaff;
  }
`;

export const ModalCloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: #555;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: #e0e0e0;
    background: #2e2e2e;
  }
`;

export const ModalStats = styled.div`
  display: flex;
  gap: 2rem;
`;

export const ModalStatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;

  .label {
    font-size: 0.72rem;
    color: #666;
    text-transform: uppercase;
  }

  .value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #e0e0e0;
    font-variant-numeric: tabular-nums;
  }

  .best {
    font-size: 0.72rem;
    color: #f1c40f;
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

export const ModalButton = styled.button<{ $primary?: boolean }>`
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  border: none;
  background: ${({ $primary }) => ($primary ? "#646cff" : "#2e2e2e")};
  color: ${({ $primary }) => ($primary ? "#fff" : "#ccc")};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ $primary }) => ($primary ? "#535bf2" : "#3a3a3a")};
  }
`;

export const SetupModalBox = styled.div`
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: min(92vw, 420px);

  h2 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
    color: #e0e0e0;
  }
`;

export const ControlBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const SizeButton = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => ($active ? "#646cff" : "#3a3a3a")};
  background: ${({ $active }) =>
    $active ? "rgba(100,108,255,0.2)" : "transparent"};
  color: ${({ $active }) => ($active ? "#a5aaff" : "#888")};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #646cff;
    color: #a5aaff;
  }
`;

export const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const ImageSectionLabel = styled.span`
  font-size: 0.72rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ImageRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ImageThumb = styled.button<{ $active?: boolean }>`
  width: 58px;
  height: 58px;
  border-radius: 8px;
  border: 2px solid ${({ $active }) => ($active ? "#646cff" : "#2e2e2e")};
  box-shadow: ${({ $active }) =>
    $active ? "0 0 0 2px rgba(100,108,255,0.45)" : "none"};
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
  flex-shrink: 0;

  &:hover {
    border-color: #646cff;
    transform: scale(1.06);
  }
`;

export const ThumbCheck = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(100, 108, 255, 0.45);
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
`;

export const UploadThumb = styled.button<{ $active?: boolean }>`
  width: 58px;
  height: 58px;
  border-radius: 8px;
  border: 2px dashed
    ${({ $active }) => ($active ? "#646cff" : "#3a3a3a")};
  box-shadow: ${({ $active }) =>
    $active ? "0 0 0 2px rgba(100,108,255,0.45)" : "none"};
  background: ${({ $active }) =>
    $active ? "rgba(100,108,255,0.1)" : "transparent"};
  color: ${({ $active }) => ($active ? "#a5aaff" : "#555")};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  &:hover {
    border-color: #646cff;
    color: #a5aaff;
  }
`;

export const UploadPreview = styled.div<{ $url: string }>`
  position: absolute;
  inset: 0;
  background-image: url(${({ $url }) => $url});
  background-size: cover;
  background-position: center;
`;

// keyframes re-export for consistency
export { keyframes };
