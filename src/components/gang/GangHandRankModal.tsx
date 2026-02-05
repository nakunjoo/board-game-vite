import styled from "styled-components";
import { getCardImage, getCardLabel } from "../../utils/cards";
import type { Card } from "../../types/game";

interface GangHandRankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 카드 생성 헬퍼 함수
const createCard = (type: string, value: number): Card => {
  const getValueFileName = (v: number): string => {
    switch (v) {
      case 1:
      case 14:
        return "ace";
      case 11:
        return "jack";
      case 12:
        return "queen";
      case 13:
        return "king";
      default:
        return String(v);
    }
  };

  const valueName = getValueFileName(value);
  return {
    type,
    value,
    image: `/images/cards/${type}_${valueName}.svg`,
    name: `${type}_${valueName}`,
  };
};

const handRanks = [
  {
    rank: 10,
    name: "하이카드",
    description: "아무 조합도 없음",
    cards: [
      createCard("spades", 14),
      createCard("hearts", 11),
      createCard("diamonds", 9),
      createCard("clubs", 6),
      createCard("spades", 2),
    ],
  },
  {
    rank: 9,
    name: "원페어",
    description: "같은 숫자 2장",
    cards: [
      createCard("spades", 10),
      createCard("hearts", 10),
      createCard("diamonds", 13),
      createCard("clubs", 7),
      createCard("spades", 2),
    ],
  },
  {
    rank: 8,
    name: "투페어",
    description: "같은 숫자 2장씩 2세트",
    cards: [
      createCard("spades", 11),
      createCard("hearts", 11),
      createCard("diamonds", 8),
      createCard("clubs", 8),
      createCard("spades", 3),
    ],
  },
  {
    rank: 7,
    name: "트리플",
    description: "같은 숫자 3장",
    cards: [
      createCard("spades", 12),
      createCard("hearts", 12),
      createCard("diamonds", 12),
      createCard("clubs", 7),
      createCard("spades", 4),
    ],
  },
  {
    rank: 6,
    name: "스트레이트",
    description: "연속된 숫자 5장",
    cards: [
      createCard("spades", 9),
      createCard("hearts", 8),
      createCard("diamonds", 7),
      createCard("clubs", 6),
      createCard("spades", 5),
    ],
  },
  {
    rank: 5,
    name: "플러시",
    description: "같은 무늬 5장",
    cards: [
      createCard("diamonds", 13),
      createCard("diamonds", 10),
      createCard("diamonds", 7),
      createCard("diamonds", 5),
      createCard("diamonds", 2),
    ],
  },
  {
    rank: 4,
    name: "풀하우스",
    description: "트리플 + 페어",
    cards: [
      createCard("spades", 14),
      createCard("hearts", 14),
      createCard("diamonds", 14),
      createCard("clubs", 13),
      createCard("hearts", 13),
    ],
  },
  {
    rank: 3,
    name: "포카드",
    description: "같은 숫자 4장",
    cards: [
      createCard("spades", 13),
      createCard("hearts", 13),
      createCard("diamonds", 13),
      createCard("clubs", 13),
      createCard("spades", 2),
    ],
  },
  {
    rank: 2,
    name: "스트레이트 플러시",
    description: "같은 무늬의 연속된 5장",
    cards: [
      createCard("hearts", 9),
      createCard("hearts", 8),
      createCard("hearts", 7),
      createCard("hearts", 6),
      createCard("hearts", 5),
    ],
  },
  {
    rank: 1,
    name: "로얄 스트레이트 플러시",
    description: "같은 무늬의 A-K-Q-J-10",
    cards: [
      createCard("spades", 14),
      createCard("spades", 13),
      createCard("spades", 12),
      createCard("spades", 11),
      createCard("spades", 10),
    ],
  },
];

export default function GangHandRankModal({
  isOpen,
  onClose,
}: GangHandRankModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={onClose} />
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>포커 족보</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          {handRanks.map((hand) => (
            <HandRankItem key={hand.rank}>
              <RankNumber>{hand.rank}</RankNumber>
              <HandInfo>
                <HandName>{hand.name}</HandName>
                <HandDescription>{hand.description}</HandDescription>
                <CardImages>
                  {hand.cards.map((card, index) => (
                    <CardImageWrapper key={index}>
                      <CardImage>
                        <img src={getCardImage(card)} alt="" />
                      </CardImage>
                      <CardLabelText $suit={card.type}>
                        {getCardLabel(card)}
                      </CardLabelText>
                    </CardImageWrapper>
                  ))}
                </CardImages>
              </HandInfo>
            </HandRankItem>
          ))}
        </ModalContent>
      </ModalContainer>
    </>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
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

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #3a3a3a;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
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

const ModalContent = styled.div`
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

const HandRankItem = styled.div`
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

const RankNumber = styled.div`
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

const HandInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const HandName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HandDescription = styled.div`
  font-size: 0.9rem;
  color: #aaa;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const CardImages = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-top: 0.35rem;
  }
`;

const CardImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const CardImage = styled.div`
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

const CardLabelText = styled.div<{ $suit: string }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $suit }) =>
    $suit === "hearts" || $suit === "diamonds" ? "#ff4444" : "#ffffff"};
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;
