import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import LiarDescBoard from "./game/LiarDescBoard";
import PhasePopup from "../PhasePopup";
import type { PhasePopupContent } from "../PhasePopup";
import { PopupRows } from "../../styles/game/phasePopup";
import type { LiarDescription, LiarLogEntry, LiarPhase, LiarRoundResult, LiarSeat } from "./types";
import {
  BoardWrap,
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
  MyVoteTag,
  VoteStatus,
  SpeakDot,
  StagePanel,
  ResultTitle,
  ResultRows,
  InlineButton,
  Log,
  LogLine,
  InputBar,
  TextInput,
  SendButton,
  ToastWrap,
  Toast,
  BoardBody,
  WideWrap,
  WideLeft,
  WideRight,
} from "../../styles/game/liar/board";
import { useMediaQuery } from "../../utils/useMediaQuery";
import { LIAR_DESC_OPEN_KEY, LIAR_MAX_DESC_LENGTH } from "../../utils/games/liar";
import { LOG_MAX_VH_FOLDED, LOG_MAX_VH_OPEN } from "../../styles/game/liar/board";

const loadDescOpen = () => {
  try {
    return localStorage.getItem(LIAR_DESC_OPEN_KEY) !== "0";
  } catch {
    return true;
  }
};

interface Props {
  phase: LiarPhase;
  round: number;
  totalRounds: number;
  laps: number;
  topic: string;
  /** 내 화면의 단어 (라이어는 같은 주제의 다른 단어를 받는다) */
  word: string | null;
  /** 내가 라이어인 걸 아는지 — 지목돼서 제시어를 맞힐 때에야 안다 */
  isLiar: boolean;
  seats: LiarSeat[];
  /** 이번 판 설명 (가운데 설명판) */
  descriptions: LiarDescription[];
  speakOrder: string[];
  colorOf: (playerId: string) => string;
  speakerId: string | null;
  lap: number | null;
  votedCount: number;
  voterCount: number;
  myVote: string | null;
  accusedId: string | null;
  result: LiarRoundResult | null;
  isLast: boolean;
  secondsLeft: number;
  logs: LiarLogEntry[];
  toast: string | null;
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  onVote: (playerId: string | null) => void;
  myPlayerId: string;
  nicknameOf: (playerId: string) => string;
  /** 시작 전 설정·대기 안내 */
  setupPanel?: ReactNode;
}

const REASON_TEXT: Record<LiarRoundResult["reason"], string> = {
  tie: "표가 갈려 라이어를 찾지 못했어요",
  wrongAccused: "엉뚱한 사람을 지목했어요",
  guessed: "라이어가 제시어를 맞혔어요",
  guessFailed: "라이어가 제시어를 못 맞혔어요",
  liarLeft: "라이어가 나가서 이번 판은 무효예요",
};

export function resultSummary(r: LiarRoundResult): string {
  const head = r.winner === "liar" ? "라이어 승리" : r.winner === "citizens" ? "시민 승리" : "무효";
  return `${head} — ${REASON_TEXT[r.reason]}`;
}

