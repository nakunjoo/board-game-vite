import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  PopupOverlay,
  PopupCard,
  PopupEmoji,
  PopupTitle,
  PopupBody,
  PopupCount,
  PopupHint,
} from "../styles/game/phasePopup";
import type { PopupTone } from "../styles/game/phasePopup";

export interface PhasePopupContent {
  /** 바뀌면 다시 뜬다 (예: `result-3`). 같은 키는 닫은 뒤 다시 뜨지 않는다 */
  key: string;
  emoji?: string;
  title: ReactNode;
  body?: ReactNode;
  tone?: PopupTone;
  /** 가운데 큰 숫자로 보여 줄 남은 초 + 설명 ("뒤 설명 시작") */
  countdown?: { seconds: number; label: string };
  /** 이 시간이 지나면 저절로 닫힌다 (없으면 단계가 바뀌거나 눌러서 닫을 때까지) */
  autoCloseMs?: number;
}

/**
 * 단계가 바뀔 때 화면 가운데 띄우는 팝업 (라이어·마피아).
 * 판이 끝나고 다음 판이 시작되는 게 위쪽 글자로만 바뀌어 눈치채지 못했다 — 가운데에 크게 알린다.
 * 아무 데나 누르면 닫히고, content가 null이 되면(단계가 바뀌면) 사라진다
 */
export default function PhasePopup({ content }: { content: PhasePopupContent | null }) {
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const key = content?.key ?? null;
  const autoCloseMs = content?.autoCloseMs;

  useEffect(() => {
    if (!key || !autoCloseMs) return;
    const t = setTimeout(() => setClosedKey(key), autoCloseMs);
    return () => clearTimeout(t);
  }, [key, autoCloseMs]);

  if (!content || closedKey === content.key) return null;
  const close = () => setClosedKey(content.key);

  return (
    <PopupOverlay onClick={close} role="dialog" aria-live="polite">
      <PopupCard $tone={content.tone ?? "neutral"}>
        {content.emoji && <PopupEmoji aria-hidden>{content.emoji}</PopupEmoji>}
        <PopupTitle>{content.title}</PopupTitle>
        {content.body && <PopupBody>{content.body}</PopupBody>}
        {content.countdown && (
          <PopupCount>
            <strong>{content.countdown.seconds}</strong>초 {content.countdown.label}
          </PopupCount>
        )}
        <PopupHint>눌러서 닫기</PopupHint>
      </PopupCard>
    </PopupOverlay>
  );
}
