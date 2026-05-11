import { useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import GameHelpModal, { HelpSection, HelpText, PayTable, PayLabel, PayValue } from "./GameHelpModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CasinoGameProps {
  balance: number;
  initialBalance: number;
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const BACCARAT_MIN_RATIO = 0.01;
const BACCARAT_MAX_RATIO = 0.10;

type BetTarget = "player" | "banker" | "tie";

interface Card {
  suit: string;
  value: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

function randomCard(): Card {
  return {
    suit: SUITS[Math.floor(Math.random() * 4)],
    value: VALUES[Math.floor(Math.random() * 13)],
  };
}

function cardPoint(card: Card): number {
  if (["10", "J", "Q", "K"].includes(card.value)) return 0;
  if (card.value === "A") return 1;
  return parseInt(card.value, 10);
}

function handTotal(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + cardPoint(c), 0) % 10;
}

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

// ─── Baccarat third-card rules ────────────────────────────────────────────────

function dealRound(playerCards: Card[], bankerCards: Card[]): {
  playerFinal: Card[];
  bankerFinal: Card[];
} {
  const playerTotal = handTotal(playerCards);
  let pFinal = [...playerCards];
  let bFinal = [...bankerCards];

  // Natural check (handled before calling this function)
  // Player draws
  let playerDrew = false;
  if (playerTotal <= 5) {
    pFinal.push(randomCard());
    playerDrew = true;
  }

  // Banker draws
  if (playerDrew) {
    const bankerCurrent = handTotal(bFinal);
    const playerThirdPoint = cardPoint(pFinal[2]);
    // Simplified banker rule: draw if banker ≤ 5, else simplified table
    if (bankerCurrent <= 2) {
      bFinal.push(randomCard());
    } else if (bankerCurrent === 3 && playerThirdPoint !== 8) {
      bFinal.push(randomCard());
    } else if (bankerCurrent === 4 && [2,3,4,5,6,7].includes(playerThirdPoint)) {
      bFinal.push(randomCard());
    } else if (bankerCurrent === 5 && [4,5,6,7].includes(playerThirdPoint)) {
      bFinal.push(randomCard());
    } else if (bankerCurrent === 6 && [6,7].includes(playerThirdPoint)) {
      bFinal.push(randomCard());
    }
  } else {
    // No player draw
    if (handTotal(bFinal) <= 5) {
      bFinal.push(randomCard());
    }
  }

  return { playerFinal: pFinal, bankerFinal: bFinal };
}

// ─── Animations ───────────────────────────────────────────────────────────────

const dealAnim = keyframes`
  from { opacity: 0; transform: translateY(-60px) scale(0.7); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const winGlow = keyframes`
  0%, 100% { box-shadow: 0 0 8px 2px rgba(240,192,64,0.5); }
  50%       { box-shadow: 0 0 18px 6px rgba(240,192,64,0.9); }
`;

const flipAnim = keyframes`
  0%   { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #0d5c2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
`;

const Header = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
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
  &:hover { background: rgba(240, 192, 64, 0.28); }
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

const TableArea = styled.div`
  width: 100%;
  max-width: 500px;
  background: #155a30;
  border: 2px solid #f0c040;
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 16px;
`;

const HandRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const HandLabel = styled.div<{ $winner: boolean }>`
  font-size: 0.85rem;
  color: ${({ $winner }) => ($winner ? "#f0c040" : "#aaa")};
  font-weight: ${({ $winner }) => ($winner ? "bold" : "normal")};
  min-width: 60px;
  padding-top: 4px;
`;

const Cards = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
`;

const CardEl = styled.div<{ $dealt: boolean; $red: boolean; $delay: number; $isBack: boolean }>`
  width: 48px;
  height: 68px;
  border-radius: 6px;
  border: 1.5px solid #aaa;
  background: ${({ $isBack }) => ($isBack ? "#1a4a8a" : "#fff")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: ${({ $isBack }) => ($isBack ? "1.4rem" : "1rem")};
  font-weight: bold;
  color: ${({ $red, $isBack }) => ($isBack ? "#fff" : ($red ? "#c0392b" : "#111"))};
  flex-shrink: 0;
  ${({ $dealt, $delay }) =>
    $dealt
      ? css`animation: ${dealAnim} 0.35s ease ${$delay}s both, ${flipAnim} 0.3s ease ${$delay + 0.1}s both;`
      : ""}
`;

const ScoreBadge = styled.div<{ $winner: boolean }>`
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $winner }) => ($winner ? "#f0c040" : "#333")};
  color: ${({ $winner }) => ($winner ? "#0d5c2e" : "#fff")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  margin-left: 8px;
  margin-top: 4px;
  ${({ $winner }) => $winner && css`animation: ${winGlow} 0.8s ease infinite;`}
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(240,192,64,0.3);
  margin: 8px 0 14px;
`;

const ResultBanner = styled.div<{ $win: boolean }>`
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: ${({ $win }) => ($win ? "#f0c040" : "#e74c3c")};
  min-height: 26px;
`;

const Section = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 0 4px;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  color: #f0c040;
  font-size: 0.8rem;
  margin-bottom: 6px;
  letter-spacing: 1px;
`;

const BetTargetRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
`;

const BetTargetBtn = styled.button<{ $active: boolean; $color: string }>`
  padding: 12px 4px;
  border-radius: 10px;
  border: 2px solid ${({ $active }) => ($active ? "#f0c040" : "transparent")};
  background: ${({ $color }) => $color};
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover { border-color: #f0c040; }
`;

const DealButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ $disabled }) => ($disabled ? "#555" : "linear-gradient(135deg, #f0c040 0%, #e67e22 100%)")};
  color: ${({ $disabled }) => ($disabled ? "#999" : "#0d5c2e")};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  letter-spacing: 3px;
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  text-align: center;
  color: #ccc;
  font-size: 0.85rem;
  margin-bottom: 8px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

