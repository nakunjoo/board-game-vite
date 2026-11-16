import { useState } from "react";
import {
  SetupPanel,
  ModalTitle,
  ModalLabel,
  OptionGroup,
  OptionButton,
  PrimaryButton,
  ModalNote,
} from "../../../styles/game/liar/modal";
import {
  LIAR_CONFIG,
  LIAR_DISCUSS_OPTIONS,
  LIAR_LAP_OPTIONS,
  LIAR_ROUND_OPTIONS,
} from "../../../utils/games/liar";
export interface LiarSettings {
  rounds: number;
  laps: number;
  discussTimeSec: number;
}

interface Props {
  isHost: boolean;
  memberCount: number;
  onStart: (settings: LiarSettings) => void;
}

/** 시작 전 게임 화면 안에 띄우는 설정 */
export default function LiarSetupPanel({ isHost, memberCount, onStart }: Props) {
  const [rounds, setRounds] = useState(3);
  const [laps, setLaps] = useState(1);
  const [discussTimeSec, setDiscussTimeSec] = useState(90);
  const minPlayers = LIAR_CONFIG.minPlayers ?? 3;

  if (!isHost) {
    return (
      <SetupPanel>
        <ModalTitle>🤥 라이어</ModalTitle>
        <ModalNote>
          방장이 게임을 시작하기를 기다리는 중입니다.
          <br />
          참여 인원 {memberCount}명 (최대 {LIAR_CONFIG.maxPlayers}명)
        </ModalNote>
      </SetupPanel>
    );
  }

  return (
    <SetupPanel>
      <ModalTitle>🤥 라이어</ModalTitle>
      <div>
        <ModalLabel>판 수</ModalLabel>
        <OptionGroup>
          {LIAR_ROUND_OPTIONS.map((r) => (
            <OptionButton key={r} $selected={rounds === r} onClick={() => setRounds(r)}>
              {r}판
            </OptionButton>
          ))}
        </OptionGroup>
      </div>
      <div>
        <ModalLabel>설명 바퀴</ModalLabel>
        <OptionGroup>
          {LIAR_LAP_OPTIONS.map((l) => (
            <OptionButton key={l} $selected={laps === l} onClick={() => setLaps(l)}>
              {l}바퀴
            </OptionButton>
          ))}
        </OptionGroup>
      </div>
      <div>
        <ModalLabel>토론 시간</ModalLabel>
        <OptionGroup>
          {LIAR_DISCUSS_OPTIONS.map((t) => (
            <OptionButton key={t} $selected={discussTimeSec === t} onClick={() => setDiscussTimeSec(t)}>
              {t}초
            </OptionButton>
          ))}
        </OptionGroup>
      </div>
      <ModalNote>
        참여 인원 {memberCount}명 (최대 {LIAR_CONFIG.maxPlayers}명)
        {memberCount < minPlayers ? ` · 최소 ${minPlayers}명이 필요합니다` : ""}
      </ModalNote>
      <PrimaryButton onClick={() => onStart({ rounds, laps, discussTimeSec })}>게임 시작</PrimaryButton>
    </SetupPanel>
  );
}
