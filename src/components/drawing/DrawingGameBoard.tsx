import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode, RefObject } from "react";
import DrawingCanvas from "./game/DrawingCanvas";
import type { DrawingCanvasHandle } from "./game/DrawingCanvas";
import type { DrawingModel } from "./game/drawingModel";
import type { DrawingBubble, DrawingPhase, DrawingSeat, DrawingViewMode, StrokeOp } from "./types";
import {
  BoardWrap,
  TopBar,
  TopInfo,
  TimeText,
  ModeToggle,
  WordChip,
  SeatRow,
  SeatCell,
  Badge,
  BadgeName,
  BadgeSub,
  EmptySeat,
  Bubble,
  ChipRow,
  Chip,
  AwayIcon,
  CanvasOverlay,
  RevealWord,
  GainList,
  Toast,
  HintLine,
  InputBar,
  GuessInput,
  SendButton,
  ChatLog,
  LogLine,
  LastLine,
  ColorRow,
  ColorSwatch,
  ToolRow,
  ToolButton,
  SizeDot,
} from "../../styles/game/drawing/board";
import {
  DRAWING_COLORS,
  DRAWING_SIZES,
  DRAWING_ERASER_SIZES,
  DRAWING_ERASER_COLOR,
} from "../../utils/games/drawing";

export interface DrawingLogEntry {
  key: number;
  tone: "chat" | "system" | "success" | "close" | "insider";
  nickname?: string;
  color?: string;
  text: string;
}

export interface DrawingReveal {
  word: string | null;
  reason: string;
  gains: Record<string, number>;
}

interface Props {
  phase: DrawingPhase;
  viewMode: DrawingViewMode;
  onToggleMode: () => void;
  seats: DrawingSeat[];
  bubbles: Record<string, DrawingBubble>;
  isDrawer: boolean;
  drawerNickname: string;
  word: string | null;
  hint: (string | null)[];
  secondsLeft: number;
  round: number;
  totalRounds: number;
  reveal: DrawingReveal | null;
  toast: string | null;
  logs: DrawingLogEntry[];
  canvasRef: RefObject<DrawingCanvasHandle | null>;
  model: DrawingModel;
  onOps: (ops: StrokeOp[]) => void;
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  iGuessed: boolean;
  /** 휴대폰에서 오른쪽 아래 음성·채팅 버튼이 차지하는 폭 */
  reserveRight: number;
  /** 시작 전 그림판 위에 띄울 설정·대기 안내 */
  waitingPanel?: ReactNode;
}

const REVEAL_REASON: Record<string, string> = {
  allGuessed: "모두 맞혔습니다!",
  time: "시간 종료",
  drawerLeft: "그리던 사람이 나갔습니다",
  drawerAway: "그리던 사람의 연결이 끊겼습니다",
};

function HintText({ hint }: { hint: (string | null)[] }) {
  if (hint.length === 0) return <HintLine />;
  const letters = hint.filter((h) => h !== " ").length;
  return (
    <HintLine>
      {hint.map((h) => (h === null ? "_" : h)).join("")} <small>({letters}글자)</small>
    </HintLine>
  );
}

function seatState(s: DrawingSeat): "drawer" | "guessed" | null {
  return s.isDrawer ? "drawer" : s.guessed ? "guessed" : null;
}

function StatusIcon({ seat }: { seat: DrawingSeat }) {
  if (seat.away) return <AwayIcon title="연결 끊김">⚠︎ 끊김</AwayIcon>;
  if (seat.isDrawer) return <span aria-label="그리는 중">✏️</span>;
  if (seat.guessed) return <span aria-label="정답">✓</span>;
  return null;
}

