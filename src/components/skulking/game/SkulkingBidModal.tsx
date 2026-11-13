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
import { useDeadlineSeconds } from "../../../utils/useDeadlineSeconds";

const BID_TIME_LIMIT = 20;

interface Props {
  round: number;
  myHand: Card[];
  onBid: (bid: number) => void;
  submitted: boolean;
  bidCount: number;
  totalPlayers: number;
  /** 비드 마감 시각(ms). 시간이 지나면 서버가 0으로 제출한다 */
  bidDeadline: number | null;
}

export default function SkulkingBidModal({ round, myHand, onBid, submitted, bidCount, totalPlayers, bidDeadline }: Props) {
  const [selectedBid, setSelectedBid] = React.useState<number | null>(null);
  const timeLeft = useDeadlineSeconds(bidDeadline, BID_TIME_LIMIT);
  const submittedRef = React.useRef(false);

  // 외부에서 submitted가 true가 되면 ref도 동기화
  React.useEffect(() => {
    if (submitted) submittedRef.current = true;
  }, [submitted]);

  const handleConfirm = () => {
    if (selectedBid === null || submittedRef.current) return;
    submittedRef.current = true;
    onBid(selectedBid);
  };

  const timerRatio = timeLeft / BID_TIME_LIMIT;
  const isUrgent = timeLeft <= 5 && !submitted;

  return (
    <BidOverlay>
      <BidModal onClick={(e) => e.stopPropagation()}>
        <BidTitle>이번 라운드에서 딸 트릭 수를 선언하세요</BidTitle>

        {/* 타이머 바 */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: submitted ? "0%" : `${timerRatio * 100}%`,
                background: isUrgent ? "#e74c3c" : "#f39c12",
                borderRadius: "4px",
                transition: submitted ? "none" : "width 1s linear, background 0.3s",
              }}
            />
          </div>
          {!submitted && (
            <div
              style={{
                textAlign: "right",
                fontSize: "0.75rem",
                color: isUrgent ? "#e74c3c" : "rgba(255,255,255,0.5)",
                fontWeight: isUrgent ? "bold" : "normal",
              }}
            >
              {timeLeft}초
            </div>
          )}
        </div>

        {submitted ? (
          /* 제출 완료 대기 화면 */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "16px 0",
            }}
          >
            <div style={{ color: "#4caf50", fontSize: "1rem", fontWeight: "bold" }}>
              비드 제출 완료 ✓
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
              다른 플레이어 대기 중...
            </div>
            <div
              style={{
                marginTop: "4px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "5px 18px",
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {bidCount} / {totalPlayers} 명 완료
            </div>
          </div>
        ) : (
          <>
            {myHand.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  ...(round > 5
                    ? {
                        maxWidth: (() => {
                          const perRow = Math.ceil(myHand.length / 2);
                          return `${perRow * 46 + (perRow - 1) * 6}px`;
                        })(),
                      }
                    : {}),
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

            <BidButtons $round={round}>
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
          </>
        )}
      </BidModal>
    </BidOverlay>
  );
}
