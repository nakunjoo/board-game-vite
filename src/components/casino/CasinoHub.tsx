import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import type { CasinoPlayer } from "./types";
import CasinoLeaderboard from "./CasinoLeaderboard";
import {
  HubWrapper,
  HubTopBar,
  BalanceDisplay,
  TimerDisplay,
  HubBody,
  GameGrid,
  GameCard,
  GameCardIcon,
  GameCardName,
  GamePlayButton,
  VoteSection,
  VoteButton,
  VoteInfo,
} from "../../styles/game/casino";

const CASINO_GAMES = [
  { id: "roulette", name: "룰렛", icon: "🎡" },
  { id: "slots", name: "슬롯머신", icon: "🎰" },
  { id: "baccarat", name: "바카라", icon: "🃏" },
  { id: "blackjack", name: "블랙잭", icon: "♠" },
  { id: "videopoker", name: "비디오 포커", icon: "🎲" },
  { id: "horseracing", name: "경마", icon: "🏇" },
  { id: "mines", name: "지뢰찾기", icon: "💣" },
];

// ─── 대출 스타일 ──────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.04); }
`;

const LoanBanner = styled.button`
  width: 100%;
  max-width: 100%;
  background: linear-gradient(135deg, #c0392b 0%, #8b0000 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 10px 16px;
  cursor: pointer;
  animation: ${pulse} 1.8s ease-in-out infinite;
  margin-bottom: 8px;
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface CasinoHubProps {
  myBalance: number;
  initialBalance: number;
  remainingSeconds: number | null;
  players: CasinoPlayer[];
  myPlayerId: string;
  onSelectGame: (game: string) => void;
  onVoteEnd: () => void;
  onLoan: (amount: number) => void;
  votes: string[];
  votesNeeded: number;
  memberCount: number;
  totalLoan: number;
}

export default function CasinoHub({
  myBalance,
  initialBalance,
  remainingSeconds,
  players,
  myPlayerId,
  onSelectGame,
  onVoteEnd,
  onLoan,
  votes,
  votesNeeded,
  memberCount,
  totalLoan,
}: CasinoHubProps) {
  const [displaySeconds, setDisplaySeconds] = useState(remainingSeconds);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanInput, setLoanInput] = useState("");

  // 로컬 카운트다운 (서버 타이머 보정용 보조 표시)
  useEffect(() => {
    if (remainingSeconds === null) {
      setDisplaySeconds(null);
      return;
    }
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
  const hasVoted = votes.includes(myPlayerId);
  const maxLoan = Math.floor(initialBalance / 2);
  const showLoanBanner = myBalance < initialBalance * 0.05;

  const handleLoanConfirm = () => {
    const amount = parseInt(loanInput, 10);
    if (isNaN(amount) || amount < 10 || amount > maxLoan) return;
    onLoan(amount);
    setLoanInput("");
    setShowLoanModal(false);
  };

  return (
    <HubWrapper>
      {showLoanModal && (
        <LoanOverlay onClick={() => setShowLoanModal(false)}>
          <LoanBox onClick={(e) => e.stopPropagation()}>
            <LoanTitle>💸 긴급 대출</LoanTitle>
            <LoanInfo>
              {`최소 10 ~ 최대 ${maxLoan.toLocaleString()}\n이자 10% — 게임 종료 시 자동 차감`}
            </LoanInfo>
            {totalLoan > 0 && (
              <LoanTotalTag>현재 누적 대출: {totalLoan.toLocaleString()} (상환 예정: {Math.round(totalLoan * 1.1).toLocaleString()})</LoanTotalTag>
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
        <BalanceDisplay>💰 {myBalance.toLocaleString()}</BalanceDisplay>
        {displaySeconds !== null ? (
          <TimerDisplay $urgent={isUrgent}>
            ⏱ {formatTime(displaySeconds)}
          </TimerDisplay>
        ) : (
          <TimerDisplay>⏱ 무제한</TimerDisplay>
        )}
      </HubTopBar>

      <HubBody>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 0 }}>
          {showLoanBanner && (
            <LoanBanner onClick={() => setShowLoanModal(true)}>
              💸 잔액 부족! 긴급 대출 받기
            </LoanBanner>
          )}
          <GameGrid>
            {CASINO_GAMES.map((game) => (
              <GameCard key={game.id} onClick={() => onSelectGame(game.id)}>
                <GameCardIcon>{game.icon}</GameCardIcon>
                <GameCardName>{game.name}</GameCardName>
                <GamePlayButton>플레이</GamePlayButton>
              </GameCard>
            ))}
          </GameGrid>

          <VoteSection>
            <VoteButton onClick={onVoteEnd} disabled={hasVoted}>
              {hasVoted ? "종료 투표 완료" : "게임 종료 투표"}
            </VoteButton>
            <VoteInfo>
              {votes.length}/{votesNeeded} 명 동의 ({memberCount}명 중 과반수 필요)
            </VoteInfo>
          </VoteSection>
        </div>

        <CasinoLeaderboard
          players={players}
          myPlayerId={myPlayerId}
          initialBalance={initialBalance}
        />
      </HubBody>
    </HubWrapper>
  );
}
