import { getCardImage, getCardLabel } from "../../../utils/cards";
import type { Card } from "../../../types/game";
import {
  HrOverlay,
  HrModalContainer,
  HrModalHeader,
  HrModalTitle,
  HrCloseButton,
  HrModalContent,
  HrHandRankItem,
  HrRankNumber,
  HrHandInfo,
  HrHandName,
  HrHandDescription,
  HrCardImages,
  HrCardImageWrapper,
  HrCardImage,
  HrCardLabelText,
} from "../../../styles/game/gang/handRankModal";

interface GangHandRankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CARD_IMAGE_BASE_URL =
  import.meta.env.VITE_CARD_IMAGE_BASE_URL ||
  "https://storage.googleapis.com/teak-banner-431004-n3.appspot.com/images/cards";

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
    image: `${CARD_IMAGE_BASE_URL}/${type}_${valueName}.svg`,
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
      <HrOverlay onClick={onClose} />
      <HrModalContainer>
        <HrModalHeader>
          <HrModalTitle>포커 족보</HrModalTitle>
          <HrCloseButton onClick={onClose}>
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
          </HrCloseButton>
        </HrModalHeader>
        <HrModalContent>
          {handRanks.map((hand) => (
            <HrHandRankItem key={hand.rank}>
              <HrRankNumber>{hand.rank}</HrRankNumber>
              <HrHandInfo>
                <HrHandName>{hand.name}</HrHandName>
                <HrHandDescription>{hand.description}</HrHandDescription>
                <HrCardImages>
                  {hand.cards.map((card, index) => (
                    <HrCardImageWrapper key={index}>
                      <HrCardImage>
                        <img src={getCardImage(card)} alt="" />
                      </HrCardImage>
                      <HrCardLabelText $suit={card.type}>
                        {getCardLabel(card)}
                      </HrCardLabelText>
                    </HrCardImageWrapper>
                  ))}
                </HrCardImages>
              </HrHandInfo>
            </HrHandRankItem>
          ))}
        </HrModalContent>
      </HrModalContainer>
    </>
  );
}
