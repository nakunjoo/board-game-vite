import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.6);
`;

export const ModalBox = styled.div`
  width: 100%;
  max-width: 340px;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px;
  border-radius: 12px;
  background: #242424;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  text-align: center;
  color: #fff;
`;

export const ModalLabel = styled.div`
  font-size: 0.85rem;
  color: #aaa;
  margin-bottom: 6px;
`;

export const OptionGroup = styled.div`
  display: flex;
  gap: 6px;
`;

export const OptionButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  height: 38px;
  border-radius: 8px;
  border: 1px solid ${({ $selected }) => ($selected ? "#3498db" : "rgba(255, 255, 255, 0.2)")};
  background: ${({ $selected }) => ($selected ? "rgba(52, 152, 219, 0.25)" : "transparent")};
  color: #eee;
  font-size: 0.9rem;
  cursor: pointer;
`;

export const PrimaryButton = styled.button`
  height: 44px;
  border-radius: 8px;
  border: none;
  background: #3498db;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    background: #3a3a3a;
    color: #888;
    cursor: default;
  }
`;

export const SecondaryButton = styled.button`
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: #ddd;
  font-size: 0.9rem;
  cursor: pointer;
`;

export const ModalNote = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #aaa;
  text-align: center;
  line-height: 1.5;
`;

export const ChoiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ChoiceButton = styled.button`
  height: 48px;
  border-radius: 8px;
  border: 1px solid rgba(241, 196, 15, 0.5);
  background: rgba(241, 196, 15, 0.12);
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
`;

export const RankTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const RankRow = styled.div<{ $isMe: boolean; $top: boolean }>`
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${({ $isMe }) => ($isMe ? "rgba(52, 152, 219, 0.2)" : "rgba(255, 255, 255, 0.05)")};
  font-weight: ${({ $top }) => ($top ? 700 : 400)};
  font-variant-numeric: tabular-nums;
`;

export const HelpSection = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;

  h3 {
    margin: 0 0 4px;
    font-size: 0.95rem;
    color: #fff;
  }

  ul {
    margin: 0;
    padding-left: 18px;
  }
`;

export const SetupPanel = styled.div`
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`;
