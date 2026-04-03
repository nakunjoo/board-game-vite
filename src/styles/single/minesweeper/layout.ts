import styled from "styled-components";

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #1a1a2e;
  color: #fff;
  overflow: hidden;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
  min-height: 44px;
  flex-shrink: 0;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  &:hover {
    opacity: 0.7;
  }
`;

export const HeaderTitle = styled.span`
  font-size: 16px;
  font-weight: bold;
`;

export const DifficultyBadge = styled.span`
  font-size: 12px;
  background: #0f3460;
  padding: 2px 8px;
  border-radius: 10px;
  color: #a8d8ea;
`;

export const GameBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  background: #c0c0c0;
  border-bottom: 3px ridge #888;
  flex-shrink: 0;
`;

export const CounterBox = styled.div`
  background: #000;
  color: #ff3333;
  font-family: "Courier New", monospace;
  font-size: 16px;
  font-weight: bold;
  padding: 1px 5px;
  border: 2px inset #888;
  min-width: 48px;
  text-align: right;
  letter-spacing: 1px;
  user-select: none;
`;

export const GameBarSpacer = styled.div`
  min-width: 48px;
`;

export const FaceButton = styled.button`
  font-size: 18px;
  background: #c0c0c0;
  border: 2px outset #fff;
  cursor: pointer;
  padding: 1px 6px;
  border-radius: 3px;
  line-height: 1;
  &:active {
    border: 2px inset #888;
  }
`;

export const Main = styled.main`
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  min-height: 0;
`;
