import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import type { Card, PlayerHand, PlayerResult } from "../../../types/game";
import SpiceGameBoard from "../../../components/spice/SpiceGameBoard";
import SpiceResultModal from "../../../components/spice/SpiceResultModal";
import SpiceHelpModal from "../../../components/spice/SpiceHelpModal";
import { useRoomBase, type LocationState } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";

// 다른 사람이 먼저 도전해 페이즈가 닫힌 뒤 내 도전이 도착한 경우.
// 경합에서 진 것뿐이라 alert를 띄울 이유가 없다.
// (모듈 스코프 상수 — 매 렌더 새 배열이 만들어지지 않도록)
const SILENT_ERRORS = ["도전 페이즈가 아닙니다"];

export default function SpiceRoom() {
  const {
    reconnecting,
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
  } = useRoomBase({ silentErrors: SILENT_ERRORS });
  const { isAdmin } = useAuth();

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
    reason: 'trophy' | 'deck' | 'playerLeft';
    winnerIds: string[];
    winnerNicknames: string[];
    maxScore: number;
  } | null>(null);

  // 재연결 시 타이머 복원값 (한 번 소비 후 null로 초기화됨)
  const [reconnectTurnTimeLeft, setReconnectTurnTimeLeft] = useState<number | null>(null);
  const [reconnectChallengeTimeLeft, setReconnectChallengeTimeLeft] = useState<number | null>(null);

  // 도전 페이즈 상태
  const [challengePhase, setChallengePhase] = useState<{
    playerId: string;
    nickname: string;
    declaredSuit: string;
    declaredNumber: number;
    timeLimitMs?: number;
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
  // 한 도전 페이즈당 도전은 한 번만 전송 (연타/중복 터치 방지)
  // ref: 같은 tick 안의 연타까지 막는 동기 가드, state: 버튼 비활성화용
  const challengeSentRef = useRef(false);
  const [challengeSent, setChallengeSent] = useState(false);
  // 서버가 이미 페이즈를 닫았음을 알게 된 시점 (버튼 즉시 비활성화)
  const [challengeClosed, setChallengeClosed] = useState(false);

  // 도전 페이즈마다 1씩 증가. challengeExpired 뒤 1.1초 지연 클리어가
  // 그 사이 시작된 '다음' 페이즈를 지우지 않도록 어느 페이즈인지 확인하는 용도
  const challengePhaseSeqRef = useRef(0);

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
            wonCardCounts?: Record<string, number>;
            challengePhase?: {
              playerId: string;
              nickname: string;
              declaredSuit: string;
              declaredNumber: number;
            } | null;
            // 재연결 시 타이머 복원
            turnTimeLeft?: number | null;
            challengeTimeLeft?: number | null;
            // 선뽑기 재연결 상태
            isFirstDraw?: boolean;
            myDrawnNumber?: number | null;
            drawnCount?: number;
            firstDrawFinished?: boolean;
            firstDrawResults?: Record<string, number>;
            firstPlayerId?: string | null;
            firstNickname?: string | null;
            spiceGameOverMeta?: {
              reason: 'trophy' | 'deck' | 'playerLeft';
              winnerIds: string[];
              winnerNicknames: string[];
              maxScore: number;
            };
          };
          if (joinData.name === roomName) {
            if (joinData.spiceGameOverMeta) setSpiceGameOverMeta(joinData.spiceGameOverMeta);
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
            if (joinData.wonCardCounts !== undefined) setWonCardCounts(joinData.wonCardCounts);
            if (joinData.challengePhase !== undefined) setChallengePhase(joinData.challengePhase);
            // 타이머 복원 (새로고침 시 남은 초)
            if (joinData.turnTimeLeft != null) setReconnectTurnTimeLeft(joinData.turnTimeLeft);
            if (joinData.challengeTimeLeft != null) setReconnectChallengeTimeLeft(joinData.challengeTimeLeft);
            // 선뽑기 단계 재연결 시 상태 복원
            if (joinData.isFirstDraw !== undefined) setIsFirstDraw(joinData.isFirstDraw);
            if (joinData.myDrawnNumber !== undefined) setMyDrawnNumber(joinData.myDrawnNumber);
            if (joinData.drawnCount !== undefined) setDrawnCount(joinData.drawnCount);
            if (joinData.firstDrawFinished !== undefined) setFirstDrawFinished(joinData.firstDrawFinished);
            if (joinData.firstDrawResults !== undefined) setFirstDrawResults(joinData.firstDrawResults);
            if (joinData.firstPlayerId !== undefined) setFirstPlayerId(joinData.firstPlayerId);
            if (joinData.firstNickname !== undefined) setFirstNickname(joinData.firstNickname);
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
        case "firstDrawCancelled": {
          if ((data as { roomName: string }).roomName === roomName) {
            setIsFirstDraw(false);
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
        // 한 발 늦은 도전 — 만료됐거나 남이 먼저 도전했다.
        // 내 잘못이 아니니 alert 없이 버튼만 잠근다.
        case "challengeTooLate": {
          setChallengeClosed(true);
          break;
        }
        case "cardPassed": {
          const cardData = data as {
            roomName: string;
            playerHands?: PlayerHand[];
            currentTurnPlayerId: string;
            currentSuit: string | null;
            currentNumber: number;
            tableStackSize: number;
            deck: Card[];
            nickname?: string;
            auto?: boolean; // 서버가 턴 시간 초과로 자동 패스한 경우
          };
          if (cardData.roomName === roomName) {
            if (cardData.auto && cardData.nickname) {
              setMessages((prev) => [
                ...prev,
                { message: `⏰ ${cardData.nickname}님 시간 초과 — 자동 패스`, isSystem: true },
              ]);
            }
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
            challengeTimeLimitMs?: number;
          };
          if (cpData.roomName === roomName) {
            if (cpData.playerHands) setPlayerHands(cpData.playerHands);
            setDeck(cpData.deck);
            setChallengePhase({
              playerId: cpData.playerId,
              nickname: cpData.nickname,
              declaredSuit: cpData.declaredSuit,
              declaredNumber: cpData.declaredNumber,
              timeLimitMs: cpData.challengeTimeLimitMs,
            });
            setChallengeResult(null);
            // 새 페이즈 → 도전 가드 해제
            challengeSentRef.current = false;
            setChallengeSent(false);
            setChallengeClosed(false);
            challengePhaseSeqRef.current += 1;
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
            setCurrentTurnPlayerId(ceData.currentTurnPlayerId);
            setCurrentSuit(ceData.currentSuit);
            setCurrentNumber(ceData.currentNumber);
            setTableStackSize(ceData.tableStackSize);
            if (ceData.playerHands) setPlayerHands(ceData.playerHands);
            setDeck(ceData.deck);
            if (ceData.trophies) setTrophies(ceData.trophies);
            if (ceData.wonCardCounts) setWonCardCounts(ceData.wonCardCounts);
            setChallengeResult(null);
            // 서버는 이미 페이즈를 닫았다 → 버튼은 즉시 막는다.
            // (오버레이 자체는 도전 타이머가 0을 표시할 시간(1틱)을 준 뒤 클리어)
            setChallengeClosed(true);
            const expiredSeq = challengePhaseSeqRef.current;
            setTimeout(() => {
              // 1.1초 안에 다음 페이즈가 시작됐으면 그 페이즈는 건드리지 않는다
              if (challengePhaseSeqRef.current === expiredSeq) setChallengePhase(null);
            }, 1100);
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
            // 누군가 먼저 도전에 성공했다 → 이 페이즈는 닫힘
            setChallengeClosed(true);
            if (crData.playerHands) setPlayerHands(crData.playerHands);
            if (crData.trophies) setTrophies(crData.trophies);
            if (crData.wonCardCounts) setWonCardCounts(crData.wonCardCounts);
            setDeck(crData.deck);
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
            reason: 'trophy' | 'deck' | 'playerLeft';
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
    // 한 페이즈당 한 번만. 연타/중복 터치의 두 번째 요청은 서버에서
    // '도전 페이즈가 아닙니다'로 튕겨 나와 alert가 뜨므로 여기서 차단한다.
    if (challengeSentRef.current || challengeClosed) return;
    challengeSentRef.current = true;
    setChallengeSent(true);
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
    <RoomLayout
      reconnecting={reconnecting}
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
        boxShadow: "0 4px 12px rgba(243, 156, 18, 0.4)",
      }}
      onHelp={() => setShowHelpModal(true)}
      onLeave={leaveRoom}
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
        <SpiceHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      }
    >
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
        challengeDisabled={challengeSent || challengeClosed}
        trophies={trophies}
        wonCardCounts={wonCardCounts}
        reconnectTurnTimeLeft={reconnectTurnTimeLeft}
        reconnectChallengeTimeLeft={reconnectChallengeTimeLeft}
        onReconnectTimeLeftConsumed={() => {
          setReconnectTurnTimeLeft(null);
          setReconnectChallengeTimeLeft(null);
        }}
        isAdmin={isAdmin}
      />

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
    </RoomLayout>
  );
}
