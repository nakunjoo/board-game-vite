import { useState } from "react";
import {
  BjModalOverlay,
  BjModalBox,
  BjModalTitle,
  BjBetChipsRow,
  BjBetChipBtn,
  BjBetDisplay,
  BjBetSubText,
  BjConfirmBtn,
  BjCancelBtn,
  BjWaitingText,
  BjProgressDots,
  BjDot,
} from "../../../styles/game/blackjack/modal";
import { getBjBetChips, getBjMaxBet } from "../../../utils/games/blackjack";

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
  const [bet, setBet] = useState(0);
  const chips = getBjBetChips(initialChips);
  const maxBet = getBjMaxBet(initialChips);

  const addBet = (amount: number) => {
    setBet((prev) => Math.min(prev + amount, Math.min(maxBet, myChips)));
  };

  const handleConfirm = () => {
    if (bet <= 0) return;
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

            <BjBetDisplay>{bet > 0 ? bet : "—"}</BjBetDisplay>

            <BjBetChipsRow>
              {chips.map((c) => (
                <BjBetChipBtn
                  key={c}
                  $selected={false}
                  onClick={() => addBet(c)}
                  disabled={myChips < c || bet + c > maxBet}
                >
                  +{c}
                </BjBetChipBtn>
              ))}
            </BjBetChipsRow>

            <BjCancelBtn onClick={() => setBet(0)} disabled={bet === 0}>
              초기화
            </BjCancelBtn>

            <BjConfirmBtn onClick={handleConfirm} disabled={bet <= 0 || bet > myChips}>
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