export default function DrawingGameBoard(props: Props) {
  const {
    phase,
    viewMode,
    onToggleMode,
    seats,
    bubbles,
    isDrawer,
    drawerNickname,
    word,
    hint,
    secondsLeft,
    round,
    totalRounds,
    reveal,
    toast,
    logs,
    canvasRef,
    model,
    onOps,
    input,
    onInputChange,
    onSubmit,
    iGuessed,
    reserveRight,
    waitingPanel,
  } = props;

  const [color, setColor] = useState(DRAWING_COLORS[0]);
  const [size, setSize] = useState(DRAWING_SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const drawing = isDrawer && phase === "draw";
  const showChatLog = !isDrawer && viewMode === "chat";

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, showChatLog]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const inGame = phase === "choose" || phase === "draw" || phase === "reveal";
  const urgent = phase === "draw" && secondsLeft <= 10;

  const topBar = (
    <TopBar>
      <TopInfo>
        {isDrawer && phase === "draw" ? (
          <>
            내 차례 · <TimeText $urgent={urgent}>{secondsLeft}초</TimeText>
          </>
        ) : inGame ? (
          <>
            {round}/{totalRounds}바퀴
            {phase !== "reveal" && (
              <>
                {" · "}
                <TimeText $urgent={urgent}>{secondsLeft}초</TimeText>
              </>
            )}
          </>
        ) : (
          "끄적끄적"
        )}
      </TopInfo>
      {isDrawer && phase === "draw" && word ? (
        <WordChip>{word}</WordChip>
      ) : (
        !isDrawer && (
          <ModeToggle type="button" onClick={onToggleMode}>
            {viewMode === "bubble" ? "💬 채팅창 모드" : "🗨️ 말풍선 모드"}
          </ModeToggle>
        )
      )}
    </TopBar>
  );

  const seatCell = (seat: DrawingSeat | undefined, placement: "below" | "above", i: number) => {
    if (!seat) return <SeatCell key={`empty-${i}`}><EmptySeat /></SeatCell>;
    const state = seatState(seat);
    const bubble = bubbles[seat.playerId];
    return (
      <SeatCell key={seat.playerId}>
        <Badge $color={seat.color} $state={state} $isMe={seat.isMe}>
          <BadgeName $state={state}>{seat.nickname}</BadgeName>
          <BadgeSub $state={state}>
            <span>{seat.score}점</span>
            <StatusIcon seat={seat} />
          </BadgeSub>
        </Badge>
        {bubble && (
          <Bubble key={bubble.key} $color={seat.color} $placement={placement} $kind={bubble.kind}>
            {bubble.text}
          </Bubble>
        )}
      </SeatCell>
    );
  };

  const chips = (list: DrawingSeat[]) => (
    <ChipRow>
      {list.map((seat) => (
        <Chip key={seat.playerId} $color={seat.color} $state={seatState(seat)} $isMe={seat.isMe}>
          {seat.isDrawer && "✏️"}
          {seat.guessed && "✓"}
          {seat.nickname}
          {!isDrawer && ` ${seat.score}`}
          {seat.away && <AwayIcon>⚠︎</AwayIcon>}
        </Chip>
      ))}
    </ChipRow>
  );

  const overlay = (
    <>
      {(phase === "waiting" || phase === "over") && waitingPanel && <CanvasOverlay>{waitingPanel}</CanvasOverlay>}
      {phase === "choose" && !isDrawer && (
        <CanvasOverlay>
          <span>✏️ {drawerNickname}님이 제시어를 고르는 중…</span>
        </CanvasOverlay>
      )}
      {phase === "reveal" && reveal && (
        <CanvasOverlay>
          <span>{REVEAL_REASON[reveal.reason] ?? ""}</span>
          {reveal.word ? (
            <>
              <span>정답은</span>
              <RevealWord>{reveal.word}</RevealWord>
            </>
          ) : (
            <span>제시어를 고르지 않았어요</span>
          )}
          <GainList>
            {seats
              .filter((s) => reveal.gains[s.playerId])
              .map((s) => (
                <span key={s.playerId}>
                  {s.nickname} +{reveal.gains[s.playerId]}
                </span>
              ))}
          </GainList>
        </CanvasOverlay>
      )}
      {toast && <Toast>{toast}</Toast>}
    </>
  );

  const canvas = (
    <DrawingCanvas
      ref={canvasRef}
      model={model}
      canDraw={drawing}
      color={eraser ? DRAWING_ERASER_COLOR : color}
      size={eraser ? DRAWING_ERASER_SIZES[size] : size}
      onOps={onOps}
    >
      {overlay}
    </DrawingCanvas>
  );

  // ── 그리는 사람 ─────────────────────────────────────────
  if (isDrawer && inGame) {
    const lastChat = [...logs].reverse().find((l) => l.tone === "chat" || l.tone === "insider");
    return (
      <BoardWrap>
        {topBar}
        {chips(seats.filter((s) => !s.isMe))}
        {canvas}
        <LastLine>
          {lastChat && (
            <>
              <b style={{ color: lastChat.color }}>{lastChat.nickname}</b> {lastChat.text}
            </>
          )}
        </LastLine>
        <ColorRow>
          {DRAWING_COLORS.map((c) => (
            <ColorSwatch
              key={c}
              type="button"
              $color={c}
              $selected={!eraser && color === c}
              onClick={() => {
                setColor(c);
                setEraser(false);
              }}
              aria-label={`색 ${c}`}
            />
          ))}
        </ColorRow>
        <ToolRow $reserve={reserveRight}>
          {DRAWING_SIZES.map((s, i) => (
            <ToolButton key={s} type="button" $active={size === s} onClick={() => setSize(s)} aria-label={`굵기 ${i + 1}`}>
              <SizeDot $px={[4, 8, 14][i]} />
            </ToolButton>
          ))}
          <ToolButton type="button" $active={eraser} onClick={() => setEraser((v) => !v)} aria-label="지우개">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3" />
              <path d="M18 13.3l-6.3 -6.3" />
            </svg>
          </ToolButton>
          <ToolButton type="button" onClick={() => canvasRef.current?.undo()} aria-label="되돌리기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14l-4 -4l4 -4" />
              <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
            </svg>
          </ToolButton>
          <ToolButton
            type="button"
            onClick={() => {
              if (window.confirm("그림을 모두 지울까요?")) canvasRef.current?.clear();
            }}
            aria-label="전체 지우기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
          </ToolButton>
        </ToolRow>
      </BoardWrap>
    );
  }

  const inputBar = (
    <InputBar $reserve={reserveRight} onSubmit={submit}>
      <GuessInput
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={phase === "draw" ? (iGuessed ? "맞힌 사람끼리만 보여요" : "정답 또는 채팅") : "채팅"}
        maxLength={100}
        enterKeyHint="send"
        autoComplete="off"
      />
      <SendButton type="submit" disabled={!input.trim()}>
        전송
      </SendButton>
    </InputBar>
  );

  // ── 채팅창 모드 ─────────────────────────────────────────
  if (showChatLog) {
    return (
      <BoardWrap>
        {topBar}
        {chips(seats)}
        {canvas}
        <HintText hint={phase === "draw" ? hint : []} />
        <ChatLog ref={logRef}>
          {logs.map((l) => (
            <LogLine key={l.key} $tone={l.tone === "chat" ? undefined : l.tone}>
              {l.nickname && <b style={{ color: l.color }}>{l.nickname} </b>}
              {l.text}
            </LogLine>
          ))}
        </ChatLog>
        {inputBar}
      </BoardWrap>
    );
  }

  // ── 말풍선 모드 ─────────────────────────────────────────
  const top = [0, 1, 2].map((i) => seatCell(seats[i], "below", i));
  const bottom = seats.length > 3 ? [3, 4, 5].map((i) => seatCell(seats[i], "above", i)) : null;
  return (
    <BoardWrap>
      {topBar}
      <SeatRow>{top}</SeatRow>
      {canvas}
      {bottom && <SeatRow>{bottom}</SeatRow>}
      <HintText hint={phase === "draw" ? hint : []} />
      {inputBar}
    </BoardWrap>
  );
}
