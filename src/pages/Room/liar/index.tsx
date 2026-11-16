import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoomBase } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";
import LiarGameBoard, { resultSummary } from "../../../components/liar/LiarGameBoard";
import LiarHelpModal from "../../../components/liar/LiarHelpModal";
import LiarSetupPanel from "../../../components/liar/game/LiarSetupPanel";
import type { LiarSettings } from "../../../components/liar/game/LiarSetupPanel";
import LiarResultModal from "../../../components/liar/game/LiarResultModal";
import type {
  LiarDescription,
  LiarGameOver,
  LiarLogEntry,
  LiarPhase,
  LiarRestoreState,
  LiarRoundResult,
  LiarSeat,
} from "../../../components/liar/types";
import { useDeadlineSeconds } from "../../../utils/useDeadlineSeconds";
import { LIAR_PLAYER_COLORS, liarNormalize } from "../../../utils/games/liar";

const TOAST_MS = 2000;
const MAX_LOGS = 200;

interface JoinData {
  name?: string;
  liar?: LiarRestoreState | null;
  liarGameOver?: LiarGameOver | null;
}

export default function LiarRoom() {
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
    hostPlayerId,
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

  const [phase, setPhase] = useState<LiarPhase>("waiting");
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [laps, setLaps] = useState(1);
  const [topic, setTopic] = useState("");
  const [word, setWord] = useState<string | null>(null);
  const [isLiar, setIsLiar] = useState(false);
  const [speakOrder, setSpeakOrder] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<LiarDescription[]>([]);
  const [speakerId, setSpeakerId] = useState<string | null>(null);
  const [lap, setLap] = useState<number | null>(null);
  const [voted, setVoted] = useState<string[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [accusedId, setAccusedId] = useState<string | null>(null);
  const [result, setResult] = useState<LiarRoundResult | null>(null);
  const [isLast, setIsLast] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [away, setAway] = useState<string[]>([]);
  // 마감 시각과 그 단계의 전체 초. 단계가 바뀐 직후 첫 계산 전에 0초(빨간색)가 잠깐 보이지 않게 전체 초로 시작한다
  const [clock, setClock] = useState<{ deadline: number | null; startSec: number }>({ deadline: null, startSec: 0 });
  const startClock = useCallback((ms: number | null) => {
    setClock(ms === null ? { deadline: null, startSec: 0 } : { deadline: Date.now() + ms, startSec: Math.ceil(ms / 1000) });
  }, []);
  const [gameOver, setGameOver] = useState<LiarGameOver | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [input, setInput] = useState("");

  // 게임 화면 기록. 새로고침해도 남게 저장한다 (로비에서 새로 들어오면 비운다)
  const logStorageKey = `liar-log:${roomName}`;
  const [logs, setLogs] = useState<LiarLogEntry[]>(() => {
    if (entryState) return [];
    try {
      return JSON.parse(sessionStorage.getItem(logStorageKey) ?? "[]") as LiarLogEntry[];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(logStorageKey, JSON.stringify(logs));
    } catch {
      // 저장 공간이 부족하면 새로고침 때 기록만 비워진다
    }
  }, [logStorageKey, logs]);
  const keyRef = useRef(logs.reduce((max, l) => Math.max(max, l.key), 0));
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryAppliedRef = useRef(false);

  const secondsLeft = useDeadlineSeconds(clock.deadline, clock.startSec);

  // ── 자리·색 ──────────────────────────────────────────────

  const nicknameOf = useCallback(
    (pid: string) => players.find((p) => p.playerId === pid)?.nickname ?? "",
    [players],
  );
  const joinOrder = useMemo(
    () => [...players].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p) => p.playerId),
    [players],
  );
  /**
   * 사람별 색은 방에 있는 동안 고정. 입장 순서 번호로 정하면 누가 나갈 때 뒷사람들 색이 한 칸씩 당겨져
   * 설명판·채팅의 이름 색과 자리 색이 어긋났다. 새로 온 사람은 지금 남이 안 쓰는 색을 받는다
   */
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const newcomers = joinOrder.filter((pid) => !colorMap[pid]);
  if (newcomers.length > 0) {
    const next = { ...colorMap };
    const used = new Set(joinOrder.map((pid) => next[pid]).filter(Boolean));
    for (const pid of newcomers) {
      const c = LIAR_PLAYER_COLORS.find((x) => !used.has(x)) ?? LIAR_PLAYER_COLORS[0];
      next[pid] = c;
      used.add(c);
    }
    setColorMap(next);
  }
  const colorOf = useCallback((pid: string) => colorMap[pid] ?? LIAR_PLAYER_COLORS[0], [colorMap]);
  const colorOfRef = useRef(colorOf);
  const nicknameOfRef = useRef(nicknameOf);
  useEffect(() => {
    colorOfRef.current = colorOf;
    nicknameOfRef.current = nicknameOf;
  }, [colorOf, nicknameOf]);

  const inRound = phase !== "waiting" && phase !== "over";
  /** 판 중에는 설명 순서, 아니면 입장 순서 */
  const seats: LiarSeat[] = useMemo(() => {
    const ids = inRound && speakOrder.length > 0
      ? [...speakOrder, ...joinOrder.filter((pid) => !speakOrder.includes(pid))]
      : joinOrder;
    return ids
      .filter((pid) => players.some((p) => p.playerId === pid))
      .map((pid) => ({
        playerId: pid,
        nickname: nicknameOf(pid),
        color: colorOf(pid),
        score: scores[pid] ?? 0,
        isMe: pid === playerId,
        away: away.includes(pid),
        speaking: phase === "describe" && speakerId === pid,
        voted: voted.includes(pid),
      }));
  }, [inRound, speakOrder, joinOrder, players, nicknameOf, colorOf, scores, playerId, away, phase, speakerId, voted]);

  const voterCount = seats.filter((s) => speakOrder.includes(s.playerId) && !s.away).length;

  // ── 기록·알림 ────────────────────────────────────────────

  const addLog = useCallback(
    (entry: Omit<LiarLogEntry, "key">) => {
      setLogs((prev) => [...prev.slice(-(MAX_LOGS - 1)), { ...entry, key: ++keyRef.current }]);
      // 휴대폰 채팅 버튼·PC 오른쪽 채팅 기록에도 남긴다
      setMessages((prev) => [
        ...prev,
        entry.nickname
          ? { message: `${entry.tone === "desc" ? "✏️ " : ""}${entry.nickname}: ${entry.text}` }
          : { message: entry.text, isSystem: true },
      ]);
    },
    [setMessages],
  );

  /** 게임 기록에만 (채팅 패널에는 useRoomBase가 이미 남긴 안내) */
  const logOnly = useCallback((text: string) => {
    setLogs((prev) => [...prev.slice(-(MAX_LOGS - 1)), { tone: "system", text, key: ++keyRef.current }]);
  }, []);

  // 방장이 나갔는지 판단하려면 나가기 직전의 방장을 알아야 한다
  const hostIdRef = useRef(hostPlayerId);
  useEffect(() => {
    hostIdRef.current = hostPlayerId;
  }, [hostPlayerId]);

  const showToast = useCallback((text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(text);
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  // ── 서버 이벤트 ──────────────────────────────────────────

  useEffect(() => {
    const logResult = (r: LiarRoundResult) => {
      const tone = r.winner === "none" ? "system" : (r.winner === "liar") === (r.liarId === playerId) ? "good" : "bad";
      addLog({ tone, text: `📢 ${resultSummary(r)}` });
      addLog({
        tone: "system",
        text: `라이어는 ${r.liarNickname}님, 제시어는 '${r.word}' (라이어 단어 '${r.liarWord}')`,
      });
    };

    const applyJoin = (d: JoinData) => {
      if (d.name !== roomName) return;
      const s = d.liar;
      if (s) {
        setRound(s.round);
        setTotalRounds(s.totalRounds);
        setLaps(s.laps);
        setPhase(s.phase);
        setTopic(s.topic);
        setWord(s.word);
        setIsLiar(s.isLiar);
        setSpeakOrder(s.speakOrder);
        setDescriptions(s.descriptions);
        setSpeakerId(s.speakerId);
        setLap(s.lap);
        setVoted(s.voted);
        setMyVote(s.myVote);
        setAccusedId(s.accusedId);
        setResult(s.result);
        setIsLast(s.isLast);
        setScores(s.scores);
        setAway(s.away.filter((pid) => pid !== playerId));
        startClock(s.timeLeftMs);
        setGameOver(null);
        return;
      }
      startClock(null);
      setSpeakOrder([]);
      // 끊겨 있는 동안 게임이 끝났으면 결과를 보여준다 (닫았던 결과는 다시 열지 않는다)
      if (d.liarGameOver && !resultDismissedRef.current) {
        setGameOver(d.liarGameOver);
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
      // 입·퇴장·방장 위임: useRoomBase가 채팅 패널에 남기지만 휴대폰에선 그 버튼을 숨기므로 게임 기록에도 남긴다
      if ((event === "userJoined" || event === "userLeft") && d.roomName === roomName) {
        const e = data as { playerId?: string; nickname?: string; hostPlayerId?: string; hostNickname?: string };
        const who = e.nickname || "누군가";
        logOnly(event === "userJoined" ? `👋 ${who}님이 들어왔어요` : `🚪 ${who}님이 나갔어요`);
        if (event === "userLeft" && e.playerId && e.playerId === hostIdRef.current && e.hostNickname)
          logOnly(`👑 ${e.hostNickname}님이 새 방장이 되었어요`);
        return;
      }
      if (!event.startsWith("liar") || d.roomName !== roomName) return;

      switch (event) {
        case "liarStarted": {
          const e = data as { totalRounds: number; laps: number; scores: Record<string, number> };
          setTotalRounds(e.totalRounds);
          setLaps(e.laps);
          setScores(e.scores);
          setAway([]);
          setGameOver(null);
          setResultDismissed(false);
          addLog({ tone: "system", text: `🤥 라이어 시작! (${e.totalRounds}판)` });
          break;
        }
        case "liarRound": {
          const e = data as {
            round: number;
            totalRounds: number;
            topic: string;
            word: string | null;
            isLiar: boolean;
            speakOrder: string[];
            timeLimitMs: number;
          };
          setPhase("word");
          setRound(e.round);
          setTotalRounds(e.totalRounds);
          setTopic(e.topic);
          setWord(e.word);
          setIsLiar(e.isLiar);
          setSpeakOrder(e.speakOrder);
          setDescriptions([]);
          setSpeakerId(null);
          setLap(null);
          setVoted([]);
          setMyVote(null);
          setAccusedId(null);
          setResult(null);
          startClock(e.timeLimitMs);
          addLog({ tone: "system", text: `━ ${e.round}/${e.totalRounds}판 · 주제: ${e.topic} ━` });
          break;
        }
        case "liarSpeakTurn": {
          const e = data as { speakerId: string; lap: number; index: number; timeLimitMs: number };
          setPhase("describe");
          setSpeakerId(e.speakerId);
          setLap(e.lap);
          startClock(e.timeLimitMs);
          break;
        }
        case "liarDescription": {
          // 설명은 가운데 설명판에만. 채팅 기록에는 섞지 않는다 (PC 오른쪽 기록에는 남김)
          const e = data as LiarDescription;
          setDescriptions((prev) => [...prev, e]);
          setMessages((prev) => [...prev, { message: `✏️ ${e.nickname}: ${e.text}` }]);
          break;
        }
        case "liarDiscuss": {
          setPhase("discuss");
          setSpeakerId(null);
          setVoted([]);
          setMyVote(null);
          startClock((data as { timeLimitMs: number }).timeLimitMs);
          addLog({ tone: "system", text: "🗳️ 토론·투표 시작! 라이어로 의심되는 사람의 이름을 누르세요" });
          break;
        }
        case "liarVoteUpdate":
          setVoted((data as { voted: string[] }).voted);
          break;
        case "liarGuessTime": {
          const e = data as { liarId: string; nickname: string; timeLimitMs: number };
          setPhase("liarGuess");
          setAccusedId(e.liarId);
          if (e.liarId === playerId) setIsLiar(true);
          startClock(e.timeLimitMs);
          addLog({
            tone: "system",
            text:
              e.liarId === playerId
                ? "🎯 들켰어요! 제시어를 맞히면 역전승이에요"
                : `🎯 ${e.nickname}님이 라이어였어요! 제시어를 맞히는 중...`,
          });
          break;
        }
        case "liarRoundResult": {
          const e = data as LiarRoundResult & { scores: Record<string, number>; isLast: boolean; timeLimitMs: number };
          setPhase("result");
          setResult(e);
          setScores(e.scores);
          setIsLast(e.isLast);
          setSpeakerId(null);
          startClock(e.timeLimitMs);
          logResult(e);
          break;
        }
        case "liarChat": {
          const e = data as { playerId: string; nickname: string; text: string };
          addLog({ tone: "chat", nickname: e.nickname, color: colorOfRef.current(e.playerId), text: e.text });
          break;
        }
        case "liarBlocked":
          showToast("제시어가 들어간 말은 보낼 수 없어요");
          break;
        case "liarPresence": {
          const e = data as { playerId: string; connected: boolean };
          setAway((prev) =>
            e.connected ? prev.filter((p) => p !== e.playerId) : prev.includes(e.playerId) ? prev : [...prev, e.playerId],
          );
          break;
        }
        case "liarGameOver": {
          const e = data as LiarGameOver;
          setPhase("over");
          setGameOver(e);
          startClock(null);
          setResult(null);
          setSpeakOrder([]);
          setAway([]);
          const winner = e.ranking.filter((r) => r.rank === 1).map((r) => r.nickname).join(", ");
          addLog({ tone: "system", text: `🏆 게임 종료 — 1위 ${winner}` });
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName, playerId, entryState, addLog, showToast, resultDismissedRef, setResultDismissed, setMessages, startClock, logOnly]);

  // ── 보내기 ───────────────────────────────────────────────

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || !roomName) return;
    // 지목돼서 제시어를 맞히는 중이 아니면 내 단어가 들어간 말은 서버가 막는다 — 보내지 않고 입력도 남겨 둔다
    const guessing = phase === "liarGuess" && accusedId === playerId;
    if (word && !guessing && phase !== "result" && liarNormalize(text).includes(liarNormalize(word))) {
      showToast("제시어가 들어간 말은 보낼 수 없어요");
      return;
    }
    send("liarText", { roomName, text });
    setInput("");
  };

  const handleVote = (targetId: string | null) => {
    if (!roomName) return;
    setMyVote(targetId);
    send("liarVote", { roomName, targetId });
  };

  const handleStart = (s: LiarSettings) => {
    if (roomName) send("liarStart", { roomName, ...s });
  };

  const closeResult = () => {
    setResultDismissed(true);
    setGameOver(null);
    setScores({});
    setPhase("waiting");
  };

  return (
    <RoomLayout
      reconnecting={reconnecting}
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #9b59b6 0%, #5e2a7e 100%)",
        boxShadow: "0 4px 12px rgba(155, 89, 182, 0.4)",
      }}
      onHelp={() => setShowHelpModal(true)}
      onLeave={leaveRoom}
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
      // 게임 화면에 기록과 입력칸이 있으니 휴대폰 채팅 버튼은 숨긴다
      chatReadOnly
      hideChatToggle
      modals={<LiarHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />}
    >
      <LiarGameBoard
        phase={phase}
        round={round}
        totalRounds={totalRounds}
        laps={laps}
        topic={topic}
        word={word}
        isLiar={isLiar}
        seats={seats}
        descriptions={descriptions}
        speakOrder={speakOrder}
        colorOf={colorOf}
        speakerId={speakerId}
        lap={lap}
        votedCount={voted.length}
        voterCount={voterCount}
        myVote={myVote}
        accusedId={accusedId}
        result={result}
        isLast={isLast}
        secondsLeft={secondsLeft}
        logs={logs}
        toast={toast}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onVote={handleVote}
        myPlayerId={playerId}
        nicknameOf={nicknameOf}
        setupPanel={<LiarSetupPanel isHost={isHost} memberCount={memberCount} onStart={handleStart} />}
      />

      {phase === "over" && gameOver && (
        <LiarResultModal
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
