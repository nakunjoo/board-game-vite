import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoomBase } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";
import MafiaGameBoard from "../../../components/mafia/MafiaGameBoard";
import type { MafiaExecution } from "../../../components/mafia/MafiaGameBoard";
import MafiaHelpModal from "../../../components/mafia/MafiaHelpModal";
import MafiaSetupPanel from "../../../components/mafia/game/MafiaSetupPanel";
import MafiaResultModal, { winnerText } from "../../../components/mafia/game/MafiaResultModal";
import type {
  MafiaGameOver,
  MafiaLogEntry,
  MafiaPhase,
  MafiaRestoreState,
  MafiaSeat,
  PoliceLogEntry,
} from "../../../components/mafia/types";
import { useDeadlineSeconds } from "../../../utils/useDeadlineSeconds";
import { MAFIA_PLAYER_COLORS, MAFIA_ROLE_EMOJI, MAFIA_ROLE_LABEL } from "../../../utils/games/mafia";
import type { MafiaRole } from "../../../utils/games/mafia";

const TOAST_MS = 2000;
const MAX_LOGS = 200;

interface JoinData {
  name?: string;
  mafia?: MafiaRestoreState | null;
  mafiaGameOver?: MafiaGameOver | null;
}

export default function MafiaRoom() {
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

  const [phase, setPhase] = useState<MafiaPhase>("waiting");
  const [day, setDay] = useState(1);
  const [role, setRole] = useState<MafiaRole | null>(null);
  const [mafiaTeam, setMafiaTeam] = useState<string[]>([]);
  /** 이번 게임 참가자 (중간에 들어온 사람은 역할이 없다) */
  const [gamePlayers, setGamePlayers] = useState<string[]>([]);
  const [alive, setAlive] = useState<string[]>([]);
  const [myTarget, setMyTarget] = useState<string | null>(null);
  const [kills, setKills] = useState<Record<string, string>>({});
  const [policeLog, setPoliceLog] = useState<PoliceLogEntry[]>([]);
  const [investigatedTonight, setInvestigatedTonight] = useState<string | null>(null);
  const [voted, setVoted] = useState<string[]>([]);
  const [lastNight, setLastNight] = useState<{ killedId: string | null; killedNickname: string | null } | null>(null);
  const [execution, setExecution] = useState<MafiaExecution | null>(null);
  const [away, setAway] = useState<string[]>([]);
  /** 이번 게임 참가자 닉네임 — 게임 중에 나간 사람도 자리에 이름을 남긴다 */
  const [gameNames, setGameNames] = useState<Record<string, string>>({});
  const [clock, setClock] = useState<{ deadline: number | null; startSec: number }>({ deadline: null, startSec: 0 });
  const startClock = useCallback((ms: number | null) => {
    setClock(ms === null ? { deadline: null, startSec: 0 } : { deadline: Date.now() + ms, startSec: Math.ceil(ms / 1000) });
  }, []);
  const [gameOver, setGameOver] = useState<MafiaGameOver | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [input, setInput] = useState("");

  // 게임 화면 기록. 새로고침해도 남게 저장한다 (로비에서 새로 들어오면 비운다)
  const logStorageKey = `mafia-log:${roomName}`;
  const [logs, setLogs] = useState<MafiaLogEntry[]>(() => {
    if (entryState) return [];
    try {
      return JSON.parse(sessionStorage.getItem(logStorageKey) ?? "[]") as MafiaLogEntry[];
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
  // 사람별 색은 방에 있는 동안 고정 (라이어와 같은 방식 — 누가 나가도 다른 사람 색이 바뀌지 않는다)
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const newcomers = joinOrder.filter((pid) => !colorMap[pid]);
  if (newcomers.length > 0) {
    const next = { ...colorMap };
    const used = new Set(joinOrder.map((pid) => next[pid]).filter(Boolean));
    for (const pid of newcomers) {
      const c = MAFIA_PLAYER_COLORS.find((x) => !used.has(x)) ?? MAFIA_PLAYER_COLORS[0];
      next[pid] = c;
      used.add(c);
    }
    setColorMap(next);
  }
  const colorOf = useCallback((pid: string) => colorMap[pid] ?? MAFIA_PLAYER_COLORS[0], [colorMap]);
  const colorOfRef = useRef(colorOf);
  useEffect(() => {
    colorOfRef.current = colorOf;
  }, [colorOf]);

  const inGame = phase === "role" || phase === "night" || phase === "day";
  /** 게임 중에 나간 사람은 죽은 것으로 친다 (서버와 같게) */
  const aliveNow = useMemo(
    () => alive.filter((pid) => players.some((p) => p.playerId === pid)),
    [alive, players],
  );
  const amAlive = inGame && role !== null && aliveNow.includes(playerId);

  /** 자리는 입장 순서로 고정 (죽어도 자리를 옮기지 않는다 — 옮기면 누가 누군지 헷갈렸다) */
  const seats: MafiaSeat[] = useMemo(() => {
    const present = joinOrder.filter((pid) => players.some((p) => p.playerId === pid));
    // 게임 중에는 나간 참가자 자리도 남긴다. 참가자 목록은 서버가 입장 순서로 주고, 중간에 들어온 사람은 뒤에
    const ids = inGame ? [...gamePlayers, ...present.filter((pid) => !gamePlayers.includes(pid))] : present;
    return ids.map((pid) => ({
      playerId: pid,
      nickname: nicknameOf(pid) || gameNames[pid] || "",
      color: colorOf(pid),
      isMe: pid === playerId,
      alive: !inGame || aliveNow.includes(pid),
      away: away.includes(pid),
      left: inGame && !present.includes(pid),
      teammate: role === "mafia" && mafiaTeam.includes(pid),
      voted: voted.includes(pid),
    }));
  }, [joinOrder, players, inGame, gamePlayers, gameNames, aliveNow, nicknameOf, colorOf, playerId, away, role, mafiaTeam, voted]);

  const voterCount = aliveNow.filter((pid) => !away.includes(pid)).length;

  // ── 기록·알림 ────────────────────────────────────────────

  const addLog = useCallback(
    (entry: Omit<MafiaLogEntry, "key">) => {
      setLogs((prev) => [...prev.slice(-(MAX_LOGS - 1)), { ...entry, key: ++keyRef.current }]);
      // PC 오른쪽 채팅 기록에도 남긴다
      const scope = entry.tone === "mafia" ? "[마피아] " : entry.tone === "dead" ? "[💀] " : "";
      setMessages((prev) => [
        ...prev,
        entry.nickname
          ? { message: `${scope}${entry.nickname}: ${entry.text}` }
          : { message: entry.text, isSystem: true },
      ]);
    },
    [setMessages],
  );

  /** 게임 기록에만 (채팅 패널에는 useRoomBase가 이미 남긴 안내) */
  const logOnly = useCallback((text: string) => {
    setLogs((prev) => [...prev.slice(-(MAX_LOGS - 1)), { tone: "system", text, key: ++keyRef.current }]);
  }, []);

  const playersRef = useRef(players);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);
  /** 게임 참가자 닉네임을 잡아 둔다 (나간 뒤에도 자리에 이름을 보이려고) */
  const rememberNames = useCallback((ids: string[], names?: Record<string, string>) => {
    const map: Record<string, string> = { ...(names ?? {}) };
    for (const p of playersRef.current) if (ids.includes(p.playerId)) map[p.playerId] = p.nickname;
    setGameNames(map);
  }, []);

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
    const resetGame = () => {
      setRole(null);
      setMafiaTeam([]);
      setGamePlayers([]);
      setAlive([]);
      setMyTarget(null);
      setKills({});
      setPoliceLog([]);
      setInvestigatedTonight(null);
      setVoted([]);
      setLastNight(null);
      setExecution(null);
      setAway([]);
      setGameNames({});
    };

    const applyJoin = (d: JoinData) => {
      if (d.name !== roomName) return;
      const s = d.mafia;
      if (s) {
        setDay(s.day);
        setPhase(s.phase);
        setRole(s.role);
        setMafiaTeam(s.mafiaTeam);
        setGamePlayers(s.players);
        rememberNames(s.players, s.nicknames);
        setAlive(s.alive);
        setKills(s.kills);
        setPoliceLog(s.policeLog);
        setInvestigatedTonight(s.investigatedTonight);
        setVoted(s.voted);
        setAway(s.away.filter((pid) => pid !== playerId));
        // 밤: 내 행동 대상 / 낮: 내 투표
        setMyTarget(
          s.phase === "night"
            ? s.role === "mafia"
              ? (s.kills[playerId] ?? null)
              : s.role === "doctor"
                ? s.healedTonight
                : s.role === "police"
                  ? s.investigatedTonight
                  : null
            : s.myVote,
        );
        setLastNight(
          s.lastNight && s.lastNight.day === s.day
            ? { killedId: s.lastNight.killedId, killedNickname: null }
            : null,
        );
        setExecution(
          s.phase === "day" && s.lastExecution && s.lastExecution.day === s.day
            ? { executedId: s.lastExecution.executedId, executedNickname: null, tally: s.lastExecution.tally }
            : null,
        );
        startClock(s.timeLeftMs);
        setGameOver(null);
        return;
      }
      startClock(null);
      resetGame();
      // 끊겨 있는 동안 게임이 끝났으면 결과를 보여준다 (닫았던 결과는 다시 열지 않는다)
      if (d.mafiaGameOver && !resultDismissedRef.current) {
        setGameOver(d.mafiaGameOver);
        setPhase("over");
      } else {
        setPhase("waiting");
      }
    };

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
      if ((event === "userJoined" || event === "userLeft") && d.roomName === roomName) {
        const e = data as { playerId?: string; nickname?: string; hostNickname?: string };
        const who = e.nickname || "누군가";
        logOnly(event === "userJoined" ? `👋 ${who}님이 들어왔어요` : `🚪 ${who}님이 나갔어요`);
        if (event === "userLeft" && e.playerId && e.playerId === hostIdRef.current && e.hostNickname)
          logOnly(`👑 ${e.hostNickname}님이 새 방장이 되었어요`);
        return;
      }
      if (!event.startsWith("mafia") || d.roomName !== roomName) return;

      switch (event) {
        case "mafiaStarted": {
          const e = data as { players: string[]; mafiaCount: number };
          resetGame();
          setDay(1);
          setPhase("role");
          setGamePlayers(e.players);
          rememberNames(e.players);
          setAlive(e.players);
          setGameOver(null);
          setResultDismissed(false);
          // 이전 게임 기록은 지운다 (마피아는 지난 판 속삭임·조사 결과가 남아 있었다).
          // 넓은 화면 오른쪽 채팅창(같은 기록을 따로 들고 있다)도 같이
          setLogs([]);
          setMessages([]);
          addLog({ tone: "system", text: `🔪 마피아 시작! (${e.players.length}명 · 마피아 ${e.mafiaCount}명)` });
          break;
        }
        case "mafiaRole": {
          const e = data as { role: MafiaRole; mafiaTeam: string[]; timeLimitMs: number };
          setRole(e.role);
          setMafiaTeam(e.mafiaTeam);
          setPhase("role");
          startClock(e.timeLimitMs);
          break;
        }
        case "mafiaTimer": {
          // 밤 할 일이 일찍 끝나 서버가 남은 시간을 줄였다
          startClock((data as { timeLimitMs: number }).timeLimitMs);
          break;
        }
        case "mafiaNight": {
          const e = data as { day: number; timeLimitMs: number };
          setPhase("night");
          setDay(e.day);
          setMyTarget(null);
          setKills({});
          setInvestigatedTonight(null);
          setVoted([]);
          setExecution(null);
          setLastNight(null);
          startClock(e.timeLimitMs);
          addLog({ tone: "system", text: `━ 🌙 ${e.day}일째 밤 ━` });
          break;
        }
        case "mafiaKillUpdate":
          setKills((data as { kills: Record<string, string> }).kills);
          break;
        case "mafiaInvestigated": {
          const e = data as { targetId: string; nickname: string; isMafia: boolean };
          setInvestigatedTonight(e.targetId);
          setPoliceLog((prev) => [...prev, { targetId: e.targetId, isMafia: e.isMafia, day: 0 }]);
          // 조사 결과는 경찰 혼자만 보는 기록
          setLogs((prev) => [
            ...prev.slice(-(MAX_LOGS - 1)),
            {
              tone: e.isMafia ? "bad" : "good",
              text: `🚓 조사 결과: ${e.nickname}님은 ${e.isMafia ? "마피아예요!" : "마피아가 아니에요"}`,
              key: ++keyRef.current,
            },
          ]);
          break;
        }
        case "mafiaDay": {
          const e = data as { day: number; killedId: string | null; killedNickname: string | null; alive: string[]; timeLimitMs: number };
          setPhase("day");
          setDay(e.day);
          setAlive(e.alive);
          setMyTarget(null);
          setVoted([]);
          setExecution(null);
          setLastNight({ killedId: e.killedId, killedNickname: e.killedNickname });
          startClock(e.timeLimitMs);
          addLog({ tone: "system", text: `━ ☀️ ${e.day}일째 낮 ━` });
          addLog(
            e.killedId
              ? { tone: e.killedId === playerId ? "bad" : "system", text: `💀 밤사이 ${e.killedNickname}님이 죽었어요` }
              : { tone: "good", text: "🌅 밤사이 아무도 죽지 않았어요" },
          );
          break;
        }
        case "mafiaVoteUpdate":
          setVoted((data as { voted: string[] }).voted);
          break;
        case "mafiaExecuted": {
          const e = data as MafiaExecution & { alive: string[]; timeLimitMs: number };
          setExecution({ executedId: e.executedId, executedNickname: e.executedNickname, tally: e.tally });
          setAlive(e.alive);
          setMyTarget(null);
          startClock(e.timeLimitMs);
          addLog(
            e.executedId
              ? { tone: e.executedId === playerId ? "bad" : "system", text: `⚖️ 투표로 ${e.executedNickname}님이 처형됐어요` }
              : { tone: "system", text: "⚖️ 표가 갈려 아무도 처형되지 않았어요" },
          );
          break;
        }
        case "mafiaChat": {
          const e = data as { playerId: string; nickname: string; text: string; scope: "all" | "mafia" | "dead" };
          addLog({
            tone: e.scope === "all" ? "chat" : e.scope,
            nickname: e.nickname,
            color: colorOfRef.current(e.playerId),
            text: e.text,
          });
          break;
        }
        case "mafiaSilent":
          showToast("밤에는 말할 수 없어요");
          break;
        case "mafiaWhisperLate":
          showToast("밤이 끝나서 마피아 대화를 보내지 않았어요");
          break;
        case "mafiaPresence": {
          const e = data as { playerId: string; connected: boolean };
          setAway((prev) =>
            e.connected ? prev.filter((p) => p !== e.playerId) : prev.includes(e.playerId) ? prev : [...prev, e.playerId],
          );
          break;
        }
        case "mafiaGameOver": {
          const e = data as MafiaGameOver;
          setPhase("over");
          setGameOver(e);
          startClock(null);
          setAway([]);
          setExecution(null);
          setMyTarget(null);
          setVoted([]);
          addLog({
            tone: "system",
            text: `🏁 ${winnerText(e.winner)}${e.winner === "none" ? " — 인원이 부족해 일찍 끝났어요" : ""}`,
          });
          const roles = Object.entries(e.roles)
            .filter(([, r]) => r !== "citizen")
            .map(([pid, r]) => `${MAFIA_ROLE_EMOJI[r]} ${MAFIA_ROLE_LABEL[r]} ${e.nicknames[pid] ?? "?"}`)
            .join(" · ");
          if (roles) addLog({ tone: "system", text: roles });
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName, playerId, entryState, addLog, showToast, resultDismissedRef, setResultDismissed, setMessages, startClock, logOnly, rememberNames]);

  // ── 보내기 ───────────────────────────────────────────────

  /** 지금 보내면 누가 보는지 */
  const scopeNow: "all" | "mafia" | "dead" | "silent" =
    !inGame || role === null ? "all" : !amAlive ? "dead" : phase === "night" ? (role === "mafia" ? "mafia" : "silent") : "all";
  /**
   * 입력을 시작할 때의 대상. 밤에 마피아끼리 쓰던 말을 보내려는 순간 밤이 끝나면(모두 할 일을 마치면 바로 끝난다)
   * 그 말이 낮 공개 채팅으로 나가 마피아가 들통났다 — 이럴 땐 한 번 막는다
   */
  const composeScopeRef = useRef(scopeNow);
  const handleInputChange = (v: string) => {
    if (!input.trim() && v.trim()) composeScopeRef.current = scopeNow;
    setInput(v);
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || !roomName) return;
    if (scopeNow === "silent") {
      showToast("밤에는 말할 수 없어요");
      return;
    }
    const whisper = composeScopeRef.current === "mafia";
    if (whisper && scopeNow !== "mafia") {
      composeScopeRef.current = scopeNow; // 다시 누르면 그때는 지금 대상에게 보낸다
      showToast("밤이 끝나서 보내지 않았어요. 다시 누르면 모두에게 보내요");
      return;
    }
    send("mafiaText", { roomName, text, whisper });
    setInput("");
  };

  const handleAction = (targetId: string | null) => {
    if (!roomName) return;
    setMyTarget(targetId);
    send("mafiaAction", { roomName, targetId });
  };

  const handleStart = (discussTimeSec: number) => {
    if (roomName) send("mafiaStart", { roomName, discussTimeSec });
  };

  const closeResult = () => {
    setResultDismissed(true);
    setGameOver(null);
    setPhase("waiting");
  };

  return (
    <RoomLayout
      reconnecting={reconnecting}
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #c0392b 0%, #2c3e50 100%)",
        boxShadow: "0 4px 12px rgba(192, 57, 43, 0.4)",
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
      modals={<MafiaHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />}
    >
      <MafiaGameBoard
        phase={phase}
        day={day}
        role={inGame && gamePlayers.includes(playerId) ? role : null}
        amAlive={amAlive}
        seats={seats}
        myTarget={myTarget}
        kills={kills}
        policeLog={policeLog}
        investigatedTonight={investigatedTonight}
        votedCount={voted.filter((pid) => aliveNow.includes(pid)).length}
        voterCount={voterCount}
        lastNight={lastNight}
        execution={execution}
        secondsLeft={secondsLeft}
        logs={logs}
        toast={toast}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onAction={handleAction}
        myPlayerId={playerId}
        nicknameOf={nicknameOf}
        setupPanel={<MafiaSetupPanel isHost={isHost} memberCount={memberCount} onStart={handleStart} />}
      />

      {phase === "over" && gameOver && (
        <MafiaResultModal
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
