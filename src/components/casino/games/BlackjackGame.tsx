import { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import GameHelpModal, { HelpSection, HelpText, PayTable, PayLabel, PayValue } from "./GameHelpModal";

// ── 타입 ─────────────────────────────────────────────────────────────────────

type Suit = "♠" | "♥" | "♦" | "♣";
type FaceValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface BJCard {
  suit: Suit;
  value: FaceValue;
  numVal: number;
}

type GamePhase = "idle" | "player" | "dealer" | "result";
type HandResult = "blackjack" | "win" | "push" | "lose" | null;

// ── 상수 ─────────────────────────────────────────────────────────────────────

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const FACE_VALUES: FaceValue[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const NUM_VAL: Record<FaceValue, number> = {
  A: 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10,
};
// ── 유틸 ─────────────────────────────────────────────────────────────────────

function buildDeck(): BJCard[] {
  const deck: BJCard[] = [];
  for (const suit of SUITS)
    for (const value of FACE_VALUES)
      deck.push({ suit, value, numVal: NUM_VAL[value] });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcScore(cards: BJCard[]): number {
  let sum = cards.reduce((s, c) => s + c.numVal, 0);
  let aces = cards.filter((c) => c.value === "A").length;
  while (sum > 21 && aces > 0) { sum -= 10; aces--; }
  return sum;
}

function isBlackjack(cards: BJCard[]): boolean {
  return cards.length === 2 && calcScore(cards) === 21;
}

function dealerShouldHit(cards: BJCard[]): boolean {
  const score = calcScore(cards);
  if (score < 17) return true;
  if (score === 17) {
    const rawSum = cards.reduce((s, c) => s + c.numVal, 0);
    return rawSum !== 17;
  }
  return false;
}

function isRed(suit: Suit) { return suit === "♥" || suit === "♦"; }

// ── 스타일 ───────────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

const flipIn = keyframes`
  from { transform: rotateY(90deg); opacity: 0; }
  to   { transform: rotateY(0deg);  opacity: 1; }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center top, #1a5c35 0%, #0d3d22 50%, #060f0a 100%);
  border-radius: 8px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 16px;
  overflow-y: auto;
  gap: 10px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  color: #f0c040;
  font-size: 1.1rem;
  font-weight: 700;
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
  width: 28px;
  height: 28px;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { background: rgba(240, 192, 64, 0.28); }
`;

const CloseBtn = styled.button`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #aaa;
  font-size: 0.85rem;
  padding: 4px 12px;
  cursor: pointer;
  &:hover { background: rgba(255,255,255,0.14); color: #fff; }
`;

const ZoneLabel = styled.div`
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 2px;
`;

const ScoreBadge = styled.div<{ $bust?: boolean; $bj?: boolean }>`
  display: inline-block;
  min-width: 32px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ $bust, $bj }) => ($bust ? "#e74c3c" : $bj ? "#f0c040" : "#fff")};
  background: ${({ $bust, $bj }) =>
    $bust ? "rgba(231,76,60,0.2)" : $bj ? "rgba(240,192,64,0.2)" : "rgba(255,255,255,0.1)"};
`;

const CardsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

const CardFace = styled.div<{ $red: boolean; $new?: boolean }>`
  width: 56px;
  height: 80px;
  background: #fff;
  border-radius: 7px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: ${({ $red }) => ($red ? "#c0392b" : "#1a1a2e")};
  user-select: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  ${({ $new }) => $new && css`animation: ${flipIn} 0.3s ease forwards;`}
`;

const CardBack = styled.div`
  width: 56px;
  height: 80px;
  background: repeating-linear-gradient(
    45deg,
    #1a3d6e,
    #1a3d6e 6px,
    #15325a 6px,
    #15325a 12px
  );
  border-radius: 7px;
  border: 2px solid rgba(255,255,255,0.15);
  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
`;

const CardCorner = styled.div<{ $flip?: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.62rem;
  line-height: 1.15;
  ${({ $flip }) =>
    $flip
      ? css`bottom: 3px; right: 4px; transform: rotate(180deg);`
      : css`top: 3px; left: 4px;`}
`;

const CardSuitBig = styled.div`
  font-size: 1.3rem;
`;

const DealerZone = styled.div`
  width: 100%;
  max-width: 440px;
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  border: 1px solid rgba(180,140,50,0.25);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: ${slideDown} 0.3s ease;
`;

const PlayerZone = styled(DealerZone)`
  border-color: rgba(46,204,113,0.25);
`;

const BottomArea = styled.div`
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
`;

const BalanceValue = styled.span`
  color: #f0c040;
  font-weight: 700;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionBtn = styled.button<{ $variant?: "primary" | "hit" | "stand" | "double" }>`
  flex: 1;
  max-width: 120px;
  padding: 9px 0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  ${({ $variant }) => {
    if ($variant === "primary")
      return css`
        background: linear-gradient(135deg, #f0c040 0%, #e08000 100%);
        color: #1a0a00;
        &:disabled { opacity: 0.4; cursor: not-allowed; }
      `;
    if ($variant === "hit")
      return css`
        background: linear-gradient(135deg, #2ecc71 0%, #1a8a4a 100%);
        color: #fff;
      `;
    if ($variant === "stand")
      return css`
        background: linear-gradient(135deg, #e74c3c 0%, #9b2015 100%);
        color: #fff;
      `;
    if ($variant === "double")
      return css`
        background: linear-gradient(135deg, #3498db 0%, #1a5fa8 100%);
        color: #fff;
        &:disabled { opacity: 0.4; cursor: not-allowed; }
      `;
    return css`
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #ccc;
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    `;
  }}
`;

const ResultBanner = styled.div<{ $result: HandResult }>`
  width: 100%;
  max-width: 440px;
  text-align: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${({ $result }) => {
    if ($result === "blackjack" || $result === "win") return "rgba(240,192,64,0.15)";
    if ($result === "push") return "rgba(149,165,166,0.15)";
    return "rgba(192,57,43,0.15)";
  }};
  border: 1px solid ${({ $result }) => {
    if ($result === "blackjack" || $result === "win") return "rgba(240,192,64,0.4)";
    if ($result === "push") return "rgba(149,165,166,0.3)";
    return "rgba(192,57,43,0.3)";
  }};
`;

const ResultLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #f0c040;
`;

const ResultDelta = styled.div<{ $positive: boolean }>`
  font-size: 0.85rem;
  margin-top: 3px;
  color: ${({ $positive }) => ($positive ? "#2ecc71" : "#e74c3c")};
  font-weight: 600;
`;

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const BJ_MIN_RATIO = 0.01;
const BJ_MAX_RATIO = 0.10;

interface Props {
  balance: number;
  initialBalance: number;
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

export default function BlackjackGame({ balance, initialBalance, onBet, onResult, onClose }: Props) {
  const minBet = r100(initialBalance * BJ_MIN_RATIO);
  const maxBet = r100(initialBalance * BJ_MAX_RATIO);
  const [showHelp, setShowHelp] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [betAmount, setBetAmount] = useState(() => r100(initialBalance * BJ_MIN_RATIO));
  const [deckRef, setDeckRef] = useState<BJCard[]>([]);
  const [playerCards, setPlayerCards] = useState<BJCard[]>([]);
  const [dealerCards, setDealerCards] = useState<BJCard[]>([]);
  const [dealerHoleRevealed, setDealerHoleRevealed] = useState(false);
  const [doubled, setDoubled] = useState(false);
  const [handResult, setHandResult] = useState<HandResult>(null);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [newCardIdx, setNewCardIdx] = useState<number | null>(null);

  const drawCard = (deck: BJCard[]): [BJCard, BJCard[]] => {
    const [card, ...rest] = deck;
    return [card, rest];
  };

  const dealGame = useCallback(() => {
    if (balance < betAmount) return;
    const deck = shuffle(buildDeck());
    const [p1, d1, p2, d2, ...rest] = deck;
    const pCards = [p1, p2];
    const dCards = [d1, d2];

    setDeckRef(rest);
    setPlayerCards(pCards);
    setDealerCards(dCards);
    setDealerHoleRevealed(false);
    setDoubled(false);
    setHandResult(null);
    setLastDelta(null);
    setNewCardIdx(null);
    onBet(betAmount);

    if (isBlackjack(pCards)) {
      setDealerHoleRevealed(true);
      if (isBlackjack(dCards)) {
        setHandResult("push"); setLastDelta(0); onResult(0);
      } else {
        const delta = Math.floor(betAmount * 1.5);
        setHandResult("blackjack"); setLastDelta(delta); onResult(delta);
      }
      setPhase("result");
      return;
    }
    setPhase("player");
  }, [balance, betAmount, onBet, onResult]);

  const runDealerTurn = useCallback((
    currentDeck: BJCard[],
    currentDealerCards: BJCard[],
    pCards: BJCard[],
    isDoubled: boolean
  ) => {
    const dealerPlay = (deck: BJCard[], dCards: BJCard[]) => {
      if (dealerShouldHit(dCards)) {
        const [card, rest] = drawCard(deck);
        const next = [...dCards, card];
        setDeckRef(rest);
        setDealerCards(next);
        setTimeout(() => dealerPlay(rest, next), 600);
      } else {
        const dealerScore = calcScore(dCards);
        const pScore = calcScore(pCards);
        const effectiveBet = isDoubled ? betAmount * 2 : betAmount;
        let result: HandResult;
        let delta: number;
        if (pScore > 21) {
          result = "lose"; delta = -effectiveBet;
        } else if (dealerScore > 21 || pScore > dealerScore) {
          result = "win"; delta = effectiveBet;
        } else if (pScore === dealerScore) {
          result = "push"; delta = 0;
        } else {
          result = "lose"; delta = -effectiveBet;
        }
        setHandResult(result);
        setLastDelta(delta);
        onResult(delta);
        setPhase("result");
      }
    };
    setDealerHoleRevealed(true);
    setPhase("dealer");
    setTimeout(() => dealerPlay(currentDeck, currentDealerCards), 300);
  }, [betAmount, onResult]);

  const hit = useCallback(() => {
    if (phase !== "player") return;
    const [card, rest] = drawCard(deckRef);
    setDeckRef(rest);
    const newCards = [...playerCards, card];
    setPlayerCards(newCards);
    setNewCardIdx(newCards.length - 1);
    if (calcScore(newCards) >= 21) {
      setTimeout(() => runDealerTurn(rest, dealerCards, newCards, doubled), 400);
    }
  }, [phase, deckRef, playerCards, dealerCards, doubled, runDealerTurn]);

  const stand = useCallback(() => {
    if (phase !== "player") return;
    runDealerTurn(deckRef, dealerCards, playerCards, doubled);
  }, [phase, deckRef, dealerCards, playerCards, doubled, runDealerTurn]);

  const doubleDown = useCallback(() => {
    if (phase !== "player" || playerCards.length !== 2 || balance < betAmount) return;
    onBet(betAmount);
    const [card, rest] = drawCard(deckRef);
    const newCards = [...playerCards, card];
    setDeckRef(rest);
    setPlayerCards(newCards);
    setDoubled(true);
    setNewCardIdx(newCards.length - 1);
    setTimeout(() => runDealerTurn(rest, dealerCards, newCards, true), 400);
  }, [phase, deckRef, playerCards, dealerCards, balance, betAmount, onBet, runDealerTurn]);

  const canDouble = phase === "player" && playerCards.length === 2 && balance >= betAmount;

  const resultText = (r: HandResult) => {
    if (r === "blackjack") return "블랙잭! 🎉";
    if (r === "win") return "승리!";
    if (r === "push") return "무승부";
    return "패배";
  };

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="♠ 블랙잭 도움말">
        <HelpSection title="게임 방법">
          <HelpText>{"베팅 후 DEAL — 플레이어와 딜러 각 2장 배분 (딜러 1장은 뒷면).\n합계 21에 가장 가깝게 만들되 21을 초과하면 버스트(패배).\nA는 1 또는 11로 자동 계산됩니다."}</HelpText>
        </HelpSection>
        <HelpSection title="배당표">
          <PayTable>
            <PayLabel>블랙잭 (첫 2장 = 21)</PayLabel><PayValue>1.5배 + 원금</PayValue>
            <PayLabel>일반 승리</PayLabel><PayValue>1배 + 원금</PayValue>
            <PayLabel>무승부 (Push)</PayLabel><PayValue>원금 반환</PayValue>
            <PayLabel>더블다운 승리</PayLabel><PayValue>2배 + 원금</PayValue>
            <PayLabel>패배</PayLabel><PayValue>베팅금 손실</PayValue>
          </PayTable>
        </HelpSection>
        <HelpSection title="행동">
          <PayTable>
            <PayLabel>히트</PayLabel><PayValue>카드 1장 추가</PayValue>
            <PayLabel>스탠드</PayLabel><PayValue>현재 패로 승부</PayValue>
            <PayLabel>더블다운</PayLabel><PayValue>베팅 2배 + 카드 1장만 추가</PayValue>
          </PayTable>
        </HelpSection>
        <HelpSection title="딜러 규칙">
          <HelpText>{"딜러는 합계 17 미만이면 반드시 히트합니다.\nSoft 17 (A+6)일 때도 히트합니다."}</HelpText>
        </HelpSection>
      </GameHelpModal>

      <Header>
        <Title>♠ 블랙잭</Title>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseBtn onClick={onClose}>닫기</CloseBtn>
      </Header>

      {phase !== "idle" && (
        <DealerZone>
          <ZoneLabel>Dealer</ZoneLabel>
          <CardsRow>
            {dealerCards.map((card, i) =>
              i === 1 && !dealerHoleRevealed
                ? <CardBack key={i} />
                : <CardComp key={i} card={card} isNew={i === dealerCards.length - 1 && phase === "dealer"} />
            )}
          </CardsRow>
          <ScoreBadge
            $bust={dealerHoleRevealed && calcScore(dealerCards) > 21}
            $bj={dealerHoleRevealed && isBlackjack(dealerCards)}
          >
            {dealerHoleRevealed
              ? calcScore(dealerCards) > 21 ? "버스트"
                : isBlackjack(dealerCards) ? "블랙잭!"
                : calcScore(dealerCards)
              : "?"}
          </ScoreBadge>
        </DealerZone>
      )}

      {phase === "result" && handResult && (
        <ResultBanner $result={handResult}>
          <ResultLabel>{resultText(handResult)}</ResultLabel>
          <ResultDelta $positive={(lastDelta ?? 0) >= 0}>
            {(lastDelta ?? 0) > 0 ? `+${(lastDelta ?? 0).toLocaleString()}`
              : (lastDelta ?? 0) === 0 ? "베팅금 반환"
              : `${(lastDelta ?? 0).toLocaleString()}`}
          </ResultDelta>
        </ResultBanner>
      )}

      {phase !== "idle" && (
        <PlayerZone>
          <ZoneLabel>나 {doubled ? "(더블다운)" : ""}</ZoneLabel>
          <CardsRow>
            {playerCards.map((card, i) =>
              <CardComp key={i} card={card} isNew={i === newCardIdx} />
            )}
          </CardsRow>
          <ScoreBadge $bust={calcScore(playerCards) > 21} $bj={isBlackjack(playerCards)}>
            {calcScore(playerCards) > 21 ? "버스트"
              : isBlackjack(playerCards) ? "블랙잭!"
              : calcScore(playerCards)}
          </ScoreBadge>
        </PlayerZone>
      )}

      <BottomArea>
        <BalanceRow>
          <span>잔액 <BalanceValue>{balance.toLocaleString()}</BalanceValue></span>
          {phase !== "idle" && (
            <span>베팅 <BalanceValue>{(doubled ? betAmount * 2 : betAmount).toLocaleString()}</BalanceValue></span>
          )}
        </BalanceRow>

        {(phase === "idle" || phase === "result") && (
          <>
            <BetControls
              value={betAmount}
              onChange={setBetAmount}
              minBet={minBet}
              maxBet={maxBet}
              balance={balance}
            />
            <ActionRow>
              <ActionBtn $variant="primary" onClick={dealGame} disabled={balance < betAmount}>
                {phase === "result" ? "다시 딜 (DEAL)" : "딜 (DEAL)"}
              </ActionBtn>
            </ActionRow>
          </>
        )}

        {phase === "player" && (
          <ActionRow>
            <ActionBtn $variant="hit" onClick={hit}>히트</ActionBtn>
            <ActionBtn $variant="stand" onClick={stand}>스탠드</ActionBtn>
            <ActionBtn $variant="double" onClick={doubleDown} disabled={!canDouble}>더블</ActionBtn>
          </ActionRow>
        )}

        {phase === "dealer" && (
          <ActionRow>
            <ActionBtn disabled>딜러 진행 중...</ActionBtn>
          </ActionRow>
        )}
      </BottomArea>
    </Overlay>
  );
}

function CardComp({ card, isNew }: { card: BJCard; isNew: boolean }) {
  const red = isRed(card.suit);
  return (
    <CardFace $red={red} $new={isNew}>
      <CardCorner>
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </CardCorner>
      <CardSuitBig>{card.suit}</CardSuitBig>
      <CardCorner $flip>
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </CardCorner>
    </CardFace>
  );
}
