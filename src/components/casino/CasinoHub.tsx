import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import type { CasinoPlayer } from "./types";
import {
  HubWrapper,
  HubTopBar,
  TimerDisplay,
  HubBody,
  GameGrid,
  GameCard,
  GameCardIcon,
  GameCardName,
  GamePlayButton,
  GameCardBadge,
} from "../../styles/game/casino";

const CASINO_GAMES = [
  { id: "roulette", name: "룰렛", icon: "🎡" },
  { id: "slots", name: "슬롯머신", icon: "🎰" },
  { id: "blackjack", name: "블랙잭", icon: "♠" },
  { id: "videopoker", name: "비디오 포커", icon: "🎲" },
  { id: "horseracing", name: "경마", icon: "🏇" },
  { id: "mines", name: "지뢰찾기", icon: "💣" },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── 순위 스타일 ──────────────────────────────────────────────────────────────

const TopRankBar = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(240,192,64,0.2);
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  &:hover { border-color: rgba(240,192,64,0.5); }
`;

const RankChip = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 0.72rem;
  color: ${({ $rank }) => $rank === 1 ? "#f0c040" : $rank === 2 ? "#aaa" : "#cd7f32"};
  flex: 1;
  min-width: 0;
`;

const RankLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const RankNum = styled.span`
  font-weight: 700;
`;

const RankAmount = styled.span`
  font-weight: 600;
`;

const RankNick = styled.span`
  opacity: 0.75;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;


// ─── 전체 순위 모달 ───────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: #1a2a3a;
  border: 1px solid rgba(240,192,64,0.3);
  border-radius: 14px;
  padding: 24px 20px;
  width: 340px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModalTitle = styled.div`
  color: #f0c040;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(240,192,64,0.2);
`;

const ModalRow = styled.div<{ $isMe?: boolean; $rank?: number }>`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: ${({ $isMe }) => $isMe ? "rgba(240,192,64,0.1)" : "transparent"};
  font-weight: ${({ $isMe }) => $isMe ? 700 : 400};
`;

const ModalRank = styled.div<{ $rank: number }>`
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  color: ${({ $rank }) => $rank === 1 ? "#f0c040" : $rank === 2 ? "#ccc" : $rank === 3 ? "#cd7f32" : "#666"};
`;

const ModalNick = styled.div`
  font-size: 0.85rem;
  color: #ddd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModalAmount = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ $positive, $negative }) => $positive ? "#2ecc71" : $negative ? "#e74c3c" : "#aaa"};
  white-space: nowrap;
  text-align: right;
`;

const ModalCloseBtn = styled.button`
  margin-top: 4px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  color: #aaa;
  font-size: 0.85rem;
  padding: 8px;
  cursor: pointer;
  width: 100%;
`;

const ForceEndBtn = styled.button`
  margin-top: 4px;
  background: rgba(231,76,60,0.15);
  border: 1px solid rgba(231,76,60,0.5);
  border-radius: 8px;
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px;
  cursor: pointer;
  width: 100%;
  &:hover { background: rgba(231,76,60,0.3); }
`;

// ─── 대출 스타일 ──────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.04); }
`;

const LoanBanner = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #c0392b 0%, #8b0000 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
  animation: ${pulse} 1.8s ease-in-out infinite;
  letter-spacing: 1px;
`;

const LoanOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoanBox = styled.div`
  background: #1a2a3a;
  border: 1px solid rgba(240,192,64,0.3);
  border-radius: 16px;
  padding: 28px 24px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const LoanTitle = styled.div`
  color: #f0c040;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
`;

const LoanInfo = styled.div`
  color: #aaa;
  font-size: 0.82rem;
  text-align: center;
  line-height: 1.5;
  white-space: pre-line;
`;

const LoanInput = styled.input`
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  padding: 10px 12px;
  width: 100%;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #f0c040; }
`;

const LoanRow = styled.div`
  display: flex;
  gap: 8px;
`;

const LoanBtn = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $primary }) => $primary
    ? "linear-gradient(135deg, #f0c040 0%, #e67e22 100%)"
    : "rgba(255,255,255,0.1)"};
  color: ${({ $primary }) => $primary ? "#0d1a2e" : "#ccc"};
`;

const LoanTotalTag = styled.div`
  color: #e74c3c;
  font-size: 0.82rem;
  text-align: center;
