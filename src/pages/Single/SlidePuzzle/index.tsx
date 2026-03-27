import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageWrapper,
  Header,
  HeaderLeft,
  BackButton,
  HeaderTitle,
  HeaderStats,
  StatItem,
  PauseButton,
  Main,
} from "../../../styles/single/slide-puzzle/layout";
import type { GridSize, TileShape, BestRecord } from "../../../components/single/slide-puzzle/types";
import {
  shuffleBoard,
  makeGoalBoard,
  isSolved,
  slideTiles,
  calcTileDims,
  calcBoardSize,
  loadBest,
  saveBest,
  formatTime,
  DEFAULT_IMAGES,
} from "../../../components/single/slide-puzzle/utils";
import SlidePuzzleBoard from "../../../components/single/slide-puzzle/SlidePuzzleBoard";
import SlidePuzzleSubBar from "../../../components/single/slide-puzzle/SlidePuzzleSubBar";
import SetupModal from "../../../components/single/slide-puzzle/modal/SetupModal";
import ClearModal from "../../../components/single/slide-puzzle/modal/ClearModal";
import CropModal from "../../../components/single/slide-puzzle/modal/CropModal";

export default function SlidePuzzle() {
  const navigate = useNavigate();

  const [size, setSize] = useState<GridSize>(4);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);

  const [board, setBoard] = useState<number[]>(() => shuffleBoard(4));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [best, setBest] = useState<BestRecord | null>(() => loadBest(4));

  const [paused, setPaused] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [setupSnapshot, setSetupSnapshot] = useState<{
    size: GridSize;
    selectedIdx: number;
    customImageUrl: string | null;
    tileShape: TileShape;
  } | null>(null);

  const [showNumbers, setShowNumbers] = useState(false);
  const [tileShape, setTileShape] = useState<TileShape>("fit");
  const [boardBg, setBoardBg] = useState("#161616");
  const [bgTab, setBgTab] = useState(0);
  const [mainSize, setMainSize] = useState({ w: window.innerWidth, h: window.innerHeight - 200 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Main 요소 크기 측정 (ResizeObserver)
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

  const currentImage = useMemo(() => {
    if (selectedIdx === -1 && customImageUrl) return customImageUrl;
    return DEFAULT_IMAGES[selectedIdx]?.url ?? DEFAULT_IMAGES[0].url;
  }, [selectedIdx, customImageUrl]);

  // 타이머 (running && !paused 일 때만 동작)
  useEffect(() => {
    if (running && !paused) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, paused]);

  const handleRestart = useCallback(() => {
    setBoard(makeGoalBoard(size));
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setCleared(false);
    setPaused(false);
    setIsPreview(true);
  }, [size]);

  const handleStartGame = useCallback(() => {
    setBoard(shuffleBoard(size));
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setCleared(false);
    setPaused(false);
    setIsPreview(false);
  }, [size]);

  const handleNewGame = useCallback(() => {
    setSetupSnapshot({ size, selectedIdx, customImageUrl, tileShape });
    setShowSetupModal(true);
  }, [size, selectedIdx, customImageUrl, tileShape]);

  const handleCancelSetup = useCallback(() => {
    if (setupSnapshot) {
      setSize(setupSnapshot.size);
      setSelectedIdx(setupSnapshot.selectedIdx);
      setCustomImageUrl(setupSnapshot.customImageUrl);
      setTileShape(setupSnapshot.tileShape);
    }
    setShowSetupModal(false);
  }, [setupSnapshot]);

  const handleConfirmSetup = useCallback(() => {
    setBoard(makeGoalBoard(size));
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setCleared(false);
    setBest(loadBest(size));
    setIsPreview(true);
    setSetupSnapshot(null);
    setShowSetupModal(false);
  }, [size]);

  const handleSizeChange = (s: GridSize) => {
    setSize(s);
    setBest(loadBest(s));
  };

  const handleSelectImage = (idx: number) => {
    setSelectedIdx(idx);
    setCustomImageUrl(null);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setShowSetupModal(false); // SetupModal 닫기
      setCropImageUrl(url);     // CropModal 열기
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = (croppedUrl: string) => {
    setCustomImageUrl(croppedUrl);
    setSelectedIdx(-1);
    setCropImageUrl(null);
    setShowSetupModal(true); // SetupModal 다시 열기
  };

  const handleCropCancel = () => {
    setCropImageUrl(null);
    setShowSetupModal(true); // SetupModal 다시 열기
  };

  const handleTileClick = (idx: number) => {
    if (cleared || isPreview || paused) return;
    const next = slideTiles(board, idx, size);
    if (!next) return;

    if (!running) {
      setRunning(true);
    }
    const newMoves = moves + 1;
    setBoard(next);
    setMoves(newMoves);

    if (isSolved(next, size)) {
      setRunning(false);
      setCleared(true);
      const prev = loadBest(size);
      const newBest: BestRecord = {
        time: !prev || seconds < prev.time ? seconds : prev.time,
        moves: !prev || newMoves < prev.moves ? newMoves : prev.moves,
      };
      saveBest(size, newBest);
      setBest(newBest);
    }
  };

  const { tileW, tileH } = useMemo(
    () => calcTileDims(mainSize.w, mainSize.h, size, tileShape),
    [mainSize, size, tileShape]
  );
  const boardSize = useMemo(() => calcBoardSize(tileW, tileH, size), [tileW, tileH, size]);
  const aspectRatio = useMemo(() => (tileH > 0 ? tileW / tileH : 1), [tileW, tileH]);

  return (
    <PageWrapper>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* ── 헤더 */}
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate("/")}>←</BackButton>
          <HeaderTitle>슬라이드 퍼즐</HeaderTitle>
        </HeaderLeft>
        <HeaderStats>
          {!isPreview && !cleared && (
            <PauseButton
              $paused={paused}
              onClick={() => setPaused((v) => !v)}
              title={paused ? "계속하기" : "일시정지"}
            >
              {paused ? "▶" : "⏸"}
            </PauseButton>
          )}
          <StatItem>
            <span className="label">시간</span>
            <span className="value">{formatTime(seconds)}</span>
          </StatItem>
          <StatItem>
            <span className="label">이동</span>
            <span className="value">{moves}</span>
          </StatItem>
        </HeaderStats>
      </Header>

      {/* ── 서브 바 */}
      <SlidePuzzleSubBar
        currentImage={currentImage}
        isPreview={isPreview}
        boardBg={boardBg}
        bgTab={bgTab}
        showNumbers={showNumbers}
        onRestart={handleRestart}
        onNewGame={handleNewGame}
        onStartGame={handleStartGame}
        onBgChange={setBoardBg}
        onBgTabChange={setBgTab}
        onToggleNumbers={() => setShowNumbers((v) => !v)}
      />

      {/* ── 메인 */}
      <Main ref={mainRef as RefObject<HTMLElement>}>
        <SlidePuzzleBoard
          board={board}
          size={size}
          tileW={tileW}
          tileH={tileH}
          boardSize={boardSize}
          boardBg={boardBg}
          best={best}
          currentImage={currentImage}
          showNumbers={showNumbers}
          onTileClick={handleTileClick}
        />
      </Main>

      {/* ── 크롭 모달 */}
      {cropImageUrl && (
        <CropModal
          imageUrl={cropImageUrl}
          aspectRatio={aspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* ── 설정 모달 */}
      {showSetupModal && (
        <SetupModal
          size={size}
          selectedIdx={selectedIdx}
          customImageUrl={customImageUrl}
          hasSnapshot={!!setupSnapshot}
          tileShape={tileShape}
          onSizeChange={handleSizeChange}
          onSelectImage={handleSelectImage}
          onUploadClick={handleUploadClick}
          onTileShapeChange={setTileShape}
          onConfirm={handleConfirmSetup}
          onCancel={handleCancelSetup}
        />
      )}

      {/* ── 클리어 모달 */}
      {cleared && (
        <ClearModal
          seconds={seconds}
          moves={moves}
          onClose={() => setCleared(false)}
          onRestart={handleRestart}
        />
      )}
    </PageWrapper>
  );
}
