import { useState } from "react";
import {
  SetupPanel,
  ModalTitle,
  ModalLabel,
  OptionGroup,
  OptionButton,
  PrimaryButton,
  ModalNote,
} from "../../../styles/game/drawing/modal";
import { DRAWING_ROUND_OPTIONS, DRAWING_TIME_OPTIONS, DRAWING_CONFIG } from "../../../utils/games/drawing";

interface Props {
  isHost: boolean;
  memberCount: number;
  onStart: (rounds: number, drawTimeSec: number) => void;
}

/** 시작 전 그림판 위에 띄우는 설정 (밑의 채팅 입력칸은 계속 쓸 수 있게 모달이 아니다) */
export default function DrawingSetupModal({ isHost, memberCount, onStart }: Props) {
  const [rounds, setRounds] = useState(2);
  const [drawTime, setDrawTime] = useState(80);
  const minPlayers = DRAWING_CONFIG.minPlayers ?? 3;

  return (
    <SetupPanel>
        <ModalTitle>🎨 끄적끄적</ModalTitle>
        {isHost ? (
          <>
            <div>
              <ModalLabel>바퀴 수 (인원 × 바퀴만큼 그림을 그려요)</ModalLabel>
              <OptionGroup>
                {DRAWING_ROUND_OPTIONS.map((r) => (
                  <OptionButton key={r} $selected={rounds === r} onClick={() => setRounds(r)}>
                    {r}바퀴
                  </OptionButton>
                ))}
              </OptionGroup>
            </div>
            <div>
              <ModalLabel>그리는 시간</ModalLabel>
              <OptionGroup>
                {DRAWING_TIME_OPTIONS.map((t) => (
                  <OptionButton key={t} $selected={drawTime === t} onClick={() => setDrawTime(t)}>
                    {t}초
                  </OptionButton>
                ))}
              </OptionGroup>
            </div>
            <ModalNote>
              참여 인원 {memberCount}명{memberCount < minPlayers ? ` · 최소 ${minPlayers}명이 필요합니다` : ""}
            </ModalNote>
            <PrimaryButton onClick={() => onStart(rounds, drawTime)}>게임 시작</PrimaryButton>
          </>
        ) : (
          <ModalNote>
            방장이 게임을 시작하기를 기다리는 중입니다.
            <br />
            참여 인원 {memberCount}명
          </ModalNote>
        )}
    </SetupPanel>
  );
}