type Phase = "idle" | "dealing" | "done";

export default function BaccaratGame({ balance, initialBalance, onBet, onResult, onClose }: CasinoGameProps) {
  const minBet = r100(initialBalance * BACCARAT_MIN_RATIO);
  const maxBet = r100(initialBalance * BACCARAT_MAX_RATIO);
  const [showHelp, setShowHelp] = useState(false);
  const [betTarget, setBetTarget] = useState<BetTarget | null>(null);
  const [chipAmount, setChipAmount] = useState(() => r100(initialBalance * BACCARAT_MIN_RATIO));
  const [phase, setPhase] = useState<Phase>("idle");
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [, setDealtCount] = useState(0);
  const [winner, setWinner] = useState<"player" | "banker" | "tie" | null>(null);
  const [resultText, setResultText] = useState("");
  const [isWin, setIsWin] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  const handleDeal = () => {
    if (!betTarget || phase !== "idle" || balance < chipAmount) return;
    onBet(chipAmount);
    setPhase("dealing");
    setWinner(null);
    setResultText("");
    setDealtCount(0);
    setPlayerCards([]);
    setBankerCards([]);
    clearTimers();

    // Initial 4 cards: P1 B1 P2 B2
    const p1 = randomCard();
    const b1 = randomCard();
    const p2 = randomCard();
    const b2 = randomCard();
    const initialPlayer = [p1, p2];
    const initialBanker = [b1, b2];

    const isNatural = handTotal(initialPlayer) >= 8 || handTotal(initialBanker) >= 8;

    // Deal cards one by one with 400ms intervals
    addTimer(() => { setPlayerCards([p1]); setDealtCount(1); }, 300);
    addTimer(() => { setBankerCards([b1]); setDealtCount(2); }, 700);
    addTimer(() => { setPlayerCards([p1, p2]); setDealtCount(3); }, 1100);
    addTimer(() => { setBankerCards([b1, b2]); setDealtCount(4); }, 1500);

    if (isNatural) {
      // Show natural result
      addTimer(() => {
        finalizeResult(initialPlayer, initialBanker, betTarget);
      }, 2000);
    } else {
      // Third cards
      const { playerFinal, bankerFinal } = dealRound(initialPlayer, initialBanker);
      const p3 = playerFinal[2];
      const b3 = bankerFinal[2];
      let delay = 1800;

      if (p3) {
        addTimer(() => { setPlayerCards([p1, p2, p3]); setDealtCount(5); }, delay);
        delay += 500;
      }
      if (b3) {
        addTimer(() => { setBankerCards([b1, b2, b3]); setDealtCount(6); }, delay);
        delay += 500;
      }

      addTimer(() => {
        finalizeResult(playerFinal, bankerFinal, betTarget);
      }, delay + 200);
    }
  };

  const finalizeResult = (pCards: Card[], bCards: Card[], target: BetTarget) => {
    const pTotal = handTotal(pCards);
    const bTotal = handTotal(bCards);
    let w: "player" | "banker" | "tie";
    if (pTotal > bTotal) w = "player";
    else if (bTotal > pTotal) w = "banker";
    else w = "tie";

    setWinner(w);
    setPhase("done");

    let delta = 0;
    let win = false;
    if (target === w) {
      win = true;
      if (w === "player") delta = chipAmount * 2;
      else if (w === "banker") delta = chipAmount + Math.floor(chipAmount * 0.95);
      else delta = chipAmount * 9; // tie 8:1 + 원금
    }

    setIsWin(win);
    if (win) {
      setResultText(`🎉 ${w === "player" ? "플레이어" : w === "banker" ? "뱅커" : "타이"} 승! +${delta.toLocaleString()}원`);
    } else {
      setResultText("");
    }
    onResult(delta);
  };

  const handleReset = () => {
    clearTimers();
    setPhase("idle");
    setPlayerCards([]);
    setBankerCards([]);
    setDealtCount(0);
    setWinner(null);
    setResultText("");
  };

  const pTotal = handTotal(playerCards);
  const bTotal = handTotal(bankerCards);
  const isDealing = phase === "dealing";
  const isDone = phase === "done";
  const canDeal = !!betTarget && phase === "idle" && balance >= chipAmount;

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="🃏 바카라 도움말">
        <HelpSection title="게임 방법">
          <HelpText>{"플레이어 / 뱅커 / 타이 중 하나에 베팅하고 DEAL을 누르세요.\n각 핸드에 카드 2장씩 배분되며, 바카라 룰에 따라 3번째 카드가 추가될 수 있습니다.\n합계가 9에 가까운 쪽이 이깁니다 (10·J·Q·K = 0점, A = 1점)."}</HelpText>
        </HelpSection>
        <HelpSection title="배당표">
          <PayTable>
            <PayLabel>PLAYER 승리</PayLabel><PayValue>1:1</PayValue>
            <PayLabel>BANKER 승리</PayLabel><PayValue>0.95:1 (수수료 5%)</PayValue>
            <PayLabel>TIE (무승부)</PayLabel><PayValue>8:1</PayValue>
          </PayTable>
        </HelpSection>
        <HelpSection title="내추럴">
          <HelpText>{"처음 2장 합계가 8 또는 9면 내추럴로 즉시 승패가 결정됩니다.\n내추럴이면 추가 카드를 뽑지 않습니다."}</HelpText>
        </HelpSection>
        <HelpSection title="팁">
          <HelpText>{"뱅커 베팅이 통계적으로 가장 유리합니다.\nTIE는 고배당이지만 확률이 낮아 리스크가 큽니다."}</HelpText>
        </HelpSection>
      </GameHelpModal>

      <Header>
        <Title>🃏 바카라</Title>
        <BalanceTag>💰 {balance.toLocaleString()}원</BalanceTag>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseButton $disabled={isDealing} onClick={isDealing ? undefined : onClose}>
          닫기
        </CloseButton>
      </Header>

      {/* Table */}
      <TableArea>
        <HandRow>
          <HandLabel $winner={winner === "player"}>
            플레이어{winner === "player" ? " 🏆" : ""}
          </HandLabel>
          <Cards>
            {playerCards.map((card, i) => (
              <CardEl
                key={i}
                $dealt
                $red={isRed(card.suit)}
                $delay={i * 0.4}
                $isBack={false}
              >
                <div>{card.suit}</div>
                <div>{card.value}</div>
              </CardEl>
            ))}
          </Cards>
          <ScoreBadge $winner={winner === "player"}>
            {playerCards.length > 0 ? pTotal : "-"}
          </ScoreBadge>
        </HandRow>

        <Divider />

        <HandRow>
          <HandLabel $winner={winner === "banker"}>
            뱅커{winner === "banker" ? " 🏆" : ""}
          </HandLabel>
          <Cards>
            {bankerCards.map((card, i) => (
              <CardEl
                key={i}
                $dealt
                $red={isRed(card.suit)}
                $delay={i * 0.4 + 0.2}
                $isBack={false}
              >
                <div>{card.suit}</div>
                <div>{card.value}</div>
              </CardEl>
            ))}
          </Cards>
          <ScoreBadge $winner={winner === "banker"}>
            {bankerCards.length > 0 ? bTotal : "-"}
          </ScoreBadge>
        </HandRow>

        <ResultBanner $win={isWin}>{resultText || " "}</ResultBanner>
      </TableArea>

      {/* Controls */}
      <Section>
        <SectionLabel>베팅 대상</SectionLabel>
        <BetTargetRow>
          <BetTargetBtn
            $active={betTarget === "player"}
            $color="#1a3a7a"
            onClick={() => phase === "idle" && setBetTarget("player")}
          >
            PLAYER<br /><span style={{ fontSize: "0.7rem", fontWeight: "normal" }}>1:1</span>
          </BetTargetBtn>
          <BetTargetBtn
            $active={betTarget === "banker"}
            $color="#7a1a1a"
            onClick={() => phase === "idle" && setBetTarget("banker")}
          >
            BANKER<br /><span style={{ fontSize: "0.7rem", fontWeight: "normal" }}>0.95:1</span>
          </BetTargetBtn>
          <BetTargetBtn
            $active={betTarget === "tie"}
            $color="#4a2a7a"
            onClick={() => phase === "idle" && setBetTarget("tie")}
          >
            TIE<br /><span style={{ fontSize: "0.7rem", fontWeight: "normal" }}>8:1</span>
          </BetTargetBtn>
        </BetTargetRow>

        <SectionLabel>베팅금 설정</SectionLabel>
        <BetControls
          value={chipAmount}
          onChange={setChipAmount}
          minBet={minBet}
          maxBet={maxBet}
          balance={balance}
          disabled={phase !== "idle"}
        />

        <InfoRow>
          베팅: {betTarget ? (betTarget === "player" ? "플레이어" : betTarget === "banker" ? "뱅커" : "타이") : "없음"} | {chipAmount.toLocaleString()}원
        </InfoRow>

        {isDone ? (
          <DealButton $disabled={false} onClick={handleReset}>
            다시 시작
          </DealButton>
        ) : (
          <DealButton $disabled={!canDeal} onClick={handleDeal}>
            {isDealing ? "딜링 중..." : "DEAL"}
          </DealButton>
        )}
      </Section>
    </Overlay>
  );
}
