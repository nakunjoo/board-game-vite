import { useState } from "react";
import {
  SetupModalOverlay,
  SetupModalBox,
  SetupTitle,
  SetupSection,
  SetupLabel,
  OptionGroup,
  OptionButton,
  StartButton,
  NonHostMessage,
} from "../../styles/game/casino";

const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: "5분", value: 5 * 60 },
  { label: "10분", value: 10 * 60 },
  { label: "무제한", value: null },
];

const BALANCE_OPTIONS = [1_000, 5_000, 10_000, 50_000, 100_000];

interface CasinoSetupModalProps {
  isHost: boolean;
  memberCount: number;
  onStart: (timeLimit: number | null, initialBalance: number) => void;
}

export default function CasinoSetupModal({
  isHost,
  memberCount,
  onStart,
}: CasinoSetupModalProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(10 * 60);
  const [selectedBalance, setSelectedBalance] = useState(10_000);

  const handleStart = () => {
    if (!isHost) return;
    onStart(selectedTime, selectedBalance);
  };

  return (
    <SetupModalOverlay>
      <SetupModalBox onClick={(e) => e.stopPropagation()}>
        <SetupTitle>🎰 카지노 설정</SetupTitle>

        <SetupSection>
          <SetupLabel>게임 시간</SetupLabel>
          <OptionGroup>
            {TIME_OPTIONS.map((opt) => (
              <OptionButton
                key={String(opt.value)}
                $selected={selectedTime === opt.value}
                onClick={() => setSelectedTime(opt.value)}
              >
                {opt.label}
              </OptionButton>
            ))}
          </OptionGroup>
        </SetupSection>

        <SetupSection>
          <SetupLabel>초기 자금</SetupLabel>
          <OptionGroup>
            {BALANCE_OPTIONS.map((bal) => (
              <OptionButton
                key={bal}
                $selected={selectedBalance === bal}
                onClick={() => setSelectedBalance(bal)}
              >
                {bal.toLocaleString()}
              </OptionButton>
            ))}
          </OptionGroup>
        </SetupSection>

        <SetupSection>
          <SetupLabel>참여 인원: {memberCount}명</SetupLabel>
        </SetupSection>

        {isHost ? (
          <StartButton onClick={handleStart}>게임 시작</StartButton>
        ) : (
          <NonHostMessage>방장이 게임을 시작할 때까지 기다려 주세요.</NonHostMessage>
        )}
      </SetupModalBox>
    </SetupModalOverlay>
  );
}
