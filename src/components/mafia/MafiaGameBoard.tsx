import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { MafiaLogEntry, MafiaPhase, MafiaSeat, PoliceLogEntry } from "./types";
import {
  BoardWrap,
  BoardBody,
  WideWrap,
  WideLeft,
  WideRight,
  TopBar,
  TimeText,
  WordCard,
  WordTopic,
  WordValue,
  PeekButton,
  SeatGrid,
  Seat,
  SeatName,
  SeatSub,
  SeatTag,
  StagePanel,
  InlineButton,
  Log,
  InputBar,
  TextInput,
  SendButton,
  ToastWrap,
  Toast,
} from "../../styles/game/liar/board";
import { MafiaLogLine, RoleHint, RoleText, ScopeTag, TeamLine } from "../../styles/game/mafia/board";
import { useMediaQuery } from "../../utils/useMediaQuery";
import { MAFIA_ROLE_EMOJI, MAFIA_ROLE_HINT, MAFIA_ROLE_LABEL } from "../../utils/games/mafia";
import type { MafiaRole } from "../../utils/games/mafia";

export interface MafiaExecution {
  executedId: string | null;
  executedNickname: string | null;
  tally: Record<string, number>;
}

interface Props {
  phase: MafiaPhase;
  day: number;
  /** 내 역할 (게임 중간에 들어와 역할이 없으면 null) */
  role: MafiaRole | null;
  amAlive: boolean;
  seats: MafiaSeat[];
  /** 밤 행동 대상 또는 낮 투표 대상 */
  myTarget: string | null;
  /** 마피아에게만: 마피아 → 고른 사람 */
  kills: Record<string, string>;
  policeLog: PoliceLogEntry[];
  /** 경찰: 오늘 밤 조사를 했는지 */
  investigatedTonight: string | null;
  votedCount: number;
  voterCount: number;
  /** 낮이 시작될 때 발표한 밤 결과 */
  lastNight: { killedId: string | null; killedNickname: string | null } | null;
  /** 낮 투표가 끝난 뒤 처형 결과 (다음 밤이 되면 null) */
  execution: MafiaExecution | null;
  secondsLeft: number;
  logs: MafiaLogEntry[];
  toast: string | null;
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  onAction: (targetId: string | null) => void;
  myPlayerId: string;
  nicknameOf: (playerId: string) => string;
  setupPanel?: ReactNode;
}