export default function LiarGameBoard(props: Props) {
  const {
    phase,
    round,
    totalRounds,
    laps,
    topic,
    word,
    isLiar,
    seats,
    descriptions,
    speakOrder,
    colorOf,
    speakerId,
    lap,
    votedCount,
    voterCount,
    myVote,
    accusedId,
    result,
    isLast,
    secondsLeft,
    logs,
    toast,
    input,
    onInputChange,
    onSubmit,
    onVote,
    myPlayerId,
    nicknameOf,
    setupPanel,
  } = props;

  // 옆 사람이 화면을 볼 수 있을 때 제시어를 가려 둔다
  const [hideWord, setHideWord] = useState(false);
  const [descOpen, setDescOpen] = useState(loadDescOpen);
  // 휴대폰·태블릿을 눕힌 화면 (끄적끄적과 같은 기준)
  const wide = useMediaQuery("(max-width: 1080px) and (orientation: landscape)");
  const toggleDesc = () =>
    setDescOpen((prev) => {
      try {
        localStorage.setItem(LIAR_DESC_OPEN_KEY, prev ? "0" : "1");
      } catch {
        // 저장이 안 되면 이번에만 바뀐다
      }
      return !prev;
    });
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const inRound = phase === "word" || phase === "describe" || phase === "discuss" || phase === "liarGuess" || phase === "result";
  const myTurn = phase === "describe" && speakerId === myPlayerId;
  const iGuess = phase === "liarGuess" && accusedId === myPlayerId;
  const urgent = (phase === "describe" || phase === "discuss" || phase === "liarGuess") && secondsLeft <= 10;

  const phaseLabel: Record<LiarPhase, string> = {
    waiting: "대기 중",
    word: "제시어 확인",
    describe: `설명${laps > 1 && lap ? ` ${lap}/${laps}바퀴` : ""}`,
    discuss: "토론·투표",
    liarGuess: "라이어 정답 맞히기",
    result: "결과",
    over: "게임 종료",
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // ── 내 제시어 ──
  const wordCard = inRound && (
    <WordCard $liar={isLiar}>
      <WordTopic>주제 · {topic}</WordTopic>
      {phase === "result" && result ? (
        <WordValue>{result.word}</WordValue>
      ) : (
        <WordValue $hidden={hideWord}>
          {iGuess ? "🤥 당신이 라이어!" : word}
        </WordValue>
      )}
      {phase !== "result" && (
        <PeekButton type="button" onClick={() => setHideWord((v) => !v)}>
          {hideWord ? "보기" : "가리기"}
        </PeekButton>
      )}
    </WordCard>
  );

  // ── 참가자 ──
  const seatGrid = (
    <SeatGrid>
      {seats.map((s) => {
        const clickable = phase === "discuss" && !s.isMe;
        const isMyVote = phase === "discuss" && myVote === s.playerId;
        const tally = result?.tally[s.playerId] ?? 0;
        const gain = result?.gains[s.playerId];
        let tag: ReactNode = null;
        if (phase === "result" && result) {
          if (s.playerId === result.liarId) tag = <SeatTag $tone="liar">라이어</SeatTag>;
          else if (tally > 0) tag = <SeatTag $tone="count">{tally}표</SeatTag>;
        } else if (phase === "liarGuess" && s.playerId === accusedId) {
          tag = <SeatTag $tone="liar">라이어</SeatTag>;
        }
        return (
          <Seat
            key={s.playerId}
            type="button"
            $color={s.color}
            $speaking={phase === "describe" && speakerId === s.playerId}
            $myVote={isMyVote}
            $clickable={clickable}
            $isMe={s.isMe}
            $dim={s.away}
            // disabled는 쓰지 않는다 — 브라우저(특히 사파리)가 비활성 버튼을 제멋대로 흐리게 칠해 투표 때 말고는 칸이 바래 보인다
            aria-disabled={!clickable}
            tabIndex={clickable ? 0 : -1}
            onClick={() => clickable && onVote(isMyVote ? null : s.playerId)}
            aria-label={clickable ? `${s.nickname}에게 투표` : s.nickname}
          >
            {tag}
            {isMyVote && <MyVoteTag>내 표</MyVoteTag>}
            {phase === "describe" && speakerId === s.playerId && <SpeakDot aria-label="설명 차례" />}
            <SeatName style={{ color: s.color }}>{s.nickname}</SeatName>
            <SeatSub $done={phase === "discuss" && s.voted}>
              {s.away ? "⚠︎ 끊김" : phase === "discuss" && s.voted ? "✓ 투표함" : `${s.score}점`}
              {gain ? ` +${gain}` : ""}
            </SeatSub>
          </Seat>
        );
      })}
    </SeatGrid>
  );

  // ── 단계 안내 ──
  const time = <TimeText $urgent={urgent}>{secondsLeft}초</TimeText>;
  let stage: ReactNode = null;
  if (phase === "waiting" || phase === "over") {
    stage = setupPanel;
  } else if (phase === "word") {
    stage = (
      <StagePanel>
        제시어를 확인하세요
        <br />
        <small>한 명만 같은 주제의 다른 단어를 받았어요. 내가 라이어일 수도 있어요!</small>
        <br />
        <small>{time} 뒤 설명 시작</small>
      </StagePanel>
    );
  } else if (phase === "discuss") {
    stage = (
      <StagePanel>
        🗳️ 라이어로 의심되는 사람을 눌러 투표하세요 · {time}
        <br />
        <small>{votedCount}/{voterCount}명 투표했어요</small>
        <VoteStatus $done={!!myVote}>
          {myVote ? (
            <>
              ✅ 내 표: {nicknameOf(myVote)}
              <InlineButton type="button" onClick={() => onVote(null)}>
                취소
              </InlineButton>
            </>
          ) : (
            "⏳ 아직 투표하지 않았어요"
          )}
        </VoteStatus>
      </StagePanel>
    );
  } else if (phase === "liarGuess") {
    stage = iGuess ? (
      <StagePanel $tone="alert">
        🎯 <b>들켰어요!</b> 제시어를 맞히면 역전승이에요 · {time}
      </StagePanel>
    ) : (
      <StagePanel $tone="alert">
        🎯 <b>{accusedId ? nicknameOf(accusedId) : ""}</b>님이 라이어였어요! 제시어를 맞히는 중 · {time}
      </StagePanel>
    );
  } else if (phase === "result" && result) {
    // 라이어가 나가서 무효면 지목 결과가 의미 없다 ("없음 (동점)"으로 잘못 보이거나, 정답 맞히던 중이면 나간 사람이라 "?"가 됐다)
    const accused =
      result.reason === "liarLeft"
        ? null
        : result.accusedId === result.liarId
          ? result.liarNickname
          : result.accusedId
            ? nicknameOf(result.accusedId) || "나간 사람"
            : "없음 (동점)";
    stage = (
      <StagePanel>
        <ResultTitle $win={result.winner}>{resultSummary(result)}</ResultTitle>
        <ResultRows>
          <span>라이어</span>
          <span>{result.liarNickname}</span>
          <span>제시어</span>
          <span>{result.word}</span>
          <span>라이어 단어</span>
          <span>{result.liarWord}</span>
          {accused !== null && (
            <>
              <span>지목</span>
              <span>{accused}</span>
            </>
          )}
          {result.liarGuess !== null && (
            <>
              <span>라이어의 답</span>
              <span>{result.liarGuess}</span>
            </>
          )}
        </ResultRows>
        <small>{isLast ? "마지막 판이었어요" : "다음 판"} · {time}</small>
      </StagePanel>
    );
  }

  // ── 가운데 팝업: 새 판 시작 · 토론 시작 · 라이어 지목 · 판 결과 ──
  let popup: PhasePopupContent | null = null;
  if (phase === "word") {
    popup = {
      key: `word-${round}`,
      emoji: "🎲",
      title: `${round}/${totalRounds}판 시작!`,
      body: (
        <>
          주제는 <b>{topic}</b>
          <br />
          내 제시어 <b>{hideWord ? "(가려 둠)" : word}</b>
          <br />
          <small>한 명만 다른 단어를 받았어요. 나일 수도 있어요!</small>
        </>
      ),
      countdown: { seconds: secondsLeft, label: "뒤 설명 시작" },
    };
  } else if (phase === "discuss") {
    popup = {
      key: `discuss-${round}`,
      emoji: "🗳️",
      title: "토론·투표 시간!",
      body: "라이어로 의심되는 사람 칸을 눌러 투표하세요",
      autoCloseMs: 2500,
    };
  } else if (phase === "liarGuess") {
    popup = {
      key: `guess-${round}`,
      emoji: "🎯",
      tone: "bad",
      title: iGuess ? "들켰어요!" : `${accusedId ? nicknameOf(accusedId) : ""}님이 라이어였어요!`,
      body: iGuess ? "시민들의 제시어를 맞히면 역전승이에요" : "라이어가 제시어를 맞히는 중…",
      autoCloseMs: 2500,
    };
  } else if (phase === "result" && result) {
    const iWasLiar = result.liarId === myPlayerId;
    const iWon =
      result.winner !== "none" && (result.winner === "liar") === iWasLiar;
    const gain = result.gains[myPlayerId] ?? 0;
    popup = {
      key: `result-${round}`,
      emoji: result.winner === "liar" ? "🤥" : result.winner === "citizens" ? "🎉" : "🤷",
      tone: result.winner === "none" ? "neutral" : iWon ? "good" : "bad",
      title: result.winner === "liar" ? "라이어 승리!" : result.winner === "citizens" ? "시민 승리!" : "무효",
      body: (
        <>
          {REASON_TEXT[result.reason]}
          <PopupRows style={{ marginTop: 8 }}>
            <span>라이어</span>
            <span>{result.liarNickname}{iWasLiar ? " (나)" : ""}</span>
            <span>제시어</span>
            <span>{result.word}</span>
            <span>라이어 단어</span>
            <span>{result.liarWord}</span>
            {result.liarGuess !== null && (
              <>
                <span>라이어의 답</span>
                <span>{result.liarGuess}</span>
              </>
            )}
            <span>내 점수</span>
            <span>{gain > 0 ? `+${gain}점` : "0점"}</span>
          </PopupRows>
        </>
      ),
      countdown: { seconds: secondsLeft, label: isLast ? "뒤 최종 결과" : "뒤 다음 판" },
    };
  }

  // ── 입력 (설명 중에도 차례가 아닌 사람은 채팅할 수 있다) ──
  const placeholder = myTurn
    ? `설명 한 줄 (${LIAR_MAX_DESC_LENGTH}자)`
    : iGuess
        ? "제시어를 맞혀보세요"
        : phase === "discuss"
          ? "채팅으로 토론하세요"
          : "채팅";
  const inputBar = (
    <InputBar onSubmit={submit}>
      <TextInput
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholder}
        maxLength={myTurn || iGuess ? LIAR_MAX_DESC_LENGTH : 100}
        enterKeyHint="send"
        autoComplete="off"
      />
      <SendButton type="submit" disabled={!input.trim()} $highlight={myTurn || iGuess}>
        {myTurn ? "설명" : iGuess ? "정답" : "전송"}
      </SendButton>
    </InputBar>
  );

  const topBar = (
    <TopBar>
      <span>{inRound ? `${round}/${totalRounds}판 · ${phaseLabel[phase]}` : "🤥 라이어"}</span>
      {inRound && phase !== "result" && (
        <span>
          ⏳ <TimeText $urgent={urgent}>{secondsLeft}초</TimeText>
        </span>
      )}
    </TopBar>
  );

  const descBoard = inRound && (
    <LiarDescBoard
      phase={phase}
      descriptions={descriptions}
      speakOrder={speakOrder}
      speakerId={speakerId}
      lap={lap}
      laps={laps}
      myPlayerId={myPlayerId}
      nicknameOf={nicknameOf}
      colorOf={colorOf}
      open={descOpen}
      onToggle={toggleDesc}
    />
  );

  const logView = (maxVh?: number) => (
    <Log ref={logRef} $maxVh={maxVh}>
      {logs.map((l) => (
        <LogLine key={l.key} $tone={l.tone}>
          {l.nickname && <b style={{ color: l.color }}>{l.nickname} </b>}
          {l.text}
        </LogLine>
      ))}
    </Log>
  );

  // 휴대폰을 눕힌 화면: 세로로 쌓으면 높이가 모자라 입력칸이 화면 밖으로 밀려나 칠 수가 없었다.
  // 왼쪽(진행·제시어·참가자·안내, 넘치면 스크롤) / 오른쪽(설명판·채팅·입력)
  if (wide) {
    return (
      <WideWrap>
        <WideLeft>
          {topBar}
          {wordCard}
          {seatGrid}
          {stage}
        </WideLeft>
        <WideRight>
          {descBoard}
          {logView()}
          <ToastWrap>{toast && <Toast>{toast}</Toast>}</ToastWrap>
          {inputBar}
        </WideRight>
        <PhasePopup content={popup} />
      </WideWrap>
    );
  }

  return (
    <BoardWrap>
      {/* 작은 화면에서 결과 안내처럼 내용이 길어져도 입력칸이 밀려나지 않게, 입력칸 위는 넘치면 스크롤 */}
      <BoardBody>
        {topBar}
        {wordCard}
        {seatGrid}
        {stage}
        {descBoard}
        {logView(inRound ? (descOpen ? LOG_MAX_VH_OPEN : LOG_MAX_VH_FOLDED) : undefined)}
      </BoardBody>
      <ToastWrap>{toast && <Toast>{toast}</Toast>}</ToastWrap>
      {inputBar}
      <PhasePopup content={popup} />
    </BoardWrap>
  );
}
