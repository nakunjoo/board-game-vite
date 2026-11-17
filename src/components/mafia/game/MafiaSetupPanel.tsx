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
import { MAFIA_CONFIG, MAFIA_DISCUSS_OPTIONS } from "../../../utils/games/mafia";

interface Props {
  isHost: boolean;
  memberCount: number;
  onStart: (discussTimeSec: number) => void;
}

/** 시작 전 게임 화면 안에 띄우는 설정 (모달이 아니라 그 아래 채팅을 계속 칠 수 있다) */
export default function MafiaSetupPanel({ isHost, memberCount, onStart }: Props) {
  const [discussTimeSec, setDiscussTimeSec] = useState(120);
  const minPlayers = MAFIA_CONFIG.minPlayers ?? 4;
  // 서버 MafiaHandler.mafiaCount / doctorCount와 같게
  const mafias = memberCount >= 6 ? 2 : 1;
  const doctors = memberCount >= 6 ? 1 : 0;
  const roles =
    memberCount >= minPlayers
      ? `마피아 ${mafias} · 경찰 1${doctors ? " · 의사 1" : ""} · 시민 ${memberCount - mafias - 1 - doctors}`
      : `최소 ${minPlayers}명이 필요합니다`;

  if (!isHost) {
    return (
      <SetupPanel>
        <ModalTitle>🔪 마피아</ModalTitle>
        <ModalNote>
          방장이 게임을 시작하기를 기다리는 중입니다.
          <br />
          참여 인원 {memberCount}명 (최대 {MAFIA_CONFIG.maxPlayers}명) · {roles}
        </ModalNote>
      </SetupPanel>
    );
  }

  return (
    <SetupPanel>
      <ModalTitle>🔪 마피아</ModalTitle>
      <div>
        <ModalLabel>낮 토론 시간</ModalLabel>
        <OptionGroup>
          {MAFIA_DISCUSS_OPTIONS.map((t) => (
            <OptionButton key={t} $selected={discussTimeSec === t} onClick={() => setDiscussTimeSec(t)}>
              {t >= 120 ? `${t / 60}분` : `${t}초`}
            </OptionButton>
          ))}
        </OptionGroup>
      </div>
      <ModalNote>
        참여 인원 {memberCount}명 (최대 {MAFIA_CONFIG.maxPlayers}명)
        <br />
        {roles}
      </ModalNote>
      <PrimaryButton onClick={() => onStart(discussTimeSec)}>게임 시작</PrimaryButton>
    </SetupPanel>
  );
}
