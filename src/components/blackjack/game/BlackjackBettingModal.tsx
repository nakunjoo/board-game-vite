import { useState } from "react";
import {
  BjModalOverlay,
  BjModalBox,
  BjModalTitle,
  BjBetDisplay,
  BjBetSubText,
  BjConfirmBtn,
  BjWaitingText,
  BjProgressDots,
  BjDot,
  BjBetStepRow,
  BjBetStepBtn,
  BjBetMinMaxRow,
  BjBetMinMaxBtn,
} from "../../../styles/game/blackjack/modal";
import { getBjMaxBet } from "../../../utils/games/blackjack";

const MIN_BET = 10;
const STEP = 10;

interface Props {
  myChips: number;
  initialChips: number;
  bettingDoneCount: number;
  totalPlayers: number;
  alreadyBet: boolean;
  onPlaceBet: (amount: number) => void;
}

export default function BlackjackBettingModal({
  myChips,
  initialChips,
  bettingDoneCount,
  totalPlayers,
  alreadyBet,
  onPlaceBet,
}: Props) {
  const maxBet = getBjMaxBet(initialChips);
  const [bet, setBet] = useState(maxBet);

  const clamp = (v: number) => Math.max(MIN_BET, Math.min(maxBet, v));

  const handleConfirm = () => {
    if (bet < MIN_BET) return;
    onPlaceBet(bet);
  };

  return (
    <BjModalOverlay>
      <BjModalBox>
        <BjModalTitle>베팅</BjModalTitle>

        {alreadyBet ? (
          <>
            <BjWaitingText>베팅 완료! 다른 플레이어를 기다리는 중...</BjWaitingText>
            <BjProgressDots>
              {Array.from({ length: totalPlayers }, (_, i) => (
                <BjDot key={i} $filled={i < bettingDoneCount} />
              ))}
            </BjProgressDots>
            <BjWaitingText style={{ fontSize: "12px" }}>
              {bettingDoneCount} / {totalPlayers}명 완료
            </BjWaitingText>
          </>
        ) : (
          <>
            <BjBetSubText>보유 칩: {myChips} | 최대 베팅: {maxBet}</BjBetSubText>

            <BjBetDisplay>{bet}</BjBetDisplay>

            <BjBetStepRow>
              <BjBetStepBtn onClick={() => setBet(clamp(bet - STEP))} disabled={bet <= MIN_BET}>
                −
              </BjBetStepBtn>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", minWidth: 40, textAlign: "center" }}>
                10 단위
              </span>
              <BjBetStepBtn onClick={() => setBet(clamp(bet + STEP))} disabled={bet >= maxBet}>
                +
              </BjBetStepBtn>
            </BjBetStepRow>

            <BjBetMinMaxRow>
              <BjBetMinMaxBtn onClick={() => setBet(MIN_BET)} disabled={bet === MIN_BET}>
                최소 ({MIN_BET})
              </BjBetMinMaxBtn>
              <BjBetMinMaxBtn onClick={() => setBet(maxBet)} disabled={bet === maxBet}>
                최대 ({maxBet})
              </BjBetMinMaxBtn>
            </BjBetMinMaxRow>

            <BjConfirmBtn onClick={handleConfirm} disabled={bet < MIN_BET}>
              베팅 확정
            </BjConfirmBtn>

            <BjProgressDots>
              {Array.from({ length: totalPlayers }, (_, i) => (
                <BjDot key={i} $filled={i < bettingDoneCount} />
              ))}
            </BjProgressDots>
            <BjBetSubText>{bettingDoneCount} / {totalPlayers}명 베팅 완료</BjBetSubText>
          </>
        )}
      </BjModalBox>
    </BjModalOverlay>
  );
}
