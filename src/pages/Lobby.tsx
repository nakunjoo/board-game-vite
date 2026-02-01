import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket, getNicknameForRoom, setNicknameForRoom } from "../contexts/WebSocketContext";
import {
  ModalOverlay,
  ModalContent,
  ModalInput,
  RadioGroup,
  RadioOption,
  ModalButtons,
  ModalButton,
} from "../styles/pages/Lobby";

interface Room {
  name: string;
  memberCount: number;
}

const GAME_TYPES = [
  { value: "gang", label: "Gang" },
];

type ModalMode = "create" | "join";

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
    setShowModal(true);
  };

  const openJoinModal = (name: string) => {
    setModalMode("join");
    setJoinTargetRoom(name);
    setNicknameInput("");
    setShowModal(true);
  };

  const createRoom = () => {
    if (!newRoomName.trim()) return;
    const nick = resolveNickname(newRoomName);
    send("createRoom", { name: newRoomName, nickname: nick, gameType });
    setShowModal(false);
  };

  const joinRoom = () => {
    const nick = resolveNickname(joinTargetRoom);
    send("joinRoom", { name: joinTargetRoom, nickname: nick });
    setShowModal(false);
  };

  const handleConfirm = () => {
    if (modalMode === "create") {
      createRoom();
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
                <span className="room-name">{room.name}</span>
                <span className="room-players">{room.memberCount}명</span>
                <button className="join-btn" onClick={() => openJoinModal(room.name)}>
                  입장
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>{modalMode === "create" ? "방 만들기" : `${joinTargetRoom} 입장`}</h2>
            {modalMode === "create" && (
              <ModalInput
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="방 이름 입력"
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                autoFocus
              />
            )}
            <ModalInput
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value.slice(0, 6))}
              placeholder="닉네임 (미입력 시 랜덤)"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              autoFocus={modalMode === "join"}
            />
            {modalMode === "create" && (
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
            )}
            <ModalButtons>
              <ModalButton onClick={() => setShowModal(false)}>취소</ModalButton>
              <ModalButton
                $primary
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
              >
                {modalMode === "create" ? "만들기" : "입장"}
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}
