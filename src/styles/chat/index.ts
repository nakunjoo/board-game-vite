import styled from "styled-components";

export const ChatToggleButtonWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

export const ChatNotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background-color: #ff4444;
  border-radius: 50%;
  border: 2px solid #242424;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(255, 68, 68, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
    }
  }

  @media (max-width: 768px) {
    width: 10px;
    height: 10px;
    top: -3px;
    right: -3px;
  }
`;

export const ChatToggleButton = styled.button`
  padding: 0.5rem;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #535bf2;
    border-color: transparent;
  }

  @media (max-width: 768px) {
    padding: 0.3rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const ChatArea = styled.div<{ $isOpen?: boolean }>`
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 1080px) {
    flex: none;
    min-width: 0;
    max-width: none;
    height: 300px;
  }

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60vh;
    max-height: 400px;
    transform: translateY(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
    transition: transform 0.3s ease-in-out;
    border-radius: 16px 16px 0 0;
    z-index: 100;
  }
`;

export const ChatHeaderMobile = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #3a3a3a;
    font-weight: 600;
  }
`;

export const ChatCloseButton = styled.button`
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: white;
    border-color: transparent;
  }
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  @media (max-width: 768px) {
    height: calc(100% - 110px);
  }
`;

export const NoMessages = styled.p`
  color: #666;
  text-align: center;
  padding: 2rem;
`;

export const ChatMessage = styled.div<{ $isSystem?: boolean }>`
  margin-bottom: 0.75rem;
  padding: ${({ $isSystem }) => ($isSystem ? "0.25rem" : "0.5rem 0.75rem")};
  background-color: ${({ $isSystem }) =>
    $isSystem ? "transparent" : "#2a2a2a"};
  border-radius: 6px;
  text-align: ${({ $isSystem }) => ($isSystem ? "center" : "left")};
  color: ${({ $isSystem }) => ($isSystem ? "#888" : "#e0e0e0")};
  font-size: ${({ $isSystem }) => ($isSystem ? "0.85rem" : "inherit")};
`;

export const ChatInputArea = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #3a3a3a;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const ChatInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.75rem 1rem;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  background-color: #2a2a2a;
  color: white;
  font-size: 1rem;

  &::placeholder {
    color: #888;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
`;

export const ChatSendButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: #535bf2;
    border-color: transparent;
  }

  &:disabled {
    background-color: #3a3a3a;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
`;
