import { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import GameHelpModal, {
  HelpSection,
  HelpText,
  PayTable as HelpPayTable,
  PayLabel,
  PayValue,
} from "./GameHelpModal";
import type { CoPlayer } from "../types";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface CasinoGameProps {
  balance: number;
  initialBalance: number;
  coPlayers: CoPlayer[];
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

type TileState = "hidden" | "safe" | "mine";
type Phase = "idle" | "playing" | "won" | "lost";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const MINES_MIN_RATIO = 0.01;
const MINES_MAX_RATIO = 0.1;

const GRID_SIZE = 25; // 5×5
const MINE_COUNT = 10;

const MULTIPLIER_TABLE: number[] = [
  1, 1, 1.5, 2.5, 5, 8, 12, 17, 25, 35, 50, 90, 150, 250, 500, 1000,
];

function calcMultiplier(revealed: number): number {
  if (revealed <= 0) return 1;
  if (revealed >= MULTIPLIER_TABLE.length)
    return MULTIPLIER_TABLE[MULTIPLIER_TABLE.length - 1];
  return MULTIPLIER_TABLE[revealed];
}

function placeMines(total: number, mineCount: number): Set<number> {
  const pool = Array.from({ length: total }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, mineCount));
}

// ─── 애니메이션 ───────────────────────────────────────────────────────────────

const popIn = keyframes`
  0%   { transform: scale(0.7); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-4px); }
  40%       { transform: translateX(4px); }
  60%       { transform: translateX(-3px); }
  80%       { transform: translateX(3px); }
`;

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #0d1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`;

const ScrollBody = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
`;

const BottomBar = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 500px;
  padding: 10px 20px 16px;
  box-sizing: border-box;
`;

const Header = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  color: #f0c040;
  font-size: 1.3rem;
  margin: 0;
  letter-spacing: 2px;
`;

const BalanceTag = styled.div`
  color: #f0c040;
  font-size: 1rem;
  font-weight: bold;
`;

const HelpBtn = styled.button`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  background: rgba(240, 192, 64, 0.15);
  border: 1px solid rgba(240, 192, 64, 0.4);
  border-radius: 50%;
  color: #f0c040;
  font-size: 0.85rem;
  font-weight: 700;
  width: 30px;
  height: 30px;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    background: rgba(240, 192, 64, 0.28);
  }
`;

const CloseButton = styled.button<{ $disabled?: boolean }>`
  background: #c0392b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const CoPlayersRow = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 20px 8px;
  box-sizing: border-box;
`;

const CoPlayerTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 0.75rem;
`;

const CoPlayerName = styled.span`
  color: #ddd;
`;

const CoPlayerProfit = styled.span<{ $positive: boolean; $negative: boolean }>`
  font-weight: 700;
  color: ${({ $positive, $negative }) => ($positive ? "#2ecc71" : $negative ? "#e74c3c" : "#888")};
`;

const MultiplierBar = styled.div`
  width: 100%;
  max-width: 480px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(240, 192, 64, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  margin-bottom: 12px;
  gap: 4px;
`;

const MultiplierLabel = styled.div`
  color: #ccc;
  font-size: 0.72rem;
  text-align: center;
`;

const MultiplierValue = styled.div`
  color: #f0c040;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
`;

const ReceivableValue = styled.div`
  color: #2ecc71;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
`;

const SafeCount = styled.div`
  color: #aaa;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
`;

const GRID_PX = 360;
const GRID_GAP = 6;
const TILE_PX = (GRID_PX - GRID_GAP * 4) / 5; // ≈ 67.2px

const GridWrapper = styled.div`
  width: ${GRID_PX}px;
  max-width: calc(100vw - 32px);
  flex-shrink: 0;
  margin-bottom: 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(5, ${TILE_PX}px);
  gap: ${GRID_GAP}px;
  width: 100%;
`;

const Tile = styled.button<{
  $state: TileState;
  $revealed: boolean;
  $isLoss?: boolean;
}>`
  height: ${TILE_PX}px;
  min-width: 0;
  width: 100%;
  border-radius: 8px;
  border: none;
  font-size: 1.4rem;
  cursor: ${({ $state }) => ($state === "hidden" ? "pointer" : "default")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    transform 0.1s;

  ${({ $state, $revealed }) => {
    if ($state === "hidden")
      return css`
        background: rgba(255, 255, 255, 0.12);
        border: 1.5px solid rgba(255, 255, 255, 0.2);
        &:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: scale(1.05);
        }
      `;
    if ($state === "safe")
      return css`
        background: rgba(46, 204, 113, 0.2);
        border: 1.5px solid rgba(46, 204, 113, 0.6);
        ${$revealed &&
        css`
          animation: ${popIn} 0.3s ease forwards;
        `}
      `;
    if ($state === "mine")
      return css`
        background: rgba(231, 76, 60, 0.25);
        border: 1.5px solid rgba(231, 76, 60, 0.7);
        ${$revealed &&
        css`
          animation: ${shake} 0.4s ease;
        `}
      `;
  }}
`;

