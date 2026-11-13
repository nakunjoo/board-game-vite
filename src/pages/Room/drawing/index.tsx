import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoomBase } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";
import DrawingGameBoard from "../../../components/drawing/DrawingGameBoard";
import type { DrawingLogEntry, DrawingReveal } from "../../../components/drawing/DrawingGameBoard";
import DrawingHelpModal from "../../../components/drawing/DrawingHelpModal";
import DrawingSetupModal from "../../../components/drawing/game/DrawingSetupModal";
import DrawingChoiceModal from "../../../components/drawing/game/DrawingChoiceModal";
import DrawingResultModal from "../../../components/drawing/game/DrawingResultModal";
import DrawingFirstDrawPanel from "../../../components/drawing/game/DrawingFirstDrawPanel";
import type { DrawingCanvasHandle } from "../../../components/drawing/game/DrawingCanvas";
import { DrawingModel } from "../../../components/drawing/game/drawingModel";
import type {
  DrawingBubble,
  DrawingGameOver,
  DrawingPhase,
  DrawingRestoreState,
  DrawingSeat,
  DrawingViewMode,
  StrokeOp,
} from "../../../components/drawing/types";
import { useDeadlineSeconds } from "../../../utils/useDeadlineSeconds";
import { useMediaQuery } from "../../../utils/useMediaQuery";
import {
  DRAWING_CHOOSE_TIME,
  DRAWING_PLAYER_COLORS,
  DRAWING_VIEW_MODE_KEY,
} from "../../../utils/games/drawing";

const BUBBLE_MS = 3000;
const TOAST_MS = 2000;
const MAX_LOGS = 200;

const loadViewMode = (): DrawingViewMode => {
  try {
    return localStorage.getItem(DRAWING_VIEW_MODE_KEY) === "chat" ? "chat" : "bubble";
  } catch {
    return "bubble";
  }
};

interface JoinData {
  name?: string;
  drawing?: DrawingRestoreState | null;
  drawingGameOver?: DrawingGameOver | null;
}

