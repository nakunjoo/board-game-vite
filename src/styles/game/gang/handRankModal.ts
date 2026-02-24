import styled from "styled-components";

export const HrOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

export const HrModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  border: 2px solid #3a3a3a;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1001;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 85vh;
  }
`;

export const HrModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #3a3a3a;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const HrModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const HrCloseButton = styled.button`
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: white;
    transform: scale(1.1);
  }
`;

export const HrModalContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`;

export const HrHandRankItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(100, 108, 255, 0.3);
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.75rem;
  }
`;

export const HrRankNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #646cff;
  min-width: 40px;
  text-align: center;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    min-width: 32px;
  }
`;

export const HrHandInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const HrHandName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const HrHandDescription = styled.div`
  font-size: 0.9rem;
  color: #aaa;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const HrCardImages = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-top: 0.35rem;
  }
`;

export const HrCardImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

export const HrCardImage = styled.div`
  width: 40px;
  height: 56px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 45px;
  }
`;

export const HrCardLabelText = styled.div<{ $suit: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $suit }) =>
    $suit === "hearts" || $suit === "diamonds" ? "#ff4444" : "#ffffff"};
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;
