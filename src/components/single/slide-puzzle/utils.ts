import type { GridSize, BestRecord, DefaultImage } from "./types";

// ─── 보드 상수 ────────────────────────────────────────────────
export const COLS = (size: GridSize) => size;     // 열 수 = N
export const ROWS = (size: GridSize) => size + 1; // 행 수 = N+1

export const GAP = 1;
export const PAD = 8;

// ─── localStorage ────────────────────────────────────────────
export const STORAGE_KEY = (size: GridSize) => `slide-puzzle-best-${size}`;

export function loadBest(size: GridSize): BestRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(size));
    return raw ? (JSON.parse(raw) as BestRecord) : null;
  } catch {
    return null;
  }
}

export function saveBest(size: GridSize, record: BestRecord) {
  localStorage.setItem(STORAGE_KEY(size), JSON.stringify(record));
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

// ─── 타일 크기 계산 ────────────────────────────────────────────
// containerW/H: Main 요소의 content 영역 크기 (padding 제외)
// tileW·tileH 를 각각 독립 계산 → 직사각형 타일 허용
export function calcTileDims(
  containerW: number,
  containerH: number,
  size: GridSize,
): { tileW: number; tileH: number } {
  const cols = COLS(size);
  const rows = ROWS(size);
  const tileW = Math.max(1, Math.floor((containerW - PAD * 2 - GAP * (cols - 1)) / cols));
  const tileH = Math.max(1, Math.floor((containerH - PAD * 2 - GAP * (rows - 1)) / rows));
  return { tileW, tileH };
}

export function calcBoardSize(tileW: number, tileH: number, size: GridSize) {
  const cols = COLS(size);
  const rows = ROWS(size);
  return {
    w: PAD * 2 + cols * tileW + GAP * (cols - 1),
    h: PAD * 2 + rows * tileH + GAP * (rows - 1),
  };
}

// ─── 퍼즐 로직 ────────────────────────────────────────────────
export function makeGoalBoard(size: GridSize): number[] {
  const board: number[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      board.push(r * size + c + 1);
    }
  }
  for (let c = 0; c < size; c++) {
    board.push(c === 0 ? 0 : -1);
  }
  return board;
}

export function shuffleBoard(size: GridSize): number[] {
  const cols = COLS(size);
  const rows = ROWS(size);
  const board = makeGoalBoard(size);
  let emptyIdx = board.indexOf(0);
  let prevIdx = -1;
  const numMoves = size * size * 300;

  for (let i = 0; i < numMoves; i++) {
    const er = Math.floor(emptyIdx / cols);
    const ec = emptyIdx % cols;
    const neighbors: number[] = [];

    if (er > 0) {
      const ni = (er - 1) * cols + ec;
      if (board[ni] !== -1 && ni !== prevIdx) neighbors.push(ni);
    }
    if (er < rows - 1) {
      const ni = (er + 1) * cols + ec;
      if (board[ni] !== -1 && ni !== prevIdx) neighbors.push(ni);
    }
    if (ec > 0) {
      const ni = er * cols + (ec - 1);
      if (board[ni] !== -1 && ni !== prevIdx) neighbors.push(ni);
    }
    if (ec < cols - 1) {
      const ni = er * cols + (ec + 1);
      if (board[ni] !== -1 && ni !== prevIdx) neighbors.push(ni);
    }

    if (neighbors.length === 0) continue;
    const ni = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[emptyIdx], board[ni]] = [board[ni], board[emptyIdx]];
    prevIdx = emptyIdx;
    emptyIdx = ni;
  }

  return board;
}

export function isSolved(board: number[], size: GridSize): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r * size + c] !== r * size + c + 1) return false;
    }
  }
  return true;
}

export function slideTiles(
  board: number[],
  clickedIdx: number,
  size: GridSize
): number[] | null {
  const cols = COLS(size);
  const emptyIdx = board.indexOf(0);
  if (emptyIdx < 0) return null;

  const er = Math.floor(emptyIdx / cols);
  const ec = emptyIdx % cols;
  const tr = Math.floor(clickedIdx / cols);
  const tc = clickedIdx % cols;

  if (board[clickedIdx] === -1 || board[clickedIdx] === 0) return null;

  const next = [...board];

  if (er === tr) {
    const step = ec < tc ? 1 : -1;
    for (let c = ec + step; c !== tc + step; c += step) {
      if (next[er * cols + c] === -1) return null;
    }
    for (let c = ec; c !== tc; c += step) {
      next[er * cols + c] = next[er * cols + c + step];
    }
    next[tr * cols + tc] = 0;
    return next;
  }

  if (ec === tc) {
    const step = er < tr ? 1 : -1;
    for (let r = er + step; r !== tr + step; r += step) {
      if (next[r * cols + ec] === -1) return null;
    }
    for (let r = er; r !== tr; r += step) {
      next[r * cols + ec] = next[(r + step) * cols + ec];
    }
    next[tr * cols + tc] = 0;
    return next;
  }

  return null;
}

