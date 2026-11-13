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
  RevealBanner,
  DrawerNote,
  GainList,
  Toast,
  HintLetters,
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
  WideWrap,
  WideCanvasCol,
  WideSide,
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

/** 정답이 나와서 그림을 잠깐 보여주는 동안의 정보 */
export interface DrawingReveal {
  word: string | null;
  winnerNickname: string | null;
  nextDrawerNickname: string | null;
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
  turnNumber: number;
  totalTurns: number;
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
  /** 선뽑기 화면 */
  firstDrawPanel?: ReactNode;
  /** 가로로 넓은 휴대폰·태블릿 화면 (말풍선 없이 채팅 기록을 옆에) */
  wide: boolean;
}

/** 맞히는 사람에게 보이는 힌트: 가린 글자는 _, 공개된 초성·글자는 그대로 */
function hintLabel(hint: (string | null)[]) {
  const letters = hint.filter((h) => h !== " ").length;
  return (
    <>
      <HintLetters>{hint.map((h) => (h === null ? "_" : h)).join("")}</HintLetters> <small>({letters}글자)</small>
    </>
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
    turnNumber,
    totalTurns,
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
    firstDrawPanel,
    wide,
  } = props;

  const [color, setColor] = useState(DRAWING_COLORS[0]);
  const [size, setSize] = useState(DRAWING_SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const drawing = isDrawer && phase === "draw";
  const showChatLog = wide || (!isDrawer && viewMode === "chat");

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, showChatLog]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const inGame = phase === "choose" || phase === "draw" || phase === "guess" || phase === "reveal";
  const guessing = phase === "draw" || phase === "guess";
  const urgent = guessing && secondsLeft <= 10;
  const time = (
    <TimeText $urgent={urgent}>
      <span aria-hidden="true">⏳</span> {secondsLeft}초
    </TimeText>
  );

  const topBar = (
    <TopBar>
      <TopInfo>
        {phase === "firstDraw" ? (
          <>선뽑기 · {time}</>
        ) : phase === "guess" ? (
          <>맞히기 시간 · {time}</>
        ) : isDrawer && phase === "draw" ? (
          <>내 차례 · {time}</>
        ) : inGame ? (
          <>
            {turnNumber}/{totalTurns}번째 그림
            {phase !== "reveal" && <> · {time}</>}
          </>
        ) : (
          "끄적끄적"
        )}
      </TopInfo>
      {!isDrawer && !wide && (
        <ModeToggle type="button" onClick={onToggleMode}>
          {viewMode === "bubble" ? "💬 채팅창 모드" : "🗨️ 말풍선 모드"}
        </ModeToggle>
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
      {phase === "firstDraw" && firstDrawPanel && <CanvasOverlay>{firstDrawPanel}</CanvasOverlay>}
      {phase === "reveal" && reveal && (
        // 그림이 보이도록 아래쪽에만 띄운다
        <RevealBanner>
          <span>🎉 {reveal.winnerNickname}님 정답!</span>
          <RevealWord>{reveal.word}</RevealWord>
          <GainList>
            {seats
              .filter((s) => reveal.gains[s.playerId])
              .map((s) => (
                <span key={s.playerId}>
                  {s.nickname} +{reveal.gains[s.playerId]}
                </span>
              ))}
          </GainList>
          <span>
            {reveal.nextDrawerNickname ? `다음은 ${reveal.nextDrawerNickname}님 차례` : "마지막 그림이었어요"} ·{" "}
            <TimeText>{secondsLeft}초</TimeText>
          </span>
        </RevealBanner>
      )}
      {/* 제시어(그리는 사람)·힌트(맞히는 사람)는 모두 그림판 오른쪽 위에 */}
      {guessing && isDrawer && word && <WordChip>{word}</WordChip>}
      {guessing && !isDrawer && hint.length > 0 && <WordChip>{hintLabel(hint)}</WordChip>}
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

  const drawerInGame = isDrawer && inGame;

  const drawerTools =
    phase !== "draw" ? (
      <ToolRow $reserve={reserveRight}>
        <DrawerNote>
          {phase === "guess"
            ? "그리기 시간이 끝났어요. 다른 사람들이 맞히는 중…"
            : phase === "reveal"
              ? "곧 다음 그림이 시작돼요"
              : "제시어를 고르세요"}
        </DrawerNote>
      </ToolRow>
    ) : (
      <>
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
      </>
    );

  const inputBar = (
    <InputBar $reserve={reserveRight} onSubmit={submit}>
      <GuessInput
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={guessing ? (iGuessed ? "맞힌 사람끼리만 보여요" : "정답 또는 채팅") : "채팅"}
        maxLength={100}
        enterKeyHint="send"
        autoComplete="off"
      />
      <SendButton type="submit" disabled={!input.trim()}>
        전송
      </SendButton>
    </InputBar>
  );

  const chatLog = (fill: boolean) => (
    <ChatLog ref={logRef} $fill={fill}>
      {logs.map((l) => (
        <LogLine key={l.key} $tone={l.tone === "chat" ? undefined : l.tone}>
          {l.nickname && <b style={{ color: l.color }}>{l.nickname} </b>}
          {l.text}
        </LogLine>
      ))}
    </ChatLog>
  );

  // ── 가로로 넓은 화면: 그림판 왼쪽, 이름표·채팅 기록·입력(또는 도구) 오른쪽 ──
  if (wide) {
    return (
      <WideWrap>
        <WideCanvasCol>{canvas}</WideCanvasCol>
        <WideSide>
          {topBar}
          {chips(drawerInGame ? seats.filter((s) => !s.isMe) : seats)}
          {chatLog(true)}
          {drawerInGame ? drawerTools : inputBar}
        </WideSide>
      </WideWrap>
    );
  }

  // ── 그리는 사람 ─────────────────────────────────────────
  if (drawerInGame) {
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
        {drawerTools}
      </BoardWrap>
    );
  }

  // ── 채팅창 모드 ─────────────────────────────────────────
  if (showChatLog) {
    return (
      <BoardWrap>
        {topBar}
        {chips(seats)}
        {canvas}
        {chatLog(false)}
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
      {inputBar}
    </BoardWrap>
  );
}
