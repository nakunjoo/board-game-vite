import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import type { Card, PlayerHand } from "../../../types/game";
import { evaluateHand, type HandResult } from "../../../utils/poker";
import { playChipStolenSound } from "../../../utils/audio";
import {
  GangGameBoard,
  GangResultModal,
  GangHelpModal,
  type ChipData,
  type PreviousChipsData,
  type PlayerResult,
} from "../../../components/gang";
import { useRoomBase, type LocationState } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";

export default function GangRoom() {
  const {
    roomName,
    playerId,
    nickname,
    send,
    subscribe,
    gameConfig,
    players,
    memberCount,
    isHost,
    messages,
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
  const { isAdmin } = useAuth();

  const ls = locationState as LocationState & {
    deck?: Card[];
    myHand?: Card[];
    playerHands?: PlayerHand[];
    openCards?: Card[];
    chips?: ChipData[];
    currentStep?: number;
    readyPlayers?: string[];
    previousChips?: Record<string, number[]>;
    winLossRecord?: Record<string, boolean[]>;
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
  const [chips, setChips] = useState<ChipData[]>(() => (ls?.chips as ChipData[]) ?? []);
  const [currentStep, setCurrentStep] = useState(ls?.currentStep ?? 1);
  const [previousChips, setPreviousChips] = useState<PreviousChipsData>(ls?.previousChips ?? {});
  const [readyPlayers, setReadyPlayers] = useState<string[]>(ls?.readyPlayers ?? []);
  const [isReady, setIsReady] = useState(false);
  const [winLossRecord, setWinLossRecord] = useState<Record<string, boolean[]>>(ls?.winLossRecord ?? {});
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [gameFinished, setGameFinished] = useState(ls?.gameFinished ?? false);
  const [showResults, setShowResults] = useState(false);
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>(() => (ls?.lastGameResults as PlayerResult[]) ?? []);
  const [nextRoundReadyPlayers, setNextRoundReadyPlayers] = useState<string[]>([]);
  const [isNextRoundReady, setIsNextRoundReady] = useState(false);
  const [gameOver, setGameOver] = useState(ls?.gameOver ?? false);
  const [gameOverResult, setGameOverResult] = useState<"victory" | "defeat" | null>((ls?.gameOverResult as "victory" | "defeat" | null) ?? null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 갱 전용 소켓 이벤트
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
            chips?: ChipData[];
            currentStep?: number;
            readyPlayers?: string[];
            previousChips?: Record<string, number[]>;
            winLossRecord?: Record<string, boolean[]>;
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
            if (joinData.chips !== undefined) setChips(joinData.chips);
            if (joinData.currentStep !== undefined) setCurrentStep(joinData.currentStep);
            if (joinData.readyPlayers !== undefined) setReadyPlayers(joinData.readyPlayers);
            if (joinData.previousChips !== undefined) setPreviousChips(joinData.previousChips);
            if (joinData.winLossRecord !== undefined) setWinLossRecord(joinData.winLossRecord);
          }
          break;
        }
        case "cardDrawn": {
          const cardData = data as {
            roomName: string;
            card: Card;
            deck: Card[];
            playerNickname: string;
            playerHands: PlayerHand[];
          };
          if (cardData.roomName === roomName) {
            setDeck(cardData.deck);
            setPlayerHands(cardData.playerHands);
            if (cardData.playerNickname === nickname) {
              setMyHand((prev) => [...prev, cardData.card]);
            }
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
            chips?: ChipData[];
            winLossRecord?: Record<string, boolean[]>;
            gameOver?: boolean;
            gameOverResult?: "victory" | "defeat" | null;
          };
          if (gameData.roomName === roomName) {
            setGameStarted(true);
            setDeck(gameData.deck);
            if (gameData.myHand) setMyHand(gameData.myHand);
            if (gameData.playerHands) setPlayerHands(gameData.playerHands);
            if (gameData.openCards) setOpenCards(gameData.openCards);
            if (gameData.chips) setChips(gameData.chips);
            setCurrentStep(1);
            setPreviousChips({});
            setIsReady(false);
            setReadyPlayers([]);
            setGameFinished(false);
            setShowResults(false);
            setPlayerResults([]);
            setNextRoundReadyPlayers([]);
            setIsNextRoundReady(false);
            setGameOver(gameData.gameOver ?? false);
            setGameOverResult(gameData.gameOverResult ?? null);
            if (gameData.winLossRecord !== undefined) setWinLossRecord(gameData.winLossRecord);
          }
          break;
        }
        case "chipSelected": {
          const chipData = data as {
            roomName: string;
            chips: ChipData[];
            readyPlayers?: string[];
            stolenFrom?: string;
            stolenBy?: string;
            stolenFromName?: string;
            stolenByName?: string;
            chipNumber?: number;
          };
          if (chipData.roomName === roomName) {
            if (chipData.stolenFrom && chipData.stolenBy && chipData.chipNumber) {
              const stolenByName = chipData.stolenByName ||
                players.find((p) => p.playerId === chipData.stolenBy)?.nickname || chipData.stolenBy;
              const stolenFromName = chipData.stolenFromName ||
                players.find((p) => p.playerId === chipData.stolenFrom)?.nickname || chipData.stolenFrom;
              setNotification(`${stolenByName}님이 ${stolenFromName}님의 ${chipData.chipNumber}번 칩을 가져갔습니다!`);
              setShowNotification(true);
              if (chipData.stolenFrom === playerId) playChipStolenSound();
              if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
              notificationTimerRef.current = setTimeout(() => setShowNotification(false), 3000);
              if (chipData.stolenFrom === playerId) setIsReady(false);
            }
            setChips(chipData.chips);
            if (chipData.readyPlayers) {
              setReadyPlayers(chipData.readyPlayers);
              if (!chipData.readyPlayers.includes(playerId)) setIsReady(false);
            }
          }
          break;
        }
        case "playerReadyUpdate": {
          const readyData = data as { roomName: string; readyPlayers: string[]; allReady: boolean };
          if (readyData.roomName === roomName) {
            setReadyPlayers(readyData.readyPlayers);
            if (isReady && !readyData.readyPlayers.includes(playerId)) setIsReady(false);
          }
          break;
        }
        case "nextStep": {
          const stepData = data as {
            roomName: string;
            currentStep: number;
            openCards: Card[];
            chips: ChipData[];
            deck: Card[];
            previousChips: PreviousChipsData;
          };
          if (stepData.roomName === roomName) {
            setCurrentStep(stepData.currentStep);
            setOpenCards(stepData.openCards);
            setChips(stepData.chips);
            setDeck(stepData.deck);
            setPreviousChips(stepData.previousChips);
            setIsReady(false);
            setReadyPlayers([]);
          }
          break;
        }
        case "gameFinished": {
          const finishData = data as {
            roomName: string;
            finalChips: ChipData[];
            previousChips: PreviousChipsData;
            openCards: Card[];
            playerResults: PlayerResult[];
            winLossRecord?: Record<string, boolean[]>;
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
            if (finishData.winLossRecord !== undefined) setWinLossRecord(finishData.winLossRecord);
          }
          break;
        }
        case "nextRoundReadyUpdate": {
          const nextRoundData = data as { roomName: string; readyPlayers: string[]; allReady: boolean };
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
  }, [subscribe, roomName, playerId, nickname, players, isReady]);

  const myHandRank: HandResult | null =
    myHand.length > 0 ? evaluateHand(myHand, openCards) : null;

  const handleStartGame = () => {
    if (!roomName || (!isAdmin && memberCount < 3)) return;
    send("startGame", { roomName });
  };
  const handleChipClick = (chipNumber: number) => {
    if (!roomName) return;
    send("selectChip", { roomName, chipNumber });
  };
  const handleReady = () => {
    if (!roomName) return;
    if (!chips.some((c) => c.owner === playerId)) return;
    setIsReady(true);
    send("playerReady", { roomName });
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
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
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
        <GangHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      }
    >
      <GangGameBoard
        gameStarted={gameStarted}
        isHost={isHost}
        memberCount={memberCount}
        currentStep={currentStep}
        players={players}
        playerId={playerId}
        playerHands={playerHands}
        deck={deck}
        openCards={openCards}
        myHand={myHand}
        chips={chips}
        previousChips={previousChips}
        readyPlayers={readyPlayers}
        winLossRecord={winLossRecord}
        notification={notification}
        showNotification={showNotification}
        myHandRank={myHandRank}
        isReady={isReady}
        gameOver={gameOver}
        gameConfig={gameConfig}
        isAdmin={isAdmin}
        onStartGame={handleStartGame}
        onChipClick={handleChipClick}
        onReady={handleReady}
        onKickPlayer={handleKickPlayer}
      />

      {gameFinished && (
        <GangResultModal
          playerResults={playerResults}
          openCards={openCards}
          showResults={showResults}
          isNextRoundReady={isNextRoundReady}
          nextRoundReadyPlayers={nextRoundReadyPlayers}
          memberCount={memberCount}
          gameOver={gameOver}
          gameOverResult={gameOverResult}
          isHost={isHost}
          onClose={() => setShowResults(false)}
          onShowResults={() => setShowResults(true)}
          onNextRound={handleNextRound}
          onRestart={handleRestart}
        />
      )}
    </RoomLayout>
  );
}