export default function DrawingRoom() {
  const {
    reconnecting,
    resultDismissedRef,
    setResultDismissed,
    entryState,
    roomName,
    playerId,
    send,
    subscribe,
    gameConfig,
    players,
    memberCount,
    isHost,
    messages,
    setMessages,
    isChatOpen,
    setIsChatOpen,
    hasUnreadMessages,
    setHasUnreadMessages,
    showHelpModal,
    setShowHelpModal,
    messagesEndRef,
    leaveRoom,
  } = useRoomBase();

  const [phase, setPhase] = useState<DrawingPhase>("waiting");
  const [turnNumber, setTurnNumber] = useState(0);
  const [totalTurns, setTotalTurns] = useState(0);
  const [firstDraws, setFirstDraws] = useState<Record<string, number>>({});
  const [firstPlayerId, setFirstPlayerId] = useState<string | null>(null);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState("");
  const [word, setWord] = useState<string | null>(null);
  const [choices, setChoices] = useState<string[] | null>(null);
  const [hint, setHint] = useState<(string | null)[]>([]);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [away, setAway] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [reveal, setReveal] = useState<DrawingReveal | null>(null);
  const [gameOver, setGameOver] = useState<DrawingGameOver | null>(null);
  const [bubbles, setBubbles] = useState<Record<string, DrawingBubble>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [logs, setLogs] = useState<DrawingLogEntry[]>([]);
  const [input, setInput] = useState("");
  const [viewMode, setViewMode] = useState<DrawingViewMode>(loadViewMode);
  const [model] = useState(() => new DrawingModel());
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const keyRef = useRef(0);
  const bubbleTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryAppliedRef = useRef(false);

  const secondsLeft = useDeadlineSeconds(deadline, phase === "choose" ? DRAWING_CHOOSE_TIME : 0);

  // ── 자리·색 ──────────────────────────────────────────────

  const nicknameOf = useCallback(
    (pid: string) => players.find((p) => p.playerId === pid)?.nickname ?? "",
    [players],
  );
  /** 게임 중엔 그리는 순서, 시작 전엔 입장 순서. 색은 이 순서로 고정 */
  const order = useMemo(() => {
    const byOrder = [...players].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p) => p.playerId);
    if (turnOrder.length === 0) return byOrder;
    return [...turnOrder, ...byOrder.filter((pid) => !turnOrder.includes(pid))];
  }, [players, turnOrder]);

  const colorOf = useCallback(
    (pid: string) => DRAWING_PLAYER_COLORS[Math.max(0, order.indexOf(pid)) % DRAWING_PLAYER_COLORS.length],
    [order],
  );
  const colorOfRef = useRef(colorOf);
  const nicknameOfRef = useRef(nicknameOf);
  useEffect(() => {
    colorOfRef.current = colorOf;
    nicknameOfRef.current = nicknameOf;
  }, [colorOf, nicknameOf]);

  const inGame = phase === "choose" || phase === "draw" || phase === "guess" || phase === "reveal";
  const seats: DrawingSeat[] = useMemo(
    () =>
      order
        .filter((pid) => players.some((p) => p.playerId === pid))
        .map((pid) => ({
          playerId: pid,
          nickname: nicknameOf(pid),
          color: colorOf(pid),
          score: scores[pid] ?? 0,
          isDrawer: inGame && pid === drawerId,
          guessed: inGame && guessed.includes(pid),
          away: away.includes(pid),
          isMe: pid === playerId,
        })),
    [order, players, nicknameOf, colorOf, scores, inGame, drawerId, guessed, away, playerId],
  );

  // ── 기록·말풍선·알림 ─────────────────────────────────────

  const addLog = useCallback(
    (entry: Omit<DrawingLogEntry, "key">, sideText?: string) => {
      setLogs((prev) => [...prev.slice(-(MAX_LOGS - 1)), { ...entry, key: ++keyRef.current }]);
      // 휴대폰 채팅 버튼·PC 오른쪽 채팅 기록에도 남긴다
      setMessages((prev) => [
        ...prev,
        entry.tone === "chat" || entry.tone === "insider"
          ? { message: `${entry.nickname}${entry.tone === "insider" ? " (정답자끼리)" : ""}: ${entry.text}` }
          : { message: sideText ?? entry.text, isSystem: true },
      ]);
    },
    [setMessages],
  );

  const showBubble = useCallback((pid: string, text: string, kind: DrawingBubble["kind"]) => {
    clearTimeout(bubbleTimersRef.current[pid]);
    setBubbles((prev) => ({ ...prev, [pid]: { key: ++keyRef.current, text, kind } }));
    bubbleTimersRef.current[pid] = setTimeout(() => {
      setBubbles((prev) => {
        const next = { ...prev };
        delete next[pid];
        return next;
      });
    }, BUBBLE_MS);
  }, []);

  const showToast = useCallback((text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(text);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      Object.values(bubbleTimersRef.current).forEach(clearTimeout);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  // ── 서버 이벤트 ──────────────────────────────────────────

  useEffect(() => {
    const applyJoin = (d: JoinData) => {
      if (d.name !== roomName) return;
      const s = d.drawing;
      if (s) {
        setTurnNumber(s.turnNumber);
        setTotalTurns(s.totalTurns);
        setFirstDraws(s.firstDraw);
        setFirstPlayerId(s.firstPlayerId);
        setTurnOrder(s.turnOrder);
        setPhase(s.phase);
        setDrawerId(s.drawerId);
        setWord(s.word);
        setChoices(s.choices);
        setHint(s.hint);
        setGuessed(s.guessed);
        setScores(s.scores);
        setAway(s.away.filter((pid) => pid !== playerId));
        setDeadline(Date.now() + s.timeLeftMs);
        setReveal(
          s.phase === "reveal"
            ? {
                word: s.word,
                winnerNickname: s.guessed[0] ? nicknameOfRef.current(s.guessed[0]) : null,
                nextDrawerNickname: s.nextDrawerId ? nicknameOfRef.current(s.nextDrawerId) : null,
                gains: s.gains ?? {},
              }
            : null,
        );
        setGameOver(null);
        model.reset(s.strokes);
        return;
      }
      setDeadline(null);
      setTurnOrder([]);
      model.reset([]);
      // 끊겨 있는 동안 게임이 끝났으면 결과를 보여준다 (닫았던 결과는 다시 열지 않는다)
      if (d.drawingGameOver && !resultDismissedRef.current) {
        setGameOver(d.drawingGameOver);
        setPhase("over");
      } else {
        setPhase("waiting");
      }
    };

    // 로비에서 들어오면 roomJoined를 로비가 이미 받았으므로 넘겨받은 데이터로 시작한다
    if (entryState && !entryAppliedRef.current) {
      entryAppliedRef.current = true;
      applyJoin(entryState as JoinData);
    }

    const unsubscribe = subscribe((event, data) => {
      const d = data as Record<string, unknown> & { roomName?: string };
      if (event === "roomCreated" || event === "roomJoined") {
        applyJoin(data as JoinData);
        return;
      }
      if (!event.startsWith("drawing") || d.roomName !== roomName) return;

      switch (event) {
        case "drawingStarted": {
          const e = data as { totalRounds: number; totalTurns: number; turnOrder: string[]; scores: Record<string, number> };
          setTurnNumber(0);
          setTotalTurns(e.totalTurns);
          setTurnOrder(e.turnOrder);
          setScores(e.scores);
          setGuessed([]);
          setAway([]);
          setGameOver(null);
          model.reset([]);
          setResultDismissed(false);
          addLog({ tone: "system", text: `🎨 끄적끄적 시작! (그림 ${e.totalTurns}개)` });
          break;
        }
        case "drawingFirstDrawStarted": {
          setPhase("firstDraw");
          setFirstDraws({});
          setFirstPlayerId(null);
          setDeadline(Date.now() + (data as { timeLimitMs: number }).timeLimitMs);
          break;
        }
        case "drawingFirstDrawUpdate":
          setFirstDraws((data as { draws: Record<string, number> }).draws);
          break;
        case "drawingFirstDrawFinished": {
          const e = data as { draws: Record<string, number>; firstPlayerId: string; firstNickname: string };
          setFirstDraws(e.draws);
          setFirstPlayerId(e.firstPlayerId);
          setDeadline(null);
          addLog({ tone: "system", text: `🎴 선뽑기 — ${e.firstNickname}님이 먼저 그려요` });
          break;
        }
        case "drawingTurn": {
          const e = data as { turnNumber: number; totalTurns: number; drawerId: string; drawerNickname: string; timeLimitMs: number };
          setTurnNumber(e.turnNumber);
          setTotalTurns(e.totalTurns);
          setDrawerId(e.drawerId);
          setPhase("choose");
          setWord(null);
          setChoices(null);
          setHint([]);
          setGuessed([]);
          setReveal(null);
          setDeadline(Date.now() + e.timeLimitMs);
          model.reset([]);
          addLog({ tone: "system", text: `━ ${e.drawerNickname}님 차례 (${e.turnNumber}/${e.totalTurns}) ━` });
          break;
        }
        case "drawingChoices":
          setChoices((data as { choices: string[] }).choices);
          break;
        case "drawingDrawStart": {
          const e = data as { hint: (string | null)[]; timeLimitMs: number };
          setPhase("draw");
          setChoices(null);
          setHint(e.hint);
          setDeadline(Date.now() + e.timeLimitMs);
          break;
        }
        case "drawingGuessTime": {
          const e = data as { hint: (string | null)[]; timeLimitMs: number };
          setPhase("guess");
          setHint(e.hint);
          setDeadline(Date.now() + e.timeLimitMs);
          addLog({ tone: "system", text: "그리기 끝! 30초 안에 맞혀 보세요" });
          break;
        }
        case "drawingWord":
          setWord((data as { word: string }).word);
          break;
        case "drawingStroke":
          model.applyRemote((data as { ops: StrokeOp[] }).ops);
          break;
        case "drawingHint":
          setHint((data as { hint: (string | null)[] }).hint);
          break;
        case "drawingChat": {
          const e = data as { playerId: string; nickname: string; text: string; scope: "all" | "guessed" };
          const insider = e.scope === "guessed";
          addLog({ tone: insider ? "insider" : "chat", nickname: e.nickname, color: colorOfRef.current(e.playerId), text: e.text });
          showBubble(e.playerId, e.text, insider ? "insider" : "chat");
          break;
        }
        case "drawingCorrect": {
          const e = data as {
            playerId: string;
            nickname: string;
            gained: number;
            guessed: string[];
            scores: Record<string, number>;
          };
          setGuessed(e.guessed);
          setScores(e.scores);
          showBubble(e.playerId, "정답! 🎉", "correct");
          const mine = e.playerId === playerId;
          addLog({ tone: "success", text: mine ? `🎉 정답! +${e.gained}점` : `🎉 ${e.nickname}님 정답! (+${e.gained})` });
          showToast(mine ? `정답! +${e.gained}점` : `${e.nickname}님 정답!`);
          break;
        }
        case "drawingClose": {
          const text = (data as { text: string }).text;
          addLog({ tone: "close", text: `거의 맞았어요: ${text}` });
          showToast(`거의 맞았어요! (${text})`);
          break;
        }
        case "drawingBlocked":
          showToast("정답이 들어간 말은 보낼 수 없어요");
          break;
        case "drawingTurnEnd": {
          const e = data as {
            reason: string;
            word: string | null;
            gains: Record<string, number>;
            scores: Record<string, number>;
            winnerNickname: string | null;
            nextDrawerNickname: string | null;
            timeLimitMs: number;
          };
          setScores(e.scores);
          if (e.winnerNickname) {
            // 정답이 나왔으면 그림을 잠깐 보여준다
            setPhase("reveal");
            setReveal({ word: e.word, winnerNickname: e.winnerNickname, nextDrawerNickname: e.nextDrawerNickname, gains: e.gains });
            setDeadline(Date.now() + e.timeLimitMs);
            addLog({ tone: "system", text: `정답은 '${e.word}'` });
            break;
          }
          // 아무도 못 맞혔으면 서버가 바로 다음 턴을 시작한다
          const why =
            e.reason === "drawerAway" ? "그리던 사람의 연결이 끊겨 넘어갑니다" : e.reason === "drawerLeft" ? "그리던 사람이 나가서 넘어갑니다" : "아무도 못 맞혔어요";
          const text = e.word ? `${why} — 정답은 '${e.word}'` : why;
          addLog({ tone: "system", text });
          showToast(text);
          break;
        }
        case "drawingPresence": {
          const e = data as { playerId: string; connected: boolean };
          setAway((prev) => (e.connected ? prev.filter((p) => p !== e.playerId) : prev.includes(e.playerId) ? prev : [...prev, e.playerId]));
          break;
        }
        case "drawingGameOver": {
          const e = data as DrawingGameOver;
          setPhase("over");
          setGameOver(e);
          setDeadline(null);
          setReveal(null);
          setTurnOrder([]);
          setAway([]);
          const winner = e.ranking.filter((r) => r.rank === 1).map((r) => r.nickname).join(", ");
          addLog({ tone: "system", text: `🏆 게임 종료 — 1위 ${winner}` });
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName, playerId, entryState, model, addLog, showBubble, showToast, resultDismissedRef, setResultDismissed]);

  // ── 보내기 ───────────────────────────────────────────────

  const handleOps = useCallback(
    (ops: StrokeOp[]) => {
      if (roomName) send("drawingStroke", { roomName, ops });
    },
    [send, roomName],
  );

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || !roomName) return;
    send("drawingGuess", { roomName, text });
    setInput("");
  };

  const handleStart = (rounds: number, drawTimeSec: number) => {
    if (roomName) send("drawingStart", { roomName, rounds, drawTimeSec });
  };

  const toggleMode = () => {
    setViewMode((prev) => {
      const next = prev === "bubble" ? "chat" : "bubble";
      try {
        localStorage.setItem(DRAWING_VIEW_MODE_KEY, next);
      } catch {
        // 저장이 안 되면 이번에만 바뀐다
      }
      return next;
    });
  };

  const closeResult = () => {
    setResultDismissed(true);
    setGameOver(null);
    setScores({});
    setPhase("waiting");
    model.reset([]);
  };

  const isDrawer = inGame && drawerId === playerId;
  // 폴드를 펼치거나 휴대폰을 눕혀 가로로 넓으면 말풍선 없이 채팅 기록을 옆에 둔다 (PC는 오른쪽에 채팅 기록이 따로 있다)
  const wide = useMediaQuery("(max-width: 1080px) and (orientation: landscape)");
  const iGuessed = guessed.includes(playerId);
  // 채팅창 모드면 게임 화면에 기록이 보이니 채팅 버튼을 숨긴다
  const hideChatToggle = wide || (!isDrawer && viewMode === "chat");

  return (
    <RoomLayout
      reconnecting={reconnecting}
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #3498db 0%, #1d6fa5 100%)",
        boxShadow: "0 4px 12px rgba(52, 152, 219, 0.4)",
      }}
      onHelp={() => setShowHelpModal(true)}
      onLeave={leaveRoom}
      send={send}
      subscribe={subscribe}
      playerId={playerId}
      messages={messages}
      inputMessage=""
      isChatOpen={isChatOpen}
      hasUnreadMessages={hasUnreadMessages}
      messagesEndRef={messagesEndRef}
      onInputChange={() => {}}
      onSendMessage={() => {}}
      onToggleChat={() => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) setHasUnreadMessages(false);
      }}
      onCloseChat={() => setIsChatOpen(false)}
      chatReadOnly
      hideChatToggle={hideChatToggle}
      toggleStackStyle={{ flexDirection: "row" }}
      modals={<DrawingHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />}
    >
      <DrawingGameBoard
        phase={phase}
        viewMode={viewMode}
        onToggleMode={toggleMode}
        seats={seats}
        bubbles={bubbles}
        isDrawer={isDrawer}
        drawerNickname={nicknameOf(drawerId)}
        word={word}
        hint={hint}
        secondsLeft={secondsLeft}
        turnNumber={turnNumber}
        totalTurns={totalTurns}
        reveal={reveal}
        toast={toast}
        logs={logs}
        canvasRef={canvasRef}
        model={model}
        onOps={handleOps}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        iGuessed={iGuessed}
        reserveRight={hideChatToggle ? 48 : 96}
        wide={wide}
        firstDrawPanel={
          <DrawingFirstDrawPanel
            seats={seats}
            draws={firstDraws}
            firstPlayerId={firstPlayerId}
            myPlayerId={playerId}
            onDraw={() => roomName && send("drawingFirstDraw", { roomName })}
          />
        }
        waitingPanel={
          phase === "waiting" ? (
            <DrawingSetupModal isHost={isHost} memberCount={memberCount} onStart={handleStart} />
          ) : undefined
        }
      />

      {isDrawer && phase === "choose" && choices && (
        <DrawingChoiceModal
          choices={choices}
          secondsLeft={secondsLeft}
          onChoose={(index) => roomName && send("drawingChoose", { roomName, index })}
        />
      )}

      {phase === "over" && gameOver && (
        <DrawingResultModal
          result={gameOver}
          myPlayerId={playerId}
          isHost={isHost}
          onRestart={closeResult}
          onClose={closeResult}
        />
      )}
    </RoomLayout>
  );
}
