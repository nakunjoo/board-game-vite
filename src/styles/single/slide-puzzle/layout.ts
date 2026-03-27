import styled, { keyframes } from "styled-components";

export const PageWrapper = styled.div`
  height: 100dvh;
  background: #121212;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #2a2a2a;
  background: #1a1a1a;
  flex-shrink: 0;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  line-height: 1;

  &:hover {
    color: #e0e0e0;
    background: #2a2a2a;
  }
`;

export const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e0e0e0;
`;

export const HeaderStats = styled.div`
  display: flex;
  gap: 1.25rem;
  align-items: center;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;

  .label {
    font-size: 0.65rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
    font-variant-numeric: tabular-nums;
  }
`;

export const PauseButton = styled.button<{ $paused?: boolean }>`
  background: ${({ $paused }) => ($paused ? "rgba(100,108,255,0.15)" : "none")};
  border: 1px solid ${({ $paused }) => ($paused ? "#646cff" : "#3a3a3a")};
  color: ${({ $paused }) => ($paused ? "#a5aaff" : "#aaa")};
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.15s;

  &:hover {
    color: #e0e0e0;
    border-color: #646cff;
    background: rgba(100, 108, 255, 0.15);
  }
`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  overflow: hidden;
  min-height: 0;
`;

// keyframes export for potential reuse
export { keyframes };
