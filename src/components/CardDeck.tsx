import type { Card } from "../types/game";
import { getCardImage, getCardName } from "../utils/cards";
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

  return (
    <CardDeckContainer onClick={onClick}>
      {cards.map((card, index) => (
        <CardWrapper key={getCardName(card)} $isFlipped={false} $index={index}>
          <div className="card-inner">
            <div className="card-face card-back">
              <img src={cardBack} alt="카드 뒷면" />
            </div>
            <div className="card-face card-front">
              <img src={getCardImage(card)} alt={getCardName(card)} />
            </div>
          </div>
        </CardWrapper>
      ))}
    </CardDeckContainer>
  );
}
