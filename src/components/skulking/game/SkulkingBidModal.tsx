import React from "react";
import type { Card } from "../../../types/game";
import {
  SKULKING_SUIT_LABELS,
  SKULKING_SUIT_NAMES,
  isSpecialCard,
} from "../../../utils/games/skulking";
import {
  BidOverlay,
  BidModal,
  BidTitle,
  BidButtons,
  BidButton,
  BidConfirmButton,
} from "../../../styles/game/skulking/bidModal";
import { SkCard, SkCardLabel, SkCardValue } from "../../../styles/game/skulking/card";

interface Props {
  round: number;
  myHand: Card[];
  onBid: (bid: number) => void;
}

export default function SkulkingBidModal({ round, myHand, onBid }: Props) {
  const [selectedBid, setSelectedBid] = React.useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedBid === null) return;
    onBid(selectedBid);
    setSelectedBid(null);
  };

  return (
    <BidOverlay>
      <BidModal onClick={(e) => e.stopPropagation()}>
        <BidTitle>이번 라운드에서 딸 트릭 수를 선언하세요</BidTitle>

        {myHand.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {myHand.map((card) => (
              <SkCard
                key={card.name}
                $type={card.type}
                $small
                title={`${SKULKING_SUIT_NAMES[card.type] ?? card.type}${!isSpecialCard(card.type) ? ` ${card.value}` : ""}`}
              >
                <SkCardLabel $small>
                  {SKULKING_SUIT_LABELS[card.type] ?? "?"}
                </SkCardLabel>
                {!isSpecialCard(card.type) && (
                  <SkCardValue $small>{card.value}</SkCardValue>
                )}
              </SkCard>
            ))}
          </div>
        )}

        <BidButtons>
          {Array.from({ length: round + 1 }, (_, i) => i).map((n) => (
            <BidButton
              key={n}
              $selected={selectedBid === n}
              onClick={() => setSelectedBid(n)}
            >
              {n}
            </BidButton>
          ))}
        </BidButtons>

        <BidConfirmButton onClick={handleConfirm} disabled={selectedBid === null}>
          비드 확정
        </BidConfirmButton>
      </BidModal>
    </BidOverlay>
  );
}
