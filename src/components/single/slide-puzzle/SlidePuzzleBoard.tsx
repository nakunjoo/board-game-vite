import { Board, BoardWrapper, Tile, TileNumber, WallRecord, WallRecordItem } from "../../../styles/single/slide-puzzle/board";
import { COLS, PAD, GAP } from "./utils";
import type { GridSize, BestRecord } from "./types";

interface Props {
  board: number[];
  size: GridSize;
  tileW: number;
  tileH: number;
  boardSize: { w: number; h: number };
  boardBg: string;
  currentImage: string;
  showNumbers: boolean;
  best: BestRecord | null;
  onTileClick: (idx: number) => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function SlidePuzzleBoard({
  board,
  size,
  tileW,
  tileH,
  boardSize,
  boardBg,
  currentImage,
  showNumbers,
  best,
  onTileClick,
}: Props) {
  // 막힘 영역 위치: 맨 아래 행, 1번 열부터 (0번은 빈칸)
  const wallRowY = PAD + size * (tileH + GAP);
  const wallStartX = PAD + 1 * (tileW + GAP);
  const wallAreaW = (size - 1) * tileW + (size - 2) * GAP;
  const fontSize = Math.max(11, Math.min(tileH * 0.55, 18));
  return (
    <BoardWrapper>
      <Board $w={boardSize.w} $h={boardSize.h} $bg={boardBg}>
        {/* 막힘 영역 이전 기록 */}
        {best && size > 1 && (
          <WallRecord $x={wallStartX} $y={wallRowY} $w={wallAreaW} $h={tileH}
            style={{ fontSize }}>
            <WallRecordItem>
              <span className="label">최고 시간</span>
              <span className="value">{formatTime(best.time)}</span>
            </WallRecordItem>
            <WallRecordItem>
              <span className="label">최소 이동</span>
              <span className="value">{best.moves}</span>
            </WallRecordItem>
          </WallRecord>
        )}
        {board.map((cell, idx) => {
          const numCols = COLS(size);
          const row = Math.floor(idx / numCols);
          const col = idx % numCols;
          const isWallCell = cell === -1;
          const isEmpty = cell === 0;
          const isCorrect =
            !isWallCell && !isEmpty && row < size && cell === row * size + col + 1;

          const tileLeft = PAD + col * (tileW + GAP);
          const tileTop  = PAD + row * (tileH + GAP);

          const origRow = Math.floor((cell - 1) / size);
          const origCol = (cell - 1) % size;

          return (
            <Tile
              key={isWallCell ? `w${idx}` : isEmpty ? "empty" : `t${cell}`}
              $empty={isEmpty}
              $wall={isWallCell}
              $correct={isCorrect}
              disabled={isWallCell || isEmpty}
              onClick={() => onTileClick(idx)}
              style={{
                width: tileW,
                height: tileH,
                top: tileTop,
                left: tileLeft,
                ...(!isWallCell && !isEmpty
                  ? {
                      backgroundImage: `url(${currentImage})`,
                      backgroundSize: `${tileW * size}px ${tileH * size}px`,
                      backgroundPosition: `-${origCol * tileW}px -${origRow * tileH}px`,
                    }
                  : {}),
              }}
            >
              {showNumbers && !isWallCell && !isEmpty && (
                <TileNumber style={{ fontSize: Math.max(9, Math.floor(Math.min(tileW, tileH) * 0.18)) }}>
                  {cell}
                </TileNumber>
              )}
            </Tile>
          );
        })}
      </Board>
    </BoardWrapper>
  );
}
