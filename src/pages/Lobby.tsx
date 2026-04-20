import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket, getPlayerIdForRoom, getNicknameForRoom, setNicknameForRoom } from "../contexts/WebSocketContext";
import { useAuth } from "../contexts/AuthContext";
import {
  ModalOverlay,
  ModalContent,
  ModalInput,
  RadioGroup,
  RadioOptions,
  RadioOption,
  ModalButtons,
  ModalButton,
  CheckboxOption,
  ModalTabs,
  ModalTab,
  SingleGameList,
  SingleGameItem,
} from "../styles/pages/Lobby";

const SINGLE_GAMES = [
  { value: "slide-puzzle", label: "슬라이드 퍼즐", icon: "🧩", desc: "타일을 밀어 순서대로 맞추세요" },
  { value: "minesweeper", label: "지뢰찾기", icon: "💣", desc: "지뢰를 피해 모든 칸을 열어보세요" },
];

interface Room {
  name: string;
  memberCount: number;
  gameStarted?: boolean;
  isPrivate?: boolean;
  gameType?: string;
}

const GAME_TYPES = [
  { value: "gang", label: "갱스터" },
  { value: "spice", label: "향신료" },
  { value: "skulking", label: "스컬킹" },
];

type ModalMode = "create" | "join";
type JoinStep = "password" | "nickname";
type CreateTab = "multi" | "single";

