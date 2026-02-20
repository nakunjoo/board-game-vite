import { useEffect, useState } from "react";
import {
  RoomPage,
  RoomHeader,
  RoomInfo,
  MemberCount,
  LeaveButton,
  RoomContent,
} from "../../../styles/pages/Room";
import { GameArea } from "../../../styles/game";
import type { Card, PlayerHand } from "../../../types/game";
import {
  ChatToggleButton,
  ChatToggleButtonWrapper,
  ChatNotificationBadge,
  ChatOverlay,
  ChatArea,
  ChatHeaderMobile,
  ChatCloseButton,
  ChatMessages,
  NoMessages,
  ChatMessage,
  ChatInputArea,
  ChatInput,
  ChatSendButton,
} from "../../../styles/chat";
import SpiceGameBoard from "../../../components/spice/SpiceGameBoard";
import SpiceResultModal from "../../../components/spice/SpiceResultModal";
import SpiceHelpModal from "../../../components/spice/SpiceHelpModal";
import type { PlayerResult } from "../../../components/gang/types";
import { useRoomBase, type LocationState } from "../common/useRoomBase";

export default function SpiceRoom() {
  const {
    roomName,
    playerId,
    send,
    subscribe,
    gameConfig,
    players,
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
    handleKickPlayer,
    locationState,
  } = useRoomBase();

  const ls = locationState as LocationState & {
    deck?: Card[];
    myHand?: Card[];
    playerHands?: PlayerHand[];
    openCards?: Card[];
    gameStarted?: boolean;
    gameFinished?: boolean;
    gameOver?: boolean;
    gameOverResult?: "victory" | "defeat" | null;
    lastGameResults?: PlayerResult[];
  } | null;

  const [deck, setDeck] = useState<Card[]>(() => (ls?.deck as Card[]) ?? []);
  const [myHand, setMyHand] = useState<Card[]>(() => (ls?.myHand as Card[]) ?? []);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>(() => (ls?.playerHands as PlayerHand[]) ?? []);
  const [gameStarted, setGameStarted] = useState(ls?.gameStarted ?? false);
  const [openCards, setOpenCards] = useState<Card[]>(() => (ls?.openCards as Card[]) ?? []);
  const [notification] = useState("");
  const [showNotification] = useState(false);
  const [gameFinished, setGameFinished] = useState(ls?.gameFinished ?? false);
  const [showResults, setShowResults] = useState(false);
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>(() => (ls?.lastGameResults as PlayerResult[]) ?? []);
  const [nextRoundReadyPlayers, setNextRoundReadyPlayers] = useState<string[]>([]);
  const [isNextRoundReady, setIsNextRoundReady] = useState(false);
  const [gameOver, setGameOver] = useState(ls?.gameOver ?? false);
  const [gameOverResult, setGameOverResult] = useState<"victory" | "defeat" | null>((ls?.gameOverResult as "victory" | "defeat" | null) ?? null);

  // 선뽑기 상태
  const [isFirstDraw, setIsFirstDraw] = useState(false);
  const [myDrawnNumber, setMyDrawnNumber] = useState<number | null>(null);
  const [firstDrawResults, setFirstDrawResults] = useState<Record<string, number>>({});
  const [firstDrawFinished, setFirstDrawFinished] = useState(false);
  const [firstPlayerId, setFirstPlayerId] = useState<string | null>(null);
  const [firstNickname, setFirstNickname] = useState<string | null>(null);
  const [drawnCount, setDrawnCount] = useState(0);

  // 턴 상태
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [currentSuit, setCurrentSuit] = useState<string | null>(null);
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [tableStackSize, setTableStackSize] = useState(0);

  // 트로피 상태 (playerId → 트로피 수)
  const [trophies, setTrophies] = useState<Record<string, number>>({});

  // 획득 카드 수 (playerId → 획득한 카드 수)
  const [wonCardCounts, setWonCardCounts] = useState<Record<string, number>>({});

  // 스파이스 게임 종료 메타 (점수 기반 결과)
  const [spiceGameOverMeta, setSpiceGameOverMeta] = useState<{
    reason: 'trophy' | 'deck';
    winnerIds: string[];
    winnerNicknames: string[];
    maxScore: number;
  } | null>(null);

  // 도전 페이즈 상태
  const [challengePhase, setChallengePhase] = useState<{
    playerId: string;
    nickname: string;
    declaredSuit: string;
    declaredNumber: number;
  } | null>(null);
  const [challengeResult, setChallengeResult] = useState<{
    challengerNickname: string;
    targetNickname: string;
    challengeType: 'number' | 'suit';
    challengeSuccess: boolean;
    winnerId: string;
    loserId: string;
    playedCard: Card;
    declaredSuit: string;
    declaredNumber: number;
  } | null>(null);

  // 향신료 전용 소켓 이벤트
  useEffect(() => {
    const unsubscribe = subscribe((event, data) => {
      switch (event) {
        case "roomCreated":
        case "roomJoined": {
          const joinData = data as {
            name: string;
            deck?: Card[];
            playerHands?: PlayerHand[];
            myHand?: Card[];
            gameStarted?: boolean;
            gameFinished?: boolean;
            lastGameResults?: PlayerResult[];
            gameOver?: boolean;
            gameOverResult?: "victory" | "defeat" | null;
            openCards?: Card[];
            // Spice 재연결 상태
            currentTurnPlayerId?: string | null;
            currentSuit?: string | null;
            currentNumber?: number;
            tableStackSize?: number;
            trophies?: Record<string, number>;
            challengePhase?: {
              playerId: string;
              nickname: string;
              declaredSuit: string;
              declaredNumber: number;
            } | null;
          };
          if (joinData.name === roomName) {
            if (joinData.deck && joinData.deck.length > 0) setDeck(joinData.deck);
            if (joinData.playerHands) setPlayerHands(joinData.playerHands);
            if (joinData.myHand && joinData.myHand.length > 0) setMyHand(joinData.myHand);
            if (joinData.gameStarted !== undefined) setGameStarted(joinData.gameStarted);
            if (joinData.gameFinished !== undefined) setGameFinished(joinData.gameFinished);
            if (joinData.lastGameResults !== undefined) setPlayerResults(joinData.lastGameResults);
            if (joinData.gameOver !== undefined) setGameOver(joinData.gameOver);
            if (joinData.gameOverResult !== undefined) setGameOverResult(joinData.gameOverResult);
            if (joinData.openCards) setOpenCards(joinData.openCards);
            // Spice 게임 진행 중 재연결 시 상태 복원
            if (joinData.currentTurnPlayerId !== undefined) setCurrentTurnPlayerId(joinData.currentTurnPlayerId);
            if (joinData.currentSuit !== undefined) setCurrentSuit(joinData.currentSuit);
            if (joinData.currentNumber !== undefined) setCurrentNumber(joinData.currentNumber);
            if (joinData.tableStackSize !== undefined) setTableStackSize(joinData.tableStackSize);
            if (joinData.trophies !== undefined) setTrophies(joinData.trophies);
            if (joinData.challengePhase !== undefined) setChallengePhase(joinData.challengePhase);
          }
          break;
        }
        case "firstDrawStarted": {
          const drawData = data as { roomName: string };
          if (drawData.roomName === roomName) {
            // 게임 결과 화면 리셋
            setGameFinished(false);
            setShowResults(false);
            setGameOver(false);
            setGameOverResult(null);
            setGameStarted(false);
            setSpiceGameOverMeta(null);
            setPlayerResults([]);
            setNextRoundReadyPlayers([]);
            setIsNextRoundReady(false);
            setChallengePhase(null);
            setChallengeResult(null);
            setWonCardCounts({});
            setTrophies({});
            setCurrentTurnPlayerId(null);
            setCurrentSuit(null);
            setCurrentNumber(0);
            setTableStackSize(0);
            // 선뽑기 상태
            setIsFirstDraw(true);
            setMyDrawnNumber(null);
            setFirstDrawResults({});
            setFirstDrawFinished(false);
            setFirstPlayerId(null);
            setFirstNickname(null);
            setDrawnCount(0);
          }
          break;
        }
        case "firstDrawResult": {
          const resultData = data as {
            roomName: string;
            drawnNumber: number;
            drawnCount: number;
            totalCount: number;
          };
          if (resultData.roomName === roomName) {
            setMyDrawnNumber(resultData.drawnNumber);
            setDrawnCount(resultData.drawnCount);
          }
          break;
        }
        case "firstDrawProgress": {
          const progressData = data as {
            roomName: string;
            drawnCount: number;
            totalCount: number;
          };
          if (progressData.roomName === roomName) {
            setDrawnCount(progressData.drawnCount);
          }
          break;
        }
        case "firstDrawFinished": {
          const finishedData = data as {
            roomName: string;
            results: Record<string, number>;
            firstPlayerId: string;
            firstNickname: string;
          };
          if (finishedData.roomName === roomName) {
            setFirstDrawResults(finishedData.results);
            setFirstDrawFinished(true);
            setFirstPlayerId(finishedData.firstPlayerId);
            setFirstNickname(finishedData.firstNickname);
          }
          break;
        }
        case "gameStarted": {
          const gameData = data as {
            roomName: string;
            deck: Card[];
            myHand?: Card[];
            playerHands?: PlayerHand[];
            openCards?: Card[];
            gameOver?: boolean;
            gameOverResult?: "victory" | "defeat" | null;
            currentTurnPlayerId?: string;
            currentSuit?: string | null;
            currentNumber?: number;
            trophies?: Record<string, number>;
          };
          if (gameData.roomName === roomName) {
            // 선뽑기 상태 초기화
            setIsFirstDraw(false);
            setMyDrawnNumber(null);
            setFirstDrawResults({});
            setFirstDrawFinished(false);
            setFirstPlayerId(null);
            setFirstNickname(null);
            setDrawnCount(0);
            setGameStarted(true);
            setDeck(gameData.deck);
            if (gameData.myHand) setMyHand(gameData.myHand);
            if (gameData.playerHands) setPlayerHands(gameData.playerHands);
            if (gameData.openCards) setOpenCards(gameData.openCards);
            setGameFinished(false);
            setShowResults(false);
            setPlayerResults([]);
            setNextRoundReadyPlayers([]);
            setIsNextRoundReady(false);
            setGameOver(gameData.gameOver ?? false);
            setGameOverResult(gameData.gameOverResult ?? null);
            setCurrentTurnPlayerId(gameData.currentTurnPlayerId ?? null);
            setCurrentSuit(gameData.currentSuit ?? null);
            setCurrentNumber(gameData.currentNumber ?? 0);
            setTableStackSize(0);
            setTrophies(gameData.trophies ?? {});
            setSpiceGameOverMeta(null);
          }
          break;
        }
        case "cardPlayed":
        case "cardPassed": {
          const cardData = data as {
            roomName: string;
            playerHands?: PlayerHand[];
            currentTurnPlayerId: string;
            currentSuit: string | null;
            currentNumber: number;
            tableStackSize: number;
            deck: Card[];
          };
          if (cardData.roomName === roomName) {
            if (cardData.playerHands) setPlayerHands(cardData.playerHands);
            setCurrentTurnPlayerId(cardData.currentTurnPlayerId);
            setCurrentSuit(cardData.currentSuit);
            setCurrentNumber(cardData.currentNumber);
            setTableStackSize(cardData.tableStackSize);
            setDeck(cardData.deck);
            // 새 턴 시작 시 도전 결과 표식 초기화
            setChallengeResult(null);
          }
          break;
        }
        case "myHandUpdate": {
          const handData = data as { roomName: string; myHand: Card[] };
          if (handData.roomName === roomName) {
            setMyHand(handData.myHand);
          }
          break;
        }
        case "challengePhase": {
          const cpData = data as {
            roomName: string;
            playerId: string;
            nickname: string;
            declaredSuit: string;
            declaredNumber: number;
            playerHands?: PlayerHand[];
            deck: Card[];
          };
          if (cpData.roomName === roomName) {
            if (cpData.playerHands) setPlayerHands(cpData.playerHands);
            setDeck(cpData.deck);
            setChallengePhase({
              playerId: cpData.playerId,
              nickname: cpData.nickname,
              declaredSuit: cpData.declaredSuit,
              declaredNumber: cpData.declaredNumber,
            });
            setChallengeResult(null);
            setMessages((prev) => [
              ...prev,
              {
                message: `🃏 ${cpData.nickname}이(가) [${cpData.declaredSuit}] ${cpData.declaredNumber}을(를) 선언했습니다`,
                isSystem: true,
              },
            ]);
          }
          break;
        }
        case "challengeExpired": {
          const ceData = data as {
            roomName: string;
            currentTurnPlayerId: string;
            currentSuit: string;
            currentNumber: number;
            tableStackSize: number;
            playerHands?: PlayerHand[];
            deck: Card[];
            trophyAwarded?: { playerId: string; nickname: string; trophyCount: number };
            trophies?: Record<string, number>;
            wonCardCounts?: Record<string, number>;
          };
          if (ceData.roomName === roomName) {
            setChallengePhase(null);
            setCurrentTurnPlayerId(ceData.currentTurnPlayerId);
            setCurrentSuit(ceData.currentSuit);
            setCurrentNumber(ceData.currentNumber);
            setTableStackSize(ceData.tableStackSize);
            if (ceData.playerHands) setPlayerHands(ceData.playerHands);
            setDeck(ceData.deck);
            if (ceData.trophies) setTrophies(ceData.trophies);
            if (ceData.wonCardCounts) setWonCardCounts(ceData.wonCardCounts);
            // 도전 결과 초기화 (새 턴 시작)
            setChallengeResult(null);
          }
          break;
        }
        case "challengeResult": {
          const crData = data as {
            roomName: string;
            challengerId: string;
            challengerNickname: string;
            targetPlayerId: string;
            targetNickname: string;
            challengeType: 'number' | 'suit';
            challengeSuccess: boolean;
            winnerId: string;
            loserId: string;
            playedCard: Card;
            declaredSuit: string;
            declaredNumber: number;
            playerHands?: PlayerHand[];
            currentTurnPlayerId: string;
            currentSuit: string | null;
            currentNumber: number;
            tableStackSize: number;
            deck: Card[];
            trophyAwarded?: { playerId: string; nickname: string; trophyCount: number };
            trophies?: Record<string, number>;
            wonCardCounts?: Record<string, number>;
          };
          if (crData.roomName === roomName) {
            setChallengePhase(null);
            // 패 수 변경은 즉시 반영
            if (crData.playerHands) setPlayerHands(crData.playerHands);
            if (crData.trophies) setTrophies(crData.trophies);
            if (crData.wonCardCounts) setWonCardCounts(crData.wonCardCounts);
            setDeck(crData.deck);
            // 결과 카드 표시
            setChallengeResult({
              challengerNickname: crData.challengerNickname,
              targetNickname: crData.targetNickname,
              challengeType: crData.challengeType,
              challengeSuccess: crData.challengeSuccess,
              winnerId: crData.winnerId,
              loserId: crData.loserId,
              playedCard: crData.playedCard,
              declaredSuit: crData.declaredSuit,
              declaredNumber: crData.declaredNumber,
            });
            setMessages((prev) => [
              ...prev,
              {
                message: `⚔️ ${crData.challengerNickname}이(가) ${crData.challengeType === 'number' ? '숫자' : '향신료'} 도전 → ${crData.challengeSuccess ? '성공' : '실패'}! (${crData.challengeSuccess ? crData.challengerNickname : crData.targetNickname} 승리)`,
                isSystem: true,
              },
            ]);
            // 3초 후 모달 닫고 다음 턴으로 전환
            setTimeout(() => {
              setChallengeResult(null);
              setCurrentTurnPlayerId(crData.currentTurnPlayerId);
              setCurrentSuit(crData.currentSuit);
              setCurrentNumber(crData.currentNumber);
              setTableStackSize(crData.tableStackSize);
            }, 3000);
          }
          break;
        }
        case "spiceGameOver": {
          const soData = data as {
            roomName: string;
            reason: 'trophy' | 'deck';
            trophies: Record<string, number>;
            playerResults: {
              playerId: string;
              nickname: string;
              hand: Card[];
              trophyCount: number;
              wonCardCount: number;
              score: number;
            }[];
            winnerIds: string[];
            winnerNicknames: string[];
            maxScore: number;
          };
          if (soData.roomName === roomName) {
            setTrophies(soData.trophies);
            setGameOver(true);
            setGameOverResult('victory');
            setGameStarted(false);
            setGameFinished(true);
            setShowResults(true);
            setPlayerResults(soData.playerResults.map((r) => ({
              playerId: r.playerId,
              nickname: r.nickname,
              hand: r.hand,
              chips: [],
              // 점수 정보 확장 필드 (결과 모달에서 활용)
              trophyCount: r.trophyCount,
              wonCardCount: r.wonCardCount,
              score: r.score,
            })));
            setSpiceGameOverMeta({
              reason: soData.reason,
              winnerIds: soData.winnerIds,
              winnerNicknames: soData.winnerNicknames,
              maxScore: soData.maxScore,
            });
          }
          break;
        }
        case "gameFinished": {
          const finishData = data as {
            roomName: string;
            openCards: Card[];
            playerResults: PlayerResult[];
            gameOver?: boolean;
            gameOverResult?: "victory" | "defeat" | null;
          };
          if (finishData.roomName === roomName) {
            if (finishData.gameOver === true) {
              setGameStarted(false);
              setGameOver(true);
              setGameOverResult(finishData.gameOverResult ?? null);
            }
            setGameFinished(true);
            setShowResults(true);
            setPlayerResults(finishData.playerResults);
            setOpenCards(finishData.openCards);
          }
          break;
        }
        case "nextRoundReadyUpdate": {
          const nextRoundData = data as {
            roomName: string;
            readyPlayers: string[];
            allReady: boolean;
          };
          if (nextRoundData.roomName === roomName) {
            setNextRoundReadyPlayers(nextRoundData.readyPlayers);
            if (nextRoundData.allReady) {
              setNextRoundReadyPlayers([]);
              setIsNextRoundReady(false);
            }
          }
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName]);

  const handleStartGame = () => {
    if (!roomName) return;
    send("startGame", { roomName });
  };
  const handleDrawFirstCard = () => {
    if (!roomName || myDrawnNumber !== null) return;
    send("drawFirstCard", { roomName });
  };
  const handlePlayCard = (cardIndex: number, declaredSuit: string, declaredNumber: number) => {
    if (!roomName) return;
    send("playCard", { roomName, cardIndex, declaredSuit, declaredNumber });
  };
  const handlePass = () => {
    if (!roomName) return;
    send("pass", { roomName });
  };
  const handleChallenge = (challengeType: 'number' | 'suit') => {
    if (!roomName) return;
    send("challenge", { roomName, challengeType });
  };
  const handleNextRound = () => {
    if (!roomName || isNextRoundReady) return;
    setIsNextRoundReady(true);
    send("readyNextRound", { roomName });
  };
  const handleRestart = () => {
    if (!roomName) return;
    handleStartGame();
  };

  return (
    <RoomPage>
      <RoomHeader>
        <h1>
          {roomName}{" "}
          <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 400 }}>
            {gameConfig.displayName}
          </span>
        </h1>
        <RoomInfo>
          <div
            style={{
              background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              width: "22px",
              height: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              transition: "all 0.3s",
            }}
            onClick={() => setShowHelpModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(243, 156, 18, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="게임 설명 보기"
          >
            ?
          </div>
          <MemberCount>{memberCount}명 참여중</MemberCount>
          <LeaveButton onClick={leaveRoom} aria-label="나가기">
            <span className="leave-text">나가기</span>
            <svg
              className="leave-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </LeaveButton>
        </RoomInfo>
      </RoomHeader>

      <RoomContent>
        <GameArea>
          <SpiceGameBoard
            gameStarted={gameStarted}
            isHost={isHost}
            memberCount={memberCount}
            players={players}
            playerId={playerId}
            playerHands={playerHands}
            deck={deck}
            openCards={openCards}
            myHand={myHand}
            notification={notification}
            showNotification={showNotification}
            gameOver={gameOver}
            gameConfig={gameConfig}
            onStartGame={handleStartGame}
            onKickPlayer={handleKickPlayer}
            isFirstDraw={isFirstDraw}
            myDrawnNumber={myDrawnNumber}
            firstDrawResults={firstDrawResults}
            firstDrawFinished={firstDrawFinished}
            firstPlayerId={firstPlayerId}
            firstNickname={firstNickname}
            drawnCount={drawnCount}
            onDrawFirstCard={handleDrawFirstCard}
            currentTurnPlayerId={currentTurnPlayerId}
            currentSuit={currentSuit}
            currentNumber={currentNumber}
            tableStackSize={tableStackSize}
            onPlayCard={handlePlayCard}
            onPass={handlePass}
            challengePhase={challengePhase}
            challengeResult={challengeResult}
            onChallenge={handleChallenge}
            trophies={trophies}
            wonCardCounts={wonCardCounts}
          />
          <ChatToggleButtonWrapper>
            <ChatToggleButton
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (!isChatOpen) setHasUnreadMessages(false);
              }}
              aria-label="채팅"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </ChatToggleButton>
            {hasUnreadMessages && !isChatOpen && <ChatNotificationBadge />}
          </ChatToggleButtonWrapper>

          {gameFinished && (
            <SpiceResultModal
              playerResults={playerResults}
              openCards={openCards}
              showResults={showResults}
              isNextRoundReady={isNextRoundReady}
              nextRoundReadyPlayers={nextRoundReadyPlayers}
              memberCount={memberCount}
              gameOver={gameOver}
              gameOverResult={gameOverResult}
              isHost={isHost}
              spiceGameOverMeta={spiceGameOverMeta}
              onClose={() => setShowResults(false)}
              onShowResults={() => setShowResults(true)}
              onNextRound={handleNextRound}
              onRestart={handleRestart}
            />
          )}
        </GameArea>

        <ChatOverlay $isOpen={isChatOpen} onClick={() => setIsChatOpen(false)} />

        <ChatArea $isOpen={isChatOpen}>
          <ChatHeaderMobile>
            <span>채팅</span>
            <ChatCloseButton onClick={() => setIsChatOpen(false)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </ChatCloseButton>
          </ChatHeaderMobile>
          <ChatMessages>
            {messages.length === 0 ? (
              <NoMessages>메시지가 없습니다.</NoMessages>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage key={index} $isSystem={msg.isSystem}>
                  {msg.message}
                </ChatMessage>
              ))
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>
          <ChatInputArea>
            <ChatInput
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지 입력..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <ChatSendButton onClick={sendMessage} disabled={!inputMessage.trim()}>
              전송
            </ChatSendButton>
          </ChatInputArea>
        </ChatArea>
      </RoomContent>

      <SpiceHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </RoomPage>
  );
}