const Section = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 0 4px;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  color: #f0c040;
  font-size: 0.8rem;
  margin-bottom: 6px;
  letter-spacing: 1px;
`;

const ActionBtn = styled.button<{ $variant: "primary" | "cashout" | "danger" }>`
  flex: 1;
  padding: 13px;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 1px;
  ${({ $variant }) => {
    if ($variant === "primary")
      return css`
        background: linear-gradient(135deg, #f0c040 0%, #e67e22 100%);
        color: #0d1a2e;
        &:disabled {
          background: #555;
          color: #999;
          cursor: not-allowed;
        }
      `;
    if ($variant === "cashout")
      return css`
        background: linear-gradient(135deg, #2ecc71 0%, #1a8a4a 100%);
        color: #fff;
        &:disabled {
          background: #555;
          color: #999;
          cursor: not-allowed;
        }
      `;
    return css`
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ccc;
    `;
  }}
`;

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function MinesGame({
  balance,
  initialBalance,
  coPlayers,
  onBet,
  onResult,
  onClose,
}: CasinoGameProps) {
  const minBet = r100(initialBalance * MINES_MIN_RATIO);
  const maxBet = r100(initialBalance * MINES_MAX_RATIO);

  const [phase, setPhase] = useState<Phase>("idle");
  const [betAmount, setBetAmount] = useState(() =>
    r100(initialBalance * MINES_MIN_RATIO),
  );
  const [tiles, setTiles] = useState<TileState[]>(
    new Array(GRID_SIZE).fill("hidden"),
  );
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [newlyRevealed, setNewlyRevealed] = useState<number | null>(null);

  const currentMultiplier = calcMultiplier(revealed);
  const safeTiles = GRID_SIZE - MINE_COUNT;

  const handleStart = useCallback(() => {
    if (balance < betAmount) return;
    onBet(betAmount);
    setTiles(new Array(GRID_SIZE).fill("hidden"));
    setMines(placeMines(GRID_SIZE, MINE_COUNT));
    setRevealed(0);
    setNewlyRevealed(null);
    setPhase("playing");
  }, [balance, betAmount, onBet]);

  const handleTileClick = useCallback(
    (idx: number) => {
      if (phase !== "playing" || tiles[idx] !== "hidden") return;

      if (mines.has(idx)) {
        // Hit a mine — reveal all mines
        const newTiles = tiles.map((t, i) => {
          if (i === idx) return "mine";
          if (mines.has(i)) return "mine";
          return t;
        }) as TileState[];
        setTiles(newTiles);
        setNewlyRevealed(idx);
        setPhase("lost");
        onResult(0);
      } else {
        const nextRevealed = revealed + 1;
        const newTiles = [...tiles] as TileState[];
        newTiles[idx] = "safe";
        setTiles(newTiles);
        setRevealed(nextRevealed);
        setNewlyRevealed(idx);

        // Auto cash out if all safe tiles revealed
        if (nextRevealed >= safeTiles) {
          const mult = calcMultiplier(nextRevealed);
          const delta = Math.round(betAmount * mult);
          setPhase("won");
          onResult(delta);
        }
      }
    },
    [phase, tiles, mines, revealed, safeTiles, betAmount, onResult],
  );

  const handleCashOut = useCallback(() => {
    if (phase !== "playing" || revealed === 0) return;
    const mult = currentMultiplier;
    const delta = Math.round(betAmount * mult);
    setPhase("won");
    onResult(delta);
  }, [phase, revealed, currentMultiplier, betAmount, onResult]);

  const handleReset = () => {
    setPhase("idle");
    setTiles(new Array(GRID_SIZE).fill("hidden"));
    setMines(new Set());
    setRevealed(0);
    setNewlyRevealed(null);
  };

  const previewMults = [1, 2, 3, 5, 8, 10, 15, 20].map((k) => ({
    safe: k,
    mult: calcMultiplier(k),
  }));

  return (
    <Overlay>
      <GameHelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="💣지뢰찾기 도움말"
      >
        <HelpSection title="게임 방법">
          <HelpText>
            {
              "베팅금을 설정하고 START를 누르세요.\n25칸 중 5개의 지뢰가 숨어 있습니다.\n타일을 클릭해 지뢰를 피할수록 배수가 올라갑니다.\n언제든지 캐시아웃으로 현재 금액을 수령할 수 있습니다."
            }
          </HelpText>
        </HelpSection>
        <HelpSection title="배당표 (지뢰 5개 / 25칸)">
          <HelpPayTable>
            {previewMults.map(({ safe, mult }) => (
              <>
                <PayLabel key={`l${safe}`}>안전 {safe}개 클릭</PayLabel>
                <PayValue key={`v${safe}`}>×{mult.toFixed(2)}</PayValue>
              </>
            ))}
          </HelpPayTable>
        </HelpSection>
        <HelpSection title="팁">
          <HelpText>
            {
              "지뢰를 밟으면 베팅금 전액 손실입니다.\n적절한 타이밍에 캐시아웃하는 것이 핵심입니다!"
            }
          </HelpText>
        </HelpSection>
      </GameHelpModal>

      <Header>
        <Title>💣지뢰찾기</Title>
        <BalanceTag>💰 {balance.toLocaleString()}원</BalanceTag>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseButton
          $disabled={phase === "playing"}
          onClick={phase === "playing" ? undefined : onClose}
        >
          닫기
        </CloseButton>
      </Header>

      {coPlayers.length > 0 && (
        <CoPlayersRow>
          {coPlayers.map((p) => (
            <CoPlayerTag key={p.nickname}>
              <CoPlayerName>{p.nickname}</CoPlayerName>
              <CoPlayerProfit $positive={p.profit > 0} $negative={p.profit < 0}>
                {p.profit > 0 ? `+${p.profit.toLocaleString()}` : p.profit.toLocaleString()}
              </CoPlayerProfit>
            </CoPlayerTag>
          ))}
        </CoPlayersRow>
      )}

      <ScrollBody>
        {/* 배수 / 수령금 / 안전 개수 표시 */}
        <MultiplierBar>
          <div>
            <MultiplierLabel>현재 배수</MultiplierLabel>
            <MultiplierValue>×{currentMultiplier.toFixed(2)}</MultiplierValue>
          </div>
          <div>
            <MultiplierLabel>수령 금액</MultiplierLabel>
            <ReceivableValue>
              {phase === "playing" && revealed > 0
                ? Math.round(betAmount * currentMultiplier).toLocaleString()
                : phase === "idle"
                  ? "-"
                  : Math.round(betAmount * currentMultiplier).toLocaleString()}
              원
            </ReceivableValue>
          </div>
          <div>
            <MultiplierLabel>안전 클릭</MultiplierLabel>
            <SafeCount>
              ✅ {revealed} / {safeTiles}
            </SafeCount>
          </div>
        </MultiplierBar>

        {/* 그리드 */}
        <GridWrapper>
          <Grid>
            {tiles.map((tileState, idx) => {
              const isMineRevealed = phase === "won" && tileState === "hidden" && mines.has(idx);
              return (
                <Tile
                  key={idx}
                  $state={isMineRevealed ? "mine" : tileState}
                  $revealed={idx === newlyRevealed}
                  $isLoss={phase === "lost"}
                  onClick={() => handleTileClick(idx)}
                  disabled={phase !== "playing" || tileState !== "hidden"}
                >
                  {tileState === "safe" && "✅"}
                  {(tileState === "mine" || isMineRevealed) && "💣"}
                </Tile>
              );
            })}
          </Grid>
        </GridWrapper>

        {phase === "idle" && (
          <Section>
            <SectionLabel>베팅금 설정</SectionLabel>
            <BetControls
              value={betAmount}
              onChange={setBetAmount}
              minBet={minBet}
              maxBet={maxBet}
              balance={balance}
            />
          </Section>
        )}
      </ScrollBody>

      <BottomBar>
        {phase === "idle" && (
          <ActionBtn
            $variant="primary"
            onClick={handleStart}
            disabled={balance < betAmount}
            style={{ width: "100%" }}
          >
            START
          </ActionBtn>
        )}
        {phase === "playing" && (
          <ActionBtn
            $variant="cashout"
            onClick={handleCashOut}
            disabled={revealed === 0}
            style={{ width: "100%" }}
          >
            STOP{" "}
            {revealed > 0
              ? `— ${Math.round(betAmount * currentMultiplier).toLocaleString()}원 수령`
              : ""}
          </ActionBtn>
        )}
        {(phase === "won" || phase === "lost") && (
          <ActionBtn
            $variant="primary"
            onClick={handleReset}
            style={{ width: "100%" }}
          >
            다시 하기
          </ActionBtn>
        )}
      </BottomBar>
    </Overlay>
  );
}
