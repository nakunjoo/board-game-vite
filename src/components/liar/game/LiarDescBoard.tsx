import { Fragment, useLayoutEffect, useRef } from "react";
import type { LiarDescription, LiarPhase } from "../types";
import {
  DescBoard,
  DescHeader,
  DescChevron,
  DescScroll,
  DescLine,
  LapDivider,
  PendingLine,
} from "../../../styles/game/liar/board";

interface Props {
  phase: LiarPhase;
  descriptions: LiarDescription[];
  speakOrder: string[];
  speakerId: string | null;
  lap: number | null;
  laps: number;
  myPlayerId: string;
  nicknameOf: (playerId: string) => string;
  colorOf: (playerId: string) => string;
  /** 펼쳐져 있는지 (접으면 제목 줄만 남고 채팅 기록이 커진다) */
  open: boolean;
  onToggle: () => void;
}

/** 아래에서 이만큼 안쪽이면 "맨 아래를 보고 있다"로 친다 */
const STICK_PX = 24;

/**
 * 가운데 설명판: 이번 판 설명을 순서대로 쌓는다. 설명판 안에서만 스크롤되고,
 * 맨 아래를 보고 있을 때만 새 설명·차례 변경을 따라 내려간다 (위로 올려 읽는 중이면 그대로).
 * 접으면 제목 줄에 지금 누가 설명 중인지만 보인다.
 */
export default function LiarDescBoard(props: Props) {
  const { phase, descriptions, speakOrder, speakerId, lap, laps, myPlayerId, nicknameOf, colorOf, open, onToggle } =
    props;
  const ref = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  // 마지막으로 우리가 내려 준 스크롤 위치
  const autoTopRef = useRef(-1);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    // 우리가 내린 스크롤이면 무시한다. 스크롤 이벤트는 늦게 오는데 그 사이 새 설명·차례 줄이 붙어
    // "맨 아래에서 멀어졌다"로 잘못 읽고 따라가기를 멈추던 문제 (설명과 다음 차례가 거의 동시에 온다)
    if (Math.abs(el.scrollTop - autoTopRef.current) < 2) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_PX;
  };

  // 그릴 때마다: 새 판이면 다시 따라가기, 맨 아래를 보고 있었으면 따라 내려간다 (화면에 그리기 전에)
  useLayoutEffect(() => {
    if (descriptions.length === 0) stickRef.current = true;
    const el = ref.current;
    if (el && stickRef.current) {
      el.scrollTop = el.scrollHeight;
      autoTopRef.current = el.scrollTop;
    }
  });

  const speaking = phase === "describe" && speakerId;
  const speakerLabel = speaking ? (speakerId === myPlayerId ? "내 차례!" : `${nicknameOf(speakerId)}님 설명 중…`) : "";
  // 이번 바퀴에서 아직 차례가 안 온 사람 (중간에 나간 사람은 서버가 건너뛰므로 빼고 — 남기면 이름 없이 " · "만 보였다)
  const pending = (
    speaking && speakOrder.includes(speakerId)
      ? speakOrder.slice(speakOrder.indexOf(speakerId) + 1)
      : phase === "word"
        ? speakOrder
        : []
  ).filter((pid) => nicknameOf(pid) !== "");
  const lastLap = descriptions[descriptions.length - 1]?.lap ?? 1;
  const showLaps = laps > 1;

  return (
    <DescBoard $open={open}>
      <DescHeader type="button" onClick={onToggle} aria-expanded={open}>
        <span>설명판 {descriptions.length > 0 && `(${descriptions.length})`}</span>
        {/* 접혀 있어도 지금 누가 설명 중인지는 보인다 */}
        <span>{!open && speakerLabel}</span>
        <DescChevron $open={open} aria-hidden="true">
          ▾
        </DescChevron>
        <span style={{ color: "#999" }}>{open ? "접기" : "펴기"}</span>
      </DescHeader>
      {open && (
        <DescScroll ref={ref} onScroll={onScroll}>
          {descriptions.map((d, i) => (
            <Fragment key={i}>
              {showLaps && (i === 0 || descriptions[i - 1].lap !== d.lap) && <LapDivider>{d.lap}바퀴</LapDivider>}
              <DescLine $skip={d.skipped}>
                <b style={{ color: colorOf(d.playerId) }}>{d.playerId === myPlayerId ? "나" : d.nickname}</b>
                <span>{d.text}</span>
              </DescLine>
            </Fragment>
          ))}
          {speaking && (
            <>
              {showLaps && lap !== null && (descriptions.length === 0 || lap !== lastLap) && (
                <LapDivider>{lap}바퀴</LapDivider>
              )}
              <DescLine $now>
                <b>{speakerId === myPlayerId ? "나" : nicknameOf(speakerId)}</b>
                <span>{speakerId === myPlayerId ? "내 차례! 한 줄로 설명하세요" : "설명 중…"}</span>
              </DescLine>
            </>
          )}
          {pending.length > 0 && <PendingLine>다음: {pending.map((pid) => nicknameOf(pid)).join(" · ")}</PendingLine>}
          {descriptions.length === 0 && !speaking && pending.length === 0 && (
            <PendingLine>아직 설명이 없어요</PendingLine>
          )}
        </DescScroll>
      )}
    </DescBoard>
  );
}