export default function MafiaGameBoard(props: Props) {
  const {
    phase,
    day,
    role,
    amAlive,
    seats,
    myTarget,
    kills,
    policeLog,
    investigatedTonight,
    votedCount,
    voterCount,
    lastNight,
    execution,
    secondsLeft,
    logs,
    toast,
    input,
    onInputChange,
    onSubmit,
    onAction,
    myPlayerId,
    nicknameOf,
    setupPanel,
  } = props;

  // 옆 사람이 화면을 볼 수 있을 때 역할을 가려 둔다
  const [hideRole, setHideRole] = useState(false);
  const wide = useMediaQuery("(max-width: 1080px) and (orientation: landscape)");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const inGame = phase === "role" || phase === "night" || phase === "day";
  const night = phase === "night";
  const voting = phase === "day" && !execution;
  const acting = amAlive && role !== null && (night || voting);
  const urgent = (night || voting) && secondsLeft <= 10;
  const nameOf = (pid: string | null) => (pid ? nicknameOf(pid) || "나간 사람" : "");

  /** 경찰이 조사한 결과 */
  const policeResult = (pid: string) => policeLog.find((p) => p.targetId === pid);
  /** 마피아 화면: 이 사람을 고른 마피아 수 */
  const killCount = (pid: string) => Object.values(kills).filter((t) => t === pid).length;

  const canTarget = (s: MafiaSeat): boolean => {
    if (!acting || !s.alive) return false;
    if (voting) return !s.isMe;
    if (role === "mafia") return !s.isMe && !s.teammate;
    if (role === "police") return !investigatedTonight && !s.isMe && !policeResult(s.playerId);
    if (role === "doctor") return true;
    return false;
  };

  // ── 내 역할 ──
  const team = seats.filter((s) => s.teammate && !s.isMe);
  const roleCard = inGame && role && (
    <WordCard $liar={role === "mafia"}>
      <RoleText>
        <WordTopic>내 역할{amAlive ? "" : " · 💀 사망"}</WordTopic>
        <WordValue $hidden={hideRole}>
          {MAFIA_ROLE_EMOJI[role]} {MAFIA_ROLE_LABEL[role]}
        </WordValue>
        {!hideRole && <RoleHint>{MAFIA_ROLE_HINT[role]}</RoleHint>}
        {!hideRole && role === "mafia" && team.length > 0 && (
          <TeamLine>동료: {team.map((s) => s.nickname).join(", ")}</TeamLine>
        )}
      </RoleText>
      <PeekButton type="button" onClick={() => setHideRole((v) => !v)}>
        {hideRole ? "보기" : "가리기"}
      </PeekButton>
    </WordCard>
  );

  // ── 참가자 ──
  const seatGrid = (
    <SeatGrid>
      {seats.map((s) => {
        const clickable = canTarget(s);
        const chosen = acting && myTarget === s.playerId;
        let tag: ReactNode = null;
        const pr = role === "police" && !hideRole ? policeResult(s.playerId) : undefined;
        if (execution && (execution.tally[s.playerId] ?? 0) > 0) {
          tag = <SeatTag $tone="count">{execution.tally[s.playerId]}표</SeatTag>;
        } else if (s.teammate && !s.isMe && !hideRole) {
          tag = <SeatTag $tone="liar">마피아</SeatTag>;
        } else if (pr) {
          tag = <SeatTag $tone={pr.isMafia ? "liar" : "vote"}>{pr.isMafia ? "마피아" : "시민"}</SeatTag>;
        } else if (night && role === "mafia" && killCount(s.playerId) > 0) {
          tag = <SeatTag $tone="liar">🔪{killCount(s.playerId) > 1 ? killCount(s.playerId) : ""}</SeatTag>;
        } else if (voting && s.voted) {
          tag = <SeatTag $tone="vote">✓</SeatTag>;
        }
        return (
          <Seat
            key={s.playerId}
            type="button"
            $color={s.color}
            $speaking={false}
            $myVote={chosen}
            $clickable={clickable}
            $isMe={s.isMe}
            $dim={!s.alive || s.away}
            aria-disabled={!clickable}
            tabIndex={clickable ? 0 : -1}
            onClick={() => {
              if (!clickable) return;
              // 낮 투표는 다시 누르면 취소. 밤 행동은 취소 없이 바꾸기만
              if (voting && chosen) onAction(null);
              else if (!chosen) onAction(s.playerId);
            }}
            aria-label={clickable ? `${s.nickname} 선택` : s.nickname}
          >
            {tag}
            <SeatName style={{ color: s.color, textDecoration: s.alive ? undefined : "line-through" }}>{s.nickname}</SeatName>
            <SeatSub>{s.away ? "⚠︎ 끊김" : !inGame ? " " : s.alive ? "생존" : "💀 사망"}</SeatSub>
          </Seat>
        );
      })}
    </SeatGrid>
  );

  // ── 단계 안내 ──
  const time = <TimeText $urgent={urgent}>{secondsLeft}초</TimeText>;
  let stage: ReactNode = null;
  if (!inGame) {
    stage = setupPanel;
  } else if (phase === "role") {
    stage = (
      <StagePanel>
        역할을 확인하세요
        <br />
        <small>{time} 뒤 첫날 밤이 시작돼요</small>
      </StagePanel>
    );
  } else if (night) {
    if (!amAlive || !role) {
      stage = (
        <StagePanel>
          🌙 밤이에요 · {time}
          <br />
          <small>{role ? "죽은 사람끼리 채팅할 수 있어요" : "다음 게임부터 참여할 수 있어요"}</small>
        </StagePanel>
      );
    } else if (role === "mafia") {
      const mates = Object.entries(kills).filter(([m]) => m !== myPlayerId);
      stage = (
        <StagePanel $tone="alert">
          🔪 없앨 사람을 누르세요 · {time}
          <br />
          <small>
            {myTarget ? `내 선택: ${nameOf(myTarget)}` : "동료와 마피아 채팅으로 상의할 수 있어요"}
            {mates.map(([m, t]) => ` · ${nameOf(m)}: ${nameOf(t)}`).join("")}
          </small>
        </StagePanel>
      );
    } else if (role === "police") {
      const found = investigatedTonight ? policeResult(investigatedTonight) : undefined;
      stage = found ? (
        <StagePanel $tone={found.isMafia ? "alert" : undefined}>
          🚓 <b>{nameOf(found.targetId)}</b>님은 {found.isMafia ? <b>마피아예요!</b> : "마피아가 아니에요"}
          <br />
          <small>날이 밝기를 기다리는 중 · {time}</small>
        </StagePanel>
      ) : (
        <StagePanel>
          🚓 조사할 사람을 누르세요 · {time}
          <br />
          <small>하룻밤에 한 명. 결과는 나만 봐요</small>
        </StagePanel>
      );
    } else if (role === "doctor") {
      stage = (
        <StagePanel>
          💉 살릴 사람을 누르세요 · {time}
          <br />
          <small>{myTarget ? `내 선택: ${nameOf(myTarget)}${myTarget === myPlayerId ? " (나)" : ""} · 바꿀 수 있어요` : "나 자신도 고를 수 있어요"}</small>
        </StagePanel>
      );
    } else {
      stage = (
        <StagePanel>
          🌙 밤이에요. 마피아가 움직이는 중… · {time}
          <br />
          <small>밤에는 말할 수 없어요</small>
        </StagePanel>
      );
    }
  } else if (execution) {
    stage = (
      <StagePanel $tone={execution.executedId ? "alert" : undefined}>
        {execution.executedId ? (
          <>
            ⚖️ <b>{execution.executedNickname || nameOf(execution.executedId)}</b>님이 처형됐어요
          </>
        ) : (
          "⚖️ 표가 갈려 아무도 처형되지 않았어요"
        )}
        <br />
        <small>{time} 뒤 밤이 돼요</small>
      </StagePanel>
    );
  } else {
    const news = lastNight
      ? lastNight.killedId
        ? `밤사이 ${lastNight.killedNickname || nameOf(lastNight.killedId)}님이 죽었어요`
        : "밤사이 아무도 죽지 않았어요"
      : "";
    stage = (
      <StagePanel>
        ☀️ {news}
        <br />
        <small>
          {amAlive && role
            ? `의심되는 사람을 눌러 투표 · ${votedCount}/${voterCount}명 투표 · ${secondsLeft}초`
            : `${votedCount}/${voterCount}명 투표 · ${secondsLeft}초`}
          {amAlive && myTarget ? ` · 내 선택: ${nameOf(myTarget)}` : ""}
        </small>
        {amAlive && myTarget && (
          <InlineButton type="button" onClick={() => onAction(null)}>
            취소
          </InlineButton>
        )}
      </StagePanel>
    );
  }

  // ── 입력 ──
  const dead = inGame && role !== null && !amAlive;
  const silent = night && role !== null && amAlive && role !== "mafia";
  const whisper = night && role === "mafia" && amAlive;
  const placeholder = dead
    ? "죽은 사람끼리 채팅"
    : silent
      ? "밤에는 말할 수 없어요"
      : whisper
        ? "마피아끼리 채팅"
        : "채팅";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  const inputBar = (
    <InputBar onSubmit={submit}>
      <TextInput
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholder}
        maxLength={100}
        enterKeyHint="send"
        autoComplete="off"
        disabled={silent}
      />
      <SendButton type="submit" disabled={silent || !input.trim()} $highlight={whisper}>
        {whisper ? "속삭임" : "전송"}
      </SendButton>
    </InputBar>
  );

  const phaseLabel = phase === "role" ? "역할 확인" : night ? "🌙 밤" : execution ? "⚖️ 처형" : "☀️ 낮";
  const topBar = (
    <TopBar>
      <span>{inGame ? `${day}일째 · ${phaseLabel}` : "🔪 마피아"}</span>
      {inGame && (
        <span>
          ⏳ <TimeText $urgent={urgent}>{secondsLeft}초</TimeText>
        </span>
      )}
    </TopBar>
  );

  const logView = (
    <Log ref={logRef}>
      {logs.map((l) => (
        <MafiaLogLine key={l.key} $tone={l.tone}>
          {(l.tone === "mafia" || l.tone === "dead") && (
            <ScopeTag $tone={l.tone}>{l.tone === "mafia" ? "[마피아]" : "[💀]"}</ScopeTag>
          )}
          {l.nickname && <b style={{ color: l.color }}>{l.nickname} </b>}
          {l.text}
        </MafiaLogLine>
      ))}
    </Log>
  );

  if (wide) {
    return (
      <WideWrap>
        <WideLeft>
          {topBar}
          {roleCard}
          {seatGrid}
          {stage}
        </WideLeft>
        <WideRight>
          {logView}
          <ToastWrap>{toast && <Toast>{toast}</Toast>}</ToastWrap>
          {inputBar}
        </WideRight>
      </WideWrap>
    );
  }

  return (
    <BoardWrap>
      <BoardBody>
        {topBar}
        {roleCard}
        {seatGrid}
        {stage}
        {logView}
      </BoardBody>
      <ToastWrap>{toast && <Toast>{toast}</Toast>}</ToastWrap>
      {inputBar}
    </BoardWrap>
  );
}