// ─── 기본 이미지 생성 (canvas, 결정론적) ──────────────────────
export function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0xffffffff;
  };
}

export function buildDefaultImages(): DefaultImage[] {
  const S = 400;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  const images: DefaultImage[] = [];

  // 1. 노을
  {
    ctx.clearRect(0, 0, S, S);
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, "#ff416c");
    g.addColorStop(0.45, "#ff4b2b");
    g.addColorStop(0.75, "#f7971e");
    g.addColorStop(1, "#ffd200");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    const sun = ctx.createRadialGradient(280, 110, 0, 280, 110, 90);
    sun.addColorStop(0, "rgba(255,255,180,0.95)");
    sun.addColorStop(0.5, "rgba(255,220,80,0.5)");
    sun.addColorStop(1, "rgba(255,140,30,0)");
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(280, 110, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 270, S, 3);
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.fillRect(0, 273, S, S - 273);
    images.push({ label: "노을", url: canvas.toDataURL() });
  }

  // 2. 밤하늘
  {
    ctx.clearRect(0, 0, S, S);
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, "#0b0b1e");
    g.addColorStop(0.6, "#141432");
    g.addColorStop(1, "#0a1f3a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    const rand = seededRand(7);
    for (let i = 0; i < 90; i++) {
      const x = rand() * S;
      const y = rand() * S;
      const r = rand() * 1.4 + 0.4;
      const a = rand() * 0.55 + 0.45;
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(245,242,200,0.92)";
    ctx.beginPath();
    ctx.arc(310, 75, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#141432";
    ctx.beginPath();
    ctx.arc(326, 67, 32, 0, Math.PI * 2);
    ctx.fill();
    images.push({ label: "밤하늘", url: canvas.toDataURL() });
  }

  // 3. 오로라
  {
    ctx.clearRect(0, 0, S, S);
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, "#08081a");
    g.addColorStop(0.4, "#0a2218");
    g.addColorStop(0.8, "#120a28");
    g.addColorStop(1, "#0a1820");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    const rand2 = seededRand(13);
    for (let i = 0; i < 50; i++) {
      const x = rand2() * S;
      const y = rand2() * S * 0.6;
      const a = rand2() * 0.4 + 0.2;
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x, y, rand2() + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    const waves: [string, number, number, number, number, number, number][] = [
      ["rgba(0,255,140,0.22)", 160, 40, 80, 200, 280, 100],
      ["rgba(60,180,255,0.18)", 120, 80, 60, 240, 310, 130],
      ["rgba(180,80,255,0.16)", 200, 60, 100, 160, 260, 80],
    ];
    waves.forEach(([color, y1, y2, y3, cx1, cx2, cy]) => {
      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.bezierCurveTo(cx1, cy, cx2, y2, S, y3);
      ctx.lineTo(S, 0);
      ctx.lineTo(0, 0);
      ctx.fillStyle = color;
      ctx.fill();
    });
    images.push({ label: "오로라", url: canvas.toDataURL() });
  }

  // 4. 바다
  {
    ctx.clearRect(0, 0, S, S);
    const sky = ctx.createLinearGradient(0, 0, 0, S * 0.52);
    sky.addColorStop(0, "#87ceeb");
    sky.addColorStop(1, "#c8eeff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, S, S * 0.52);
    const sea = ctx.createLinearGradient(0, S * 0.52, 0, S);
    sea.addColorStop(0, "#1a78b8");
    sea.addColorStop(1, "#0a3060");
    ctx.fillStyle = sea;
    ctx.fillRect(0, S * 0.52, S, S * 0.48);
    ctx.fillStyle = "rgba(255,255,210,0.95)";
    ctx.beginPath();
    ctx.arc(200, 95, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    for (let i = 0; i < 4; i++) {
      const y = S * 0.52 + i * 22 + 8;
      ctx.beginPath();
      ctx.ellipse(200 + i * 10, y, 60 - i * 8, 3, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, S * 0.52);
    ctx.lineTo(S, S * 0.52);
    ctx.stroke();
    images.push({ label: "바다", url: canvas.toDataURL() });
  }

  return images;
}

export const DEFAULT_IMAGES: DefaultImage[] = buildDefaultImages();
