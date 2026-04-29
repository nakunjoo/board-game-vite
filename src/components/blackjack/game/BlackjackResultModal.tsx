import type { BjRoundResult } from "../types";
import type { Card } from "../../../types/game";
import {
  BjModalOverlay,
  BjModalBox,
  BjModalTitle,
  BjResultSection,
  BjResultPlayerRow,
  BjResultNickname,
  BjResultHandRow,
  BjResultBadge,
  BjResultPayout,
  BjChipChange,
  BjConfirmBtn,
  BjBetSubText,
} from "../../../styles/game/blackjack/modal";
import { BjCardImg, BjHandValue } from "../../../styles/game/blackjack/board";

interface Props {
  result: BjRoundResult;
  myPlayerId: string;
  readyCount: number;
  onNextRound: () => void;
  isGameOver: boolean;
}

function calcHandValue(cards: Card[]): number {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    const v = c.value >= 10 ? 10 : c.value;
    sum += v;
    if (c.value === 1) aces++;
  }
  while (sum <= 11 && aces > 0) { sum += 10; aces--; }
  return sum;
}

const RESULT_LABEL: Record<string, string> = { win: "승", lose: "패", push: "무" };

export default function BlackjackResultModal({ result, myPlayerId, readyCount, onNextRound, isGameOver }: Props) {
  const { dealerHand, dealerValue, dealerBust, dealerBlackjack, playerResults, round, totalRounds } = result;

  return (
    <BjModalOverlay>
      <BjModalBox>
        <BjModalTitle>라운드 {round} 결과</BjModalTitle>

        {/* 딜러 */}
        <BjResultSection>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>딜러</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {dealerHand.map((c, i) => (
              <BjCardImg key={i} src={c.image} alt={c.name} $result={undefined} style={{ width: 40, height: 56 }} />
            ))}
          </div>
          <BjHandValue $bust={dealerBust} $blackjack={dealerBlackjack}>
            {dealerBust ? "버스트" : dealerBlackjack ? "블랙잭!" : `${dealerValue}`}
          </BjHandValue>
        </BjResultSection>

        {/* 플레이어별 결과 */}
        {playerResults.map((pr) => {
          const prev = pr.chipsAfter - pr.hands.reduce((acc, h) => {
            if (h.result === "win") return acc + (h.payout - h.bet);
            if (h.result === "lose") return acc - h.bet;
            return acc;
          }, 0);
          const delta = pr.chipsAfter - prev;
          const isMe = pr.playerId === myPlayerId;

          return (
            <BjResultSection key={pr.playerId} style={{ border: isMe ? "1px solid rgba(52,152,219,0.5)" : undefined }}>
              <BjResultPlayerRow>
                <BjResultNickname>{isMe ? "나" : pr.nickname}</BjResultNickname>
                <BjChipChange $delta={delta}>
                  {delta > 0 ? `+${delta}` : delta} → {pr.chipsAfter}칩
                </BjChipChange>
              </BjResultPlayerRow>
              {pr.hands.map((h, hi) => (
                <BjResultHandRow key={hi} $result={h.result}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {h.cards.map((c, ci) => (
                      <BjCardImg key={ci} src={c.image} alt={c.name} $result={h.result} style={{ width: 32, height: 44 }} />
                    ))}
                  </div>
                  <BjHandValue $bust={h.result === "lose" && calcHandValue(h.cards) > 21} $blackjack={h.isBlackjack}>
                    {h.isBlackjack ? "BJ" : calcHandValue(h.cards)}
                  </BjHandValue>
                  <BjResultBadge $result={h.result}>{RESULT_LABEL[h.result]}</BjResultBadge>
                  <BjResultPayout $result={h.result}>
                    {h.result === "win" ? `+${h.payout - h.bet}` : h.result === "lose" ? `-${h.bet}` : "±0"}
                  </BjResultPayout>
                </BjResultHandRow>
              ))}
            </BjResultSection>
          );
        })}

        <BjBetSubText>{readyCount} / {playerResults.length}명 준비 완료</BjBetSubText>

        <BjConfirmBtn onClick={onNextRound}>
          {isGameOver ? "게임 종료" : round >= totalRounds ? "최종 결과 보기" : "다음 라운드"}
        </BjConfirmBtn>
      </BjModalBox>
    </BjModalOverlay>
  );
}
