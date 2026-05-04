import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { recordSingleGame } from "../../../utils/recordSingleGame";
import type { Cell, Difficulty, GamePhase, BestRecord } from "../../../components/single/minesweeper/types";
import { DIFFICULTIES } from "../../../components/single/minesweeper/constants";
import {
  createEmptyBoard,
  placeMines,
  revealCells,
  checkWin,
  revealAllMines,
  calcCellSize,
  loadBest,
  saveBest,
  formatTime,
} from "../../../components/single/minesweeper/utils";
import MinesweeperBoard from "../../../components/single/minesweeper/MinesweeperBoard";
import SetupModal from "../../../components/single/minesweeper/modal/SetupModal";
import ResultModal from "../../../components/single/minesweeper/modal/ResultModal";
import {
  PageWrapper,
  Header,
  HeaderLeft,
  BackButton,
  HeaderTitle,
  DifficultyBadge,
  GameBar,
  CounterBox,
  FaceButton,
  FlagButton,
  Main,
} from "../../../styles/single/minesweeper/layout";

export default function Minesweeper() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const config = useMemo(() => DIFFICULTIES[difficulty], [difficulty]);

  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard(9, 9));
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [seconds, setSeconds] = useState(0);
  const [best, setBest] = useState<BestRecord | null>(() => loadBest("easy"));

  const [flagMode, setFlagMode] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [faceEmoji, setFaceEmoji] = useState("😊");

  const [mainSize, setMainSize] = useState({ w: 400, h: 400 });
  const mainRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setMainSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const cellSize = useMemo(
    () => calcCellSize(mainSize.w - 32, mainSize.h - 32, config.rows, config.cols),
    [mainSize, config]
  );

  const handleStart = useCallback((diff: Difficulty) => {
    const cfg = DIFFICULTIES[diff];
    setDifficulty(diff);
    setBoard(createEmptyBoard(cfg.rows, cfg.cols));
    setPhase("ready");
    setSeconds(0);
    setIsWon(false);
    setShowResultModal(false);
    setFaceEmoji("😊");
    setBest(loadBest(diff));
    setShowSetupModal(false);
  }, []);

  const handleRestart = useCallback(() => {
    setBoard(createEmptyBoard(config.rows, config.cols));
    setPhase("ready");
    setSeconds(0);
    setIsWon(false);
    setShowResultModal(false);
    setFaceEmoji("😊");
    setFlagMode(false);
  }, [config]);

  const handleToggleFlag = useCallback((row: number, col: number) => {
    if (phase === "won" || phase === "lost") return;
    setBoard((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      const cell = next[row][col];
      if (cell.status === "hidden") cell.status = "flagged";
      else if (cell.status === "flagged") cell.status = "hidden";
      return next;
    });
  }, [phase]);

  const handleReveal = useCallback(
    (row: number, col: number) => {
      if (phase === "won" || phase === "lost") return;

      setBoard((prevBoard) => {
        let currentBoard = prevBoard;

        if (phase === "ready") {
          currentBoard = placeMines(prevBoard, config.rows, config.cols, config.mines, row, col);
          setPhase("playing");
        }

        const cell = currentBoard[row][col];

        if (cell.isMine) {
          const revealedBoard = revealAllMines(currentBoard, config.rows, config.cols, row, col);
          setPhase("lost");
          setFaceEmoji("😵");
          setIsWon(false);
          if (session?.access_token) {
            recordSingleGame(session.access_token, "minesweeper", false, secondsRef.current, { difficulty });
          }
          setTimeout(() => setShowResultModal(true), 800);
          return revealedBoard;
        }

        const revealedBoard = revealCells(currentBoard, config.rows, config.cols, row, col);

        if (checkWin(revealedBoard, config.rows, config.cols)) {
          setPhase("won");
          setFaceEmoji("😎");
          setIsWon(true);
          const elapsed = secondsRef.current;
          const prevBest = loadBest(difficulty);
          const newBest: BestRecord = { time: elapsed };
          if (!prevBest || elapsed < prevBest.time) {
            saveBest(difficulty, newBest);
            setBest(newBest);
          }
          if (session?.access_token) {
            recordSingleGame(session.access_token, "minesweeper", true, elapsed, { difficulty });
          }
          setTimeout(() => setShowResultModal(true), 500);
        }

        return revealedBoard;
      });
    },
    [phase, config, difficulty]
  );

  return (
    <PageWrapper>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate("/")}>←</BackButton>
          <HeaderTitle>지뢰찾기</HeaderTitle>
          <DifficultyBadge>{config.label}</DifficultyBadge>
        </HeaderLeft>
      </Header>

      <GameBar>
        <FlagButton
          $active={flagMode}
          onClick={() => setFlagMode((v) => !v)}
          title="깃발 모드"
        >
          🚩
        </FlagButton>
        <FaceButton onClick={handleRestart} title="다시하기">
          {faceEmoji}
        </FaceButton>
        <CounterBox>{formatTime(seconds)}</CounterBox>
      </GameBar>

      <Main ref={mainRef as RefObject<HTMLElement>}>
        <MinesweeperBoard
          board={board}
          rows={config.rows}
          cols={config.cols}
          cellSize={cellSize}
          phase={phase}
          flagMode={flagMode}
          onReveal={handleReveal}
          onToggleFlag={handleToggleFlag}
        />
      </Main>

      {showSetupModal && (
        <SetupModal initialDifficulty={difficulty} onStart={handleStart} />
      )}

      {showResultModal && (
        <ResultModal
          isWon={isWon}
          seconds={seconds}
          best={best}
          onRestart={handleRestart}
          onNewGame={() => {
            setShowResultModal(false);
            setShowSetupModal(true);
          }}
        />
      )}
    </PageWrapper>
  );
}
