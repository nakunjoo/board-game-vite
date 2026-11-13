import { useEffect, useState } from "react";

const secondsLeft = (deadline: number) =>
  Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

/**
 * 마감 시각(ms)까지 남은 초. 250ms마다 다시 계산한다.
 * 틱마다 1씩 빼면 백그라운드·iOS 스로틀 동안 멈췄다가 늦게 따라온다 (CLAUDE.md "타이머 동작 방식").
 * `fallback`은 마감 시각을 처음 계산하기 전 한 번 보여줄 값.
 */
export function useDeadlineSeconds(deadline: number | null, fallback: number): number {
  const [state, setState] = useState<{ deadline: number | null; left: number }>({
    deadline: null,
    left: fallback,
  });

  useEffect(() => {
    if (deadline === null) return;
    const tick = () => setState({ deadline, left: secondsLeft(deadline) });
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 250);
    // 화면에 돌아오면 다음 틱을 기다리지 않고 바로 맞춘다
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [deadline]);

  if (deadline === null) return 0;
  // 마감 시각이 막 바뀌었으면 첫 틱 전까지 이전 마감의 숫자 대신 fallback을 보여준다
  return state.deadline === deadline ? state.left : fallback;
}
