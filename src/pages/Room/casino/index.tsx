import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../../contexts/AuthContext";
import { useRoomBase } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";
import CasinoHub from "../../../components/casino/CasinoHub";
import CasinoSetupModal from "../../../components/casino/CasinoSetupModal";
import CasinoResultModal from "../../../components/casino/CasinoResultModal";
import CasinoHelpModal from "../../../components/casino/CasinoHelpModal";
import VideoPokerGame from "../../../components/casino/games/VideoPokerGame";
import BlackjackGame from "../../../components/casino/games/BlackjackGame";
import RouletteGame from "../../../components/casino/games/RouletteGame";
import SlotsGame from "../../../components/casino/games/SlotsGame";
import BaccaratGame from "../../../components/casino/games/BaccaratGame";
import HorseRacingGame from "../../../components/casino/games/HorseRacingGame";
import MinesGame from "../../../components/casino/games/MinesGame";
import type { CasinoPlayer, CasinoGameOverData } from "../../../components/casino/types";

const floatUp = keyframes`
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  60%  { opacity: 1; transform: translateY(-48px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-80px) scale(0.9); }
`;

const DeltaFlash = styled.div<{ $positive: boolean }>`
  position: fixed;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  font-weight: 900;
  color: ${({ $positive }) => ($positive ? "#2ecc71" : "#e74c3c")};
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  pointer-events: none;
  z-index: 9999;
  animation: ${floatUp} 1.4s ease forwards;
  white-space: nowrap;
`;

