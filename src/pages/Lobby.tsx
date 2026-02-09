import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket, getPlayerIdForRoom, getNicknameForRoom, setNicknameForRoom } from "../contexts/WebSocketContext";
import {
  ModalOverlay,
  ModalContent,
  ModalInput,
  RadioGroup,
  RadioOption,
  ModalButtons,
  ModalButton,
  CheckboxOption,
} from "../styles/pages/Lobby";

interface Room {
  name: string;
  memberCount: number;
  gameStarted?: boolean;
  isPrivate?: boolean;
}

const GAME_TYPES = [
  { value: "gang", label: "Gang" },
];

type ModalMode = "create" | "join";
type JoinStep = "password" | "nickname";

export default function Lobby() {
  const { connected, send, subscribe } = useWebSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [newRoomName, setNewRoomName] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [gameType, setGameType] = useState("gang");
  const [joinTargetRoom, setJoinTargetRoom] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [joinTargetIsPrivate, setJoinTargetIsPrivate] = useState(false);
  const [joinStep, setJoinStep] = useState<JoinStep>("password");
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
            players?: { nickname: string; order: number }[];
          };
          sessionStorage.setItem(`joined:${joinData.name}`, "true");
          navigate(`/room/${joinData.name}`, {
            state: {
              memberCount: joinData.memberCount,
              players: joinData.players,
            },
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
    if (!newRoomName.trim()) return;
    if (isPrivate && !passwordInput.trim()) {
      setError("비밀번호를 입력해주세요");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const pid = getPlayerIdForRoom(newRoomName);
    const nick = resolveNickname(newRoomName);
    const roomData: { name: string; playerId: string; nickname: string; gameType: string; password?: string } = {
      name: newRoomName,
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

  const isConfirmDisabled = modalMode === "create" && !newRoomName.trim();

  return (
    <div className="lobby">
      <h1>The Gang</h1>
      <div className="connection-status">
        {connected ? "서버 연결됨" : "서버 연결 중..."}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="create-room">
        <button onClick={openCreateModal} disabled={!connected}>
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
                  {room.gameStarted && <span style={{ marginLeft: '8px', fontSize: '0.85em', color: '#ff6b6b' }}>[진행중]</span>}
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
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}