export default function Lobby() {
  const { connected, send, subscribe } = useWebSocket();
  const { user, signOut } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [newRoomName, setNewRoomName] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [gameType, setGameType] = useState("gang");
  const [joinTargetRoom, setJoinTargetRoom] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [joinTargetIsPrivate, setJoinTargetIsPrivate] = useState(false);
  const [joinStep, setJoinStep] = useState<JoinStep>("password");
  const [createTab, setCreateTab] = useState<CreateTab>("multi");
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      send("getRooms");
    }
  }, [connected, send]);

  useEffect(() => {
    const unsubscribe = subscribe((event, data) => {
      switch (event) {
        case "roomList":
          setRooms((data as { rooms: Room[] }).rooms);
          break;
        case "roomCreated":
        case "roomJoined": {
          const joinData = data as {
            name: string;
            memberCount?: number;
            players?: { playerId: string; nickname: string; order: number }[];
            gameType?: string;
            deck?: unknown[];
            myHand?: unknown[];
            playerHands?: unknown[];
            openCards?: unknown[];
            chips?: unknown[];
            currentStep?: number;
            readyPlayers?: string[];
            previousChips?: Record<string, number[]>;
            winLossRecord?: Record<string, boolean[]>;
            gameStarted?: boolean;
            gameFinished?: boolean;
            gameOver?: boolean;
            gameOverResult?: string | null;
            lastGameResults?: unknown[];
            hostPlayerId?: string;
            hostNickname?: string;
          };
          navigate(`/room/${joinData.name}`, {
            state: joinData,
          });
          break;
        }
        case "userJoined":
        case "userLeft":
          send("getRooms");
          break;
        case "passwordVerified": {
          const verifyData = data as { name: string; success: boolean };
          if (verifyData.success) {
            setJoinStep("nickname");
          } else {
            setError("비밀번호가 일치하지 않습니다");
            setTimeout(() => setError(null), 3000);
          }
          break;
        }
        case "error":
          setError((data as { message: string }).message);
          setTimeout(() => setError(null), 3000);
          break;
      }
    });
    return unsubscribe;
  }, [subscribe, navigate, send]);

  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      send("getRooms");
    }, 3000);
    return () => clearInterval(interval);
  }, [connected, send]);

  const resolveNickname = (roomName: string): string => {
    if (nicknameInput.trim()) {
      setNicknameForRoom(roomName, nicknameInput.trim());
      return nicknameInput.trim();
    }
    return getNicknameForRoom(roomName);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setNewRoomName("");
    setNicknameInput("");
    setGameType("gang");
    setIsPrivate(false);
    setPasswordInput("");
    setCreateTab("multi");
    setShowModal(true);
  };

  const openJoinModal = (name: string, gameStarted?: boolean, isPrivateRoom?: boolean) => {
    if (gameStarted) {
      setError("이미 게임이 시작된 방입니다");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setModalMode("join");
    setJoinTargetRoom(name);
    setJoinTargetIsPrivate(isPrivateRoom || false);
    setJoinStep(isPrivateRoom ? "password" : "nickname");
    setNicknameInput("");
    setPasswordInput("");
    setShowModal(true);
  };

  const createRoom = () => {
    if (isPrivate && !passwordInput.trim()) {
      setError("비밀번호를 입력해주세요");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const effectiveRoomName = newRoomName.trim() || `${nicknameInput.trim() || '플레이어'}의방`;
    const pid = getPlayerIdForRoom(effectiveRoomName);
    const nick = resolveNickname(effectiveRoomName);
    const roomData: { name: string; playerId: string; nickname: string; gameType: string; password?: string } = {
      name: effectiveRoomName,
      playerId: pid,
      nickname: nick,
      gameType,
    };
    if (isPrivate && passwordInput.trim()) {
      roomData.password = passwordInput.trim();
    }
    send("createRoom", roomData);
    setShowModal(false);
  };

  const joinRoom = () => {
    if (joinTargetIsPrivate && !passwordInput.trim()) {
      setError("비밀번호를 입력해주세요");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const pid = getPlayerIdForRoom(joinTargetRoom);
    const nick = resolveNickname(joinTargetRoom);
    const joinData: { name: string; playerId: string; nickname: string; password?: string } = {
      name: joinTargetRoom,
      playerId: pid,
      nickname: nick,
    };
    if (joinTargetIsPrivate && passwordInput.trim()) {
      joinData.password = passwordInput.trim();
    }
    send("joinRoom", joinData);
    setShowModal(false);
  };

  const handleConfirm = () => {
    if (modalMode === "create") {
      createRoom();
    } else if (joinTargetIsPrivate && joinStep === "password") {
      if (!passwordInput.trim()) {
        setError("비밀번호를 입력해주세요");
        setTimeout(() => setError(null), 3000);
        return;
      }
      send("verifyPassword", { name: joinTargetRoom, password: passwordInput.trim() });
    } else {
      joinRoom();
    }
  };

  const isConfirmDisabled = modalMode === "create" && createTab === "multi" && !connected;

  return (
    <div className="lobby">
      <h1>BOBOGANG</h1>

      {user && (
        <div ref={profileRef} style={{ position: "fixed", top: 16, right: 20, zIndex: 100 }}>
          <div
            onClick={() => setShowProfileMenu((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: "5px 12px 5px 6px", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#646cff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700 }}>
                {(user.user_metadata?.name || user.email || "?")[0].toUpperCase()}
              </div>
            )}
            <span style={{ color: "#eee", fontSize: "0.85rem", fontWeight: 500 }}>
              {user.user_metadata?.name || user.email?.split("@")[0] || "유저"}
            </span>
          </div>

          {showProfileMenu && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 0", minWidth: 130, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
              <button
                onClick={() => { signOut(); setShowProfileMenu(false); }}
                style={{ width: "100%", background: "none", border: "none", color: "#ff6b6b", padding: "10px 16px", textAlign: "left", cursor: "pointer", fontSize: "0.9rem" }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}

      <div className="connection-status">
        {connected ? "서버 연결됨" : "서버 연결 중..."}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="create-room">
        <button onClick={openCreateModal}>
          방 만들기
        </button>
      </div>

      <div className="room-list">
        <h2>방 목록</h2>
        {rooms.length === 0 ? (
          <p className="no-rooms">현재 생성된 방이 없습니다.</p>
        ) : (
          <ul>
            {rooms.map((room) => (
              <li key={room.name} className="room-item">
                <span className="room-name">
                  {room.isPrivate && <span style={{ marginRight: '4px' }}>🔒</span>}
                  {room.name}
                  <span style={{
                    marginLeft: '7px',
                    fontSize: '0.72em',
                    fontWeight: 'bold',
                    color: room.gameType === 'spice' ? '#e67e22' : room.gameType === 'skulking' ? '#2ecc71' : '#646cff',
                    background: room.gameType === 'spice' ? 'rgba(230,126,34,0.15)' : room.gameType === 'skulking' ? 'rgba(46,204,113,0.15)' : 'rgba(100,108,255,0.15)',
                    border: `1px solid ${room.gameType === 'spice' ? 'rgba(230,126,34,0.4)' : room.gameType === 'skulking' ? 'rgba(46,204,113,0.4)' : 'rgba(100,108,255,0.4)'}`,
                    borderRadius: '4px',
                    padding: '1px 5px',
                  }}>
                    {room.gameType === 'spice' ? '향신료' : room.gameType === 'skulking' ? '스컬킹' : '갱스터'}
                  </span>
                  {room.gameStarted && <span style={{ marginLeft: '6px', fontSize: '0.85em', color: '#ff6b6b' }}>[진행중]</span>}
                </span>
                <span className="room-players">{room.memberCount}명</span>
                <button
                  className="join-btn"
                  onClick={() => openJoinModal(room.name, room.gameStarted, room.isPrivate)}
                  disabled={room.gameStarted}
                  style={{ opacity: room.gameStarted ? 0.5 : 1, cursor: room.gameStarted ? 'not-allowed' : 'pointer' }}
                >
                  {room.gameStarted ? '진행중' : '입장'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="build-info">{__BUILD_DATE__}</div>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>{modalMode === "create" ? "방 만들기" : `${joinTargetRoom} 입장`}</h2>
            {modalMode === "create" && (
              <>
                <ModalTabs>
                  <ModalTab $active={createTab === "multi"} onClick={() => setCreateTab("multi")}>멀티</ModalTab>
                  <ModalTab $active={createTab === "single"} onClick={() => setCreateTab("single")}>싱글</ModalTab>
                </ModalTabs>

                {createTab === "multi" && (
                  <>
                    <ModalInput
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="방 이름 입력"
                      onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                      autoFocus
                    />
                    <ModalInput
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value.slice(0, 6))}
                      placeholder="닉네임 (미입력 시 랜덤)"
                      maxLength={6}
                      onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                    />
                    <RadioGroup>
                      <label>게임 타입</label>
                      <RadioOptions>
                        {GAME_TYPES.map((type) => (
                          <RadioOption key={type.value}>
                            <input
                              type="radio"
                              name="gameType"
                              value={type.value}
                              checked={gameType === type.value}
                              onChange={(e) => setGameType(e.target.value)}
                            />
                            {type.label}
                          </RadioOption>
                        ))}
                      </RadioOptions>
                    </RadioGroup>
                    <CheckboxOption>
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                      />
                      비밀방
                    </CheckboxOption>
                    {isPrivate && (
                      <ModalInput
                        type="text"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="비밀번호 입력"
                        onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                      />
                    )}
                  </>
                )}

                {createTab === "single" && (
                  <SingleGameList>
                    {SINGLE_GAMES.map((game) => (
                      <SingleGameItem
                        key={game.value}
                        onClick={() => {
                          setShowModal(false);
                          navigate(`/single/${game.value}`);
                        }}
                      >
                        <span className="icon">{game.icon}</span>
                        <span className="info">
                          <span className="name">{game.label}</span>
                          <span className="desc">{game.desc}</span>
                        </span>
                      </SingleGameItem>
                    ))}
                  </SingleGameList>
                )}
              </>
            )}
            {modalMode === "join" && joinTargetIsPrivate && joinStep === "password" && (
              <ModalInput
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 입력"
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                autoFocus
              />
            )}
            {modalMode === "join" && (!joinTargetIsPrivate || joinStep === "nickname") && (
              <ModalInput
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value.slice(0, 6))}
                placeholder="닉네임 (미입력 시 랜덤)"
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                autoFocus
              />
            )}
            {!(modalMode === "create" && createTab === "single") && (
              <ModalButtons>
                <ModalButton onClick={() => setShowModal(false)}>취소</ModalButton>
                <ModalButton
                  $primary
                  onClick={handleConfirm}
                  disabled={isConfirmDisabled}
                >
                  {modalMode === "create" ? "만들기" : joinTargetIsPrivate && joinStep === "password" ? "확인" : "입장"}
                </ModalButton>
              </ModalButtons>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}
