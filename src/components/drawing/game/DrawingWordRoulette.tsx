import { useEffect, useState } from "react";
import { RouletteWord } from "../../../styles/game/drawing/board";
import { DRAWING_ROULETTE_DECOYS } from "../../../utils/games/drawing";
import { playTickSound } from "../../../utils/audio";

interface Props {
  /** 그리는 사람만 받는 뽑힌 제시어. 나머지는 null → ❓에서 멈춘다 */
  word: string | null;
  /** 그리는 사람 닉네임 (맞히는 사람에게 보이는 문구용) */
  drawerNickname: string;
  /** 이 시각에 그리기가 시작된다 (ready 페이즈 끝) */
  deadline: number | null;
}

/** 단어가 빠르게 돌다가 점점 느려져 뽑힌 제시어에서 멈추는 연출 */
const ROLL_MS = 2000;
/** 멈춘 뒤 읽을 시간. 재연결로 늦게 열면 이만큼은 남기고 돌린다 */
const HOLD_MS = 2000;

export default function DrawingWordRoulette({ word, drawerNickname, deadline }: Props) {
  const [text, setText] = useState(DRAWING_ROULETTE_DECOYS[0]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const rollMs = Math.max(0, Math.min(ROLL_MS, (deadline ?? 0) - Date.now() - HOLD_MS));
    const start = Date.now();
    let i = Math.floor(Math.random() * DRAWING_ROULETTE_DECOYS.length);
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= rollMs) {
        setDone(true);
        if (rollMs > 0) playTickSound(true);
        return;
      }
      i = (i + 1 + Math.floor(Math.random() * 3)) % DRAWING_ROULETTE_DECOYS.length;
      setText(DRAWING_ROULETTE_DECOYS[i]);
      playTickSound();
      // 처음엔 빠르게, 끝으로 갈수록 느리게
      const p = elapsed / rollMs;
      timer = setTimeout(step, 50 + 230 * p * p);
    };
    timer = setTimeout(step, 0);
    return () => clearTimeout(timer);
  }, [deadline]);

  const mine = word !== null;
  const title = done
    ? mine
      ? "🎲 이번 제시어는"
      : `🎲 ${drawerNickname}님이 제시어를 뽑았어요`
    : mine
      ? "🎲 제시어 뽑는 중…"
      : `🎲 ${drawerNickname}님이 제시어를 뽑는 중…`;
  return (
    <>
      <span>{title}</span>
      <RouletteWord $done={done} aria-live="polite">
        {done ? (word ?? "❓") : text}
      </RouletteWord>
    </>
  );
}
