import type { Card } from "../types/game";
import {
  CardDeck as CardDeckContainer,
  CardWrapper,
} from "../styles/game";

interface CardDeckProps {
  cards: Card[];
  cardBack: string;
  onClick?: () => void;
}

export default function CardDeck({ cards, cardBack, onClick }: CardDeckProps) {
  if (cards.length === 0) return null;

  // 8장마다 1px 두께이므로, 각 레이어의 대표 index만 렌더링
  const layers = Math.ceil(cards.length / 8);
  const layerIndices = Array.from({ length: layers }, (_, i) => i * 8);

  return (
    <CardDeckContainer onClick={onClick}>
      {layerIndices.map((index) => (
        <CardWrapper key={index} $isFlipped={false} $index={index}>
          <div className="card-inner">
            <div className="card-face card-back">
              <img src={cardBack} alt="카드 뒷면" />
            </div>
          </div>
        </CardWrapper>
      ))}
    </CardDeckContainer>
  );
}