`;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CasinoHubProps {
  myBalance: number;
  initialBalance: number;
  remainingSeconds: number | null;
  players: CasinoPlayer[];
  myPlayerId: string;
  onSelectGame: (game: string) => void;
  onLoan: (amount: number) => void;
  onForceEnd?: () => void;
  memberCount: number;
  totalLoan: number;
  isAdmin?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CasinoHub({
  myBalance,
  initialBalance,
  remainingSeconds,
  players,
  myPlayerId,
  onSelectGame,
  onLoan,
  onForceEnd,
  totalLoan,
  isAdmin,
}: CasinoHubProps) {
  const [displaySeconds, setDisplaySeconds] = useState(remainingSeconds);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanInput, setLoanInput] = useState("");
  const [rankIdx, setRankIdx] = useState(0);

  useEffect(() => {
    if (remainingSeconds === null) { setDisplaySeconds(null); return; }
    setDisplaySeconds(remainingSeconds);
    const id = setInterval(() => {
      setDisplaySeconds((prev) => {
        if (prev === null || prev <= 0) return prev;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remainingSeconds]);

  const isUrgent = displaySeconds !== null && displaySeconds < 60;
  const maxLoan = Math.floor(initialBalance / 2);
  const showLoanBanner = myBalance < initialBalance * 0.05;

  const sorted = [...players].sort((a, b) => b.balance - a.balance);
  const top3 = sorted.slice(0, 3);

  useEffect(() => {
    if (top3.length <= 1) return;
    const id = setInterval(() => {
      setRankIdx((prev) => (prev + 1) % top3.length);
    }, 2500);
    return () => clearInterval(id);
  }, [top3.length]);

  const handleLoanConfirm = () => {
    const amount = parseInt(loanInput, 10);
    if (isNaN(amount) || amount < 10 || amount > maxLoan) return;
    onLoan(amount);
    setLoanInput("");
    setShowLoanModal(false);
  };

  return (
    <HubWrapper>
      {/* 전체 순위 모달 */}
      {showRankModal && (
        <ModalOverlay onClick={() => setShowRankModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalTitle>🏆 실시간 순위</ModalTitle>
            {sorted.map((p, i) => {
              const profit = p.balance - initialBalance;
              return (
                <ModalRow key={p.playerId} $isMe={p.playerId === myPlayerId} $rank={i + 1}>
                  <ModalRank $rank={i + 1}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </ModalRank>
                  <ModalNick>{p.nickname}</ModalNick>
                  <ModalAmount $positive={profit > 0} $negative={profit < 0}>
                    {p.balance.toLocaleString()}
                  </ModalAmount>
                </ModalRow>
              );
            })}
            {isAdmin && onForceEnd && (
              <ForceEndBtn onClick={() => {
                if (window.confirm("게임을 강제 종료하시겠습니까? 현재 기록이 모두 저장됩니다.")) {
                  onForceEnd();
                  setShowRankModal(false);
                }
              }}>
                🛠 게임 강제 종료
              </ForceEndBtn>
            )}
            <ModalCloseBtn onClick={() => setShowRankModal(false)}>닫기</ModalCloseBtn>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* 대출 모달 */}
      {showLoanModal && (
        <LoanOverlay onClick={() => setShowLoanModal(false)}>
          <LoanBox onClick={(e) => e.stopPropagation()}>
            <LoanTitle>💸 긴급 대출</LoanTitle>
            <LoanInfo>
              {`최소 10 ~ 최대 ${maxLoan.toLocaleString()}\n이자 10% — 게임 종료 시 자동 차감`}
            </LoanInfo>
            {totalLoan > 0 && (
              <LoanTotalTag>누적 대출: {totalLoan.toLocaleString()} (상환 예정: {Math.round(totalLoan * 1.1).toLocaleString()})</LoanTotalTag>
            )}
            <LoanInput
              type="number"
              placeholder="대출 금액 입력"
              value={loanInput}
              min={10}
              max={maxLoan}
              onChange={(e) => setLoanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoanConfirm()}
              autoFocus
            />
            <LoanRow>
              <LoanBtn onClick={() => setShowLoanModal(false)}>취소</LoanBtn>
              <LoanBtn $primary onClick={handleLoanConfirm}>대출받기</LoanBtn>
            </LoanRow>
          </LoanBox>
        </LoanOverlay>
      )}

      <HubTopBar>
        {/* 1~3위 인라인 + 전체 순위 모달 버튼 */}
        <TopRankBar onClick={() => setShowRankModal(true)}>
          {top3.length === 0 ? (
            <RankChip $rank={1} style={{ opacity: 0.35 }}>순위 집계 중...</RankChip>
          ) : (() => {
            const i = rankIdx % top3.length;
            const p = top3[i];
            return (
              <RankChip key={p.playerId} $rank={i + 1}>
                <RankLeft>
                  <RankNum>{i + 1}위</RankNum>
                  <RankAmount>{p.balance.toLocaleString()}</RankAmount>
                </RankLeft>
                <RankNick>{p.nickname}</RankNick>
              </RankChip>
            );
          })()}
        </TopRankBar>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {displaySeconds !== null ? (
            <TimerDisplay $urgent={isUrgent}>⏱ {formatTime(displaySeconds)}</TimerDisplay>
          ) : (
            <TimerDisplay>⏱ 무제한</TimerDisplay>
          )}
        </div>
      </HubTopBar>

      <HubBody>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 0 }}>
          {showLoanBanner && (
            <LoanBanner onClick={() => setShowLoanModal(true)}>
              💸 잔액 부족! 긴급 대출 받기
            </LoanBanner>
          )}
          <GameGrid>
            {CASINO_GAMES.map((game) => {
              const playingCount = players.filter((p) => p.currentGame === game.id).length;
              return (
                <GameCard key={game.id} onClick={() => onSelectGame(game.id)}>
                  {playingCount > 0 && <GameCardBadge>👤 {playingCount}</GameCardBadge>}
                  <GameCardIcon>{game.icon}</GameCardIcon>
                  <GameCardName>{game.name}</GameCardName>
                  <GamePlayButton>플레이</GamePlayButton>
                </GameCard>
              );
            })}
          </GameGrid>
        </div>
      </HubBody>
    </HubWrapper>
  );
}