export default function CasinoRoom() {
  const { isAdmin } = useAuth();
  const {
    roomName,
    playerId,
    send,
    subscribe,
    gameConfig,
    memberCount,
    isHost,
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isChatOpen,
    setIsChatOpen,
    hasUnreadMessages,
    setHasUnreadMessages,
    showHelpModal,
    setShowHelpModal,
    messagesEndRef,
    sendMessage,
    leaveRoom,
  } = useRoomBase();

  // ── 게임 진행 상태 ──────────────────────────────────────────────────
  const [roomJoinedReceived, setRoomJoinedReceived] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [initialBalance, setInitialBalance] = useState(10_000);
  const [myBalance, setMyBalance] = useState(10_000);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [players, setPlayers] = useState<CasinoPlayer[]>([]);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [totalLoan, setTotalLoan] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [deltaFlashes, setDeltaFlashes] = useState<{ id: number; value: number }[]>([]);
  const deltaIdRef = useRef(0);
  const [gameOverData, setGameOverData] = useState<CasinoGameOverData | null>(null);

  // 타이머 참조 (게임 시작 시각 기반 로컬 카운트다운)
  const timerStartRef = useRef<number | null>(null);
  const timerLimitRef = useRef<number | null>(null);

  // ── 로컬 카운트다운 ─────────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || timeLimitSeconds === null) {
      setRemainingSeconds(timeLimitSeconds);
      return;
    }

    // 최초 시작 시각 기록
    if (timerStartRef.current === null) {
      timerStartRef.current = Date.now();
      timerLimitRef.current = timeLimitSeconds;
    }

    setRemainingSeconds(timeLimitSeconds);

    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (timerStartRef.current ?? Date.now())) / 1000);
      const left = (timerLimitRef.current ?? timeLimitSeconds) - elapsed;
      if (left <= 0) {
        setRemainingSeconds(0);
        clearInterval(id);
      } else {
        setRemainingSeconds(left);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [gameStarted, timeLimitSeconds]);

  // ── 소켓 이벤트 구독 ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribe((event, data) => {
      switch (event) {
        case "roomCreated":
        case "roomJoined": {
          // 재연결 시 카지노 상태 복원 (서버에서 보내준다면)
          const d = data as {
            name?: string;
            casinoStarted?: boolean;
            casinoInitialBalance?: number;
            casinoTimeLimit?: number | null;
            casinoRemainingSeconds?: number | null;
            casinoPlayers?: CasinoPlayer[];
            casinoMyHistory?: { t: number; b: number }[];
            casinoAllHistories?: Record<string, { t: number; b: number }[]>;
            casinoVotes?: string[];
          };
          setRoomJoinedReceived(true);
          if (d.name === roomName && d.casinoStarted) {
            setGameStarted(true);
            if (d.casinoInitialBalance !== undefined) {
              setInitialBalance(d.casinoInitialBalance);
              const me = d.casinoPlayers?.find((p) => p.playerId === playerId);
              setMyBalance(me?.balance ?? d.casinoInitialBalance);
            }
            if (d.casinoTimeLimit !== undefined) {
              setTimeLimitSeconds(d.casinoTimeLimit);
              timerLimitRef.current = d.casinoTimeLimit;
            }
            if (d.casinoRemainingSeconds !== undefined && d.casinoRemainingSeconds !== null) {
              setRemainingSeconds(d.casinoRemainingSeconds);
              timerStartRef.current =
                Date.now() - ((d.casinoTimeLimit ?? 0) - d.casinoRemainingSeconds) * 1000;
            }
            if (d.casinoPlayers) {
              const allHist = d.casinoAllHistories ?? {};
              setPlayers(d.casinoPlayers.map((p) => ({
                ...p,
                currentGame: p.currentGame ?? null,
                history: allHist[p.playerId]?.length
                  ? allHist[p.playerId]
                  : [{ t: 0, b: p.balance }],
              })));
            }
          }
          break;
        }

        case "casinoStarted": {
          const d = data as {
            initialBalance: number;
            timeLimit: number | null;
            players: { playerId: string; nickname: string; balance: number; currentGame: null }[];
          };
          setGameStarted(true);
          setInitialBalance(d.initialBalance);
          setTimeLimitSeconds(d.timeLimit);
          timerStartRef.current = Date.now();
          timerLimitRef.current = d.timeLimit;
          setMyBalance(d.initialBalance);
          setPlayers(
            d.players.map((p) => ({
              ...p,
              currentGame: null,
              history: [{ t: 0, b: d.initialBalance }],
            }))
          );
          setCurrentGame(null);
          setTotalLoan(0);
          setGameOver(false);
          setGameOverData(null);
          setMessages((prev) => [
            ...prev,
            { message: "🎰 카지노 게임이 시작되었습니다!", isSystem: true },
          ]);
          break;
        }

        case "casinoBalanceUpdate": {
          const d = data as {
            playerId: string;
            balance: number;
            delta: number;
            historyPoint: { t: number; b: number };
          };
          if (d.playerId === playerId) {
            setMyBalance(d.balance);
            if (d.delta !== 0) {
              const id = ++deltaIdRef.current;
              setDeltaFlashes((prev) => [...prev, { id, value: d.delta }]);
              setTimeout(() => setDeltaFlashes((prev) => prev.filter((f) => f.id !== id)), 1400);
            }
          }
          setPlayers((prev) =>
            prev.map((p) =>
              p.playerId === d.playerId
                ? {
                    ...p,
                    balance: d.balance,
                    history: [...p.history, d.historyPoint],
                  }
                : p
            )
          );
          break;
        }

        case "casinoPlayerUpdate": {
          const d = data as { playerId: string; currentGame: string | null };
          if (d.playerId === playerId) {
            setCurrentGame(d.currentGame);
          }
          setPlayers((prev) =>
            prev.map((p) =>
              p.playerId === d.playerId ? { ...p, currentGame: d.currentGame } : p
            )
          );
          break;
        }

        case "casinoLoanConfirmed": {
          const d = data as { amount: number; totalLoan: number; newBalance: number };
          setTotalLoan(d.totalLoan);
          setMessages((prev) => [
            ...prev,
            { message: `💸 대출 ${d.amount.toLocaleString()}원 완료 (누적: ${d.totalLoan.toLocaleString()}원, 이자 10% 포함 상환 예정: ${Math.round(d.totalLoan * 1.1).toLocaleString()}원)`, isSystem: true },
          ]);
          break;
        }

        case "casinoGameOver": {
          const d = data as CasinoGameOverData;
          setGameOver(true);
          setGameOverData(d);
          setGameStarted(false);
          break;
        }

        default:
          break;
      }
    });

    return unsubscribe;
  }, [subscribe, roomName, playerId, setMessages]);

  // ── 핸들러 ──────────────────────────────────────────────────────────
  const handleStart = (timeLimit: number | null, balance: number) => {
    if (!roomName) return;
    send("casinoStart", { roomName, timeLimit, initialBalance: balance });
  };

  const handleBet = (amount: number) => {
    if (!roomName) return;
    send("casinoBetPlace", { roomName, amount });
  };

  const handleResult = (delta: number, gameType: string) => {
    if (!roomName) return;
    send("casinoResult", { roomName, delta, gameType });
  };

  const handleSwitchGame = (game: string | null) => {
    if (!roomName) return;
    send("casinoSwitchGame", { roomName, game });
    setCurrentGame(game);
    if (game !== null) {
      // 게임 진입 시 히스토리 엔트리 추가 → 뒤로가기 = 허브 복귀
      window.history.pushState({ casinoGame: game }, "");
    }
  };

  // 뒤로가기 인터셉트: 게임 오버레이 중이면 허브로 복귀
  useEffect(() => {
    const handlePopState = () => {
      setCurrentGame((prev) => {
        if (prev !== null) {
          send("casinoSwitchGame", { roomName, game: null });
          return null;
        }
        return prev;
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [roomName, send]);

  const handleLoan = (amount: number) => {
    if (!roomName) return;
    send("casinoLoan", { roomName, amount });
  };

  const handleForceEnd = () => {
    if (!roomName) return;
    send("casinoForceEnd", { roomName });
  };

  // ── 게임 컴포넌트 오버레이 ───────────────────────────────────────────
  const renderCurrentGameOverlay = () => {
    if (!currentGame || !gameStarted) return null;

    const commonProps = {
      balance: myBalance,
      initialBalance,
      onBet: handleBet,
      onResult: (delta: number) => handleResult(delta, currentGame),
      onClose: () => handleSwitchGame(null),
    };

    if (currentGame === "videopoker") {
      return <VideoPokerGame {...commonProps} />;
    }

    if (currentGame === "blackjack") {
      return <BlackjackGame {...commonProps} />;
    }

    if (currentGame === "roulette") {
      return <RouletteGame {...commonProps} />;
    }

    if (currentGame === "slots") {
      return <SlotsGame {...commonProps} />;
    }

    if (currentGame === "baccarat") {
      return <BaccaratGame {...commonProps} />;
    }

    if (currentGame === "horseracing") {
      return <HorseRacingGame {...commonProps} />;
    }

    if (currentGame === "mines") {
      return <MinesGame {...commonProps} />;
    }

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.92)",
          borderRadius: 8,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          color: "#f0c040",
          fontSize: "1.1rem",
          fontWeight: 600,
        }}
      >
        <div style={{ fontSize: "2.5rem" }}>🎮</div>
        <div>{currentGame} 게임 준비 중...</div>
        <button
          onClick={() => handleSwitchGame(null)}
          style={{
            marginTop: "1rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            color: "#ccc",
            fontSize: "0.9rem",
            padding: "0.6rem 1.4rem",
            cursor: "pointer",
          }}
        >
          허브로 돌아가기
        </button>
      </div>
    );
  };

  return (
    <RoomLayout
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #c0392b 0%, #8b0000 100%)",
        boxShadow: "0 4px 12px rgba(192,57,43,0.4)",
      }}
      onHelp={() => setShowHelpModal(true)}
      onLeave={leaveRoom}
      send={send}
      subscribe={subscribe}
      playerId={playerId}
      messages={messages}
      inputMessage={inputMessage}
      isChatOpen={isChatOpen}
      hasUnreadMessages={hasUnreadMessages}
      messagesEndRef={messagesEndRef}
      onInputChange={setInputMessage}
      onSendMessage={sendMessage}
      onToggleChat={() => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) setHasUnreadMessages(false);
      }}
      onCloseChat={() => setIsChatOpen(false)}
      modals={
        <CasinoHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      }
    >
      {/* 게임 시작 전: 설정 모달 (roomJoined 받기 전까지 숨김) */}
      {roomJoinedReceived && !gameStarted && !gameOver && (
        <CasinoSetupModal
          isHost={isHost}
          memberCount={memberCount}
          onStart={handleStart}
        />
      )}

      {/* 게임 진행 중: 허브 UI */}
      {gameStarted && (
        <CasinoHub
          myBalance={myBalance}
          initialBalance={initialBalance}
          remainingSeconds={remainingSeconds}
          players={players}
          myPlayerId={playerId}
          onSelectGame={(game) => {
            handleSwitchGame(game);
          }}
          onLoan={handleLoan}
          onForceEnd={handleForceEnd}
          memberCount={memberCount}
          totalLoan={totalLoan}
          isAdmin={isAdmin}
        />
      )}

      {/* 현재 게임 선택 오버레이 */}
      {renderCurrentGameOverlay()}

      {/* 게임 종료 결과 모달 */}
      {gameOver && gameOverData && (
        <CasinoResultModal
          result={gameOverData}
          myPlayerId={playerId}
          onClose={() => {
            setGameOver(false);
            setGameOverData(null);
          }}
        />
      )}

      {deltaFlashes.map((f) => (
        <DeltaFlash key={f.id} $positive={f.value > 0}>
          {f.value > 0 ? `+${f.value.toLocaleString()}` : f.value.toLocaleString()}
        </DeltaFlash>
      ))}
    </RoomLayout>
  );
}
