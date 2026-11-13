import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  HandScrollWrap,
  HandScrollArea,
  HandMoreHintBadge,
} from "../../../styles/game/skulking/board";

interface Props {
  children: ReactNode;
  /** 손패 구성·낼 수 있는 카드가 바뀔 때마다 달라지는 값 (다시 셀 시점) */
  contentKey: string;
}

interface Hidden {
  left: number;
  right: number;
  leftPlayable: boolean;
  rightPlayable: boolean;
}

const NONE: Hidden = { left: 0, right: 0, leftPlayable: false, rightPlayable: false };

/**
 * 휴대폰에서 손패가 가로로 넘치면 가려진 쪽에 남은 장수를 표시한다.
 * 카드 요소에 `data-hand-card`, 낼 수 있는 카드에 `data-playable`을 붙여 둔다.
 * 낼 수 있는 카드가 가려진 쪽에만 있으면 표시를 노랗게 깜빡인다.
 */
export default function SkulkingHandScroller({ children, contentKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState<Hidden>(NONE);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const next = { ...NONE };
    let visiblePlayable = false;
    el.querySelectorAll<HTMLElement>("[data-hand-card]").forEach((card) => {
      const r = card.getBoundingClientRect();
      const center = (r.left + r.right) / 2;
      const playable = card.dataset.playable === "1";
      if (center < box.left) {
        next.left++;
        if (playable) next.leftPlayable = true;
      } else if (center > box.right) {
        next.right++;
        if (playable) next.rightPlayable = true;
      } else if (playable) {
        visiblePlayable = true;
      }
    });
    // 화면 안에 낼 수 있는 카드가 있으면 굳이 재촉하지 않는다
    if (visiblePlayable) {
      next.leftPlayable = false;
      next.rightPlayable = false;
    }
    setHidden((prev) =>
      prev.left === next.left &&
      prev.right === next.right &&
      prev.leftPlayable === next.leftPlayable &&
      prev.rightPlayable === next.rightPlayable
        ? prev
        : next,
    );
  }, []);

  // 손패가 바뀌면 그려진 뒤 다시 센다
  useLayoutEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [measure, contentKey]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const scrollBy = (dir: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <HandScrollWrap>
      {hidden.left > 0 && (
        <HandMoreHintBadge
          type="button"
          $side="left"
          $highlight={hidden.leftPlayable}
          onClick={() => scrollBy(-1)}
          aria-label={`왼쪽에 카드 ${hidden.left}장 더 있음`}
        >
          ‹ +{hidden.left}
        </HandMoreHintBadge>
      )}
      <HandScrollArea ref={ref}>{children}</HandScrollArea>
      {hidden.right > 0 && (
        <HandMoreHintBadge
          type="button"
          $side="right"
          $highlight={hidden.rightPlayable}
          onClick={() => scrollBy(1)}
          aria-label={`오른쪽에 카드 ${hidden.right}장 더 있음`}
        >
          +{hidden.right} ›
        </HandMoreHintBadge>
      )}
    </HandScrollWrap>
  );
}
