import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import {
  RoomPage,
  RoomHeader,
  RoomInfo,
  MemberCount,
  LeaveButton,
  RoomContent,
} from "../../../styles/pages/Room";
import { GameArea } from "../../../styles/game";
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
  ToggleButtonStack,
} from "../../../styles/chat";

interface Message {
  message: string;
  isSystem?: boolean;
}

interface HelpButtonStyle {
  background: string;
  boxShadow: string;
}

interface Props {
  roomName: string;
  displayName: string;
  memberCount: number;
  helpButtonStyle: HelpButtonStyle;
  onHelp: () => void;
  onLeave: () => void;
  // 채팅
  messages: Message[];
  inputMessage: string;
  isChatOpen: boolean;
  hasUnreadMessages: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onToggleChat: () => void;
  onCloseChat: () => void;
  // 게임 영역
  children: ReactNode;
  // 모달 (헬프 모달 등, 게임 영역 바깥에 렌더링)
  modals?: ReactNode;
  // 서버 입장 확인 전 (새로고침·재연결). 복원 전 화면을 조작하지 못하게 가린다
  reconnecting?: boolean;
  // 채팅을 게임 화면에서 입력하는 게임(그림 맞히기)은 채팅창을 기록 보기 전용으로 쓴다
  chatReadOnly?: boolean;
  // 게임 화면에 채팅 기록이 이미 보이면 채팅 버튼을 숨긴다
  hideChatToggle?: boolean;
  // 게임이 뒤로가기를 직접 처리하면 true (예: 카지노 미니게임 → 허브). 그때는 나가기 확인창을 띄우지 않는다
  onBack?: () => boolean;
}

export default function RoomLayout({
  roomName,
  displayName,
  memberCount,
  helpButtonStyle,
  onHelp,
  onLeave,
  messages,
  inputMessage,
  isChatOpen,
  hasUnreadMessages,
  messagesEndRef,
  onInputChange,
  onSendMessage,
  onToggleChat,
  onCloseChat,
  children,
  modals,
  reconnecting = false,
  chatReadOnly = false,
  hideChatToggle = false,
  onBack,
}: Props) {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const showLeaveConfirmRef = useRef(false);
  const isLeavingRef = useRef(false);
  const hasLeftRef = useRef(false);
  const onLeaveRef = useRef(onLeave);
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onLeaveRef.current = onLeave;
    onBackRef.current = onBack;
  }, [onLeave, onBack]);

  const closeLeaveConfirm = () => {
    showLeaveConfirmRef.current = false;
    setShowLeaveConfirm(false);
  };

  const leaveOnce = () => {
    if (hasLeftRef.current) return;
    hasLeftRef.current = true;
    onLeaveRef.current();
  };

  const confirmLeave = () => {
    isLeavingRef.current = true;
    // 확인창용으로 넣은 기록을 먼저 빼고, 그게 끝난 뒤(popstate) 나간다.
    // 같이 하면 서버 roomLeft의 로비 이동(replace)이 먼저 처리되고 뒤로가기가 그 뒤에 와서 나간 방 화면이 다시 열렸다
    history.back();
    setTimeout(leaveOnce, 500); // popstate가 오지 않는 경우 대비
  };


  const handleLeave = () => {
    // 나가기 버튼 클릭 시: pushState로 엔트리 추가 후 다이얼로그 표시
    history.pushState(null, "", location.href);
    showLeaveConfirmRef.current = true;
    setShowLeaveConfirm(true);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isLeavingRef.current) {
        leaveOnce();
        return;
      }
      if (!showLeaveConfirmRef.current && onBackRef.current?.()) return;
      if (showLeaveConfirmRef.current) {
        // 다이얼로그 열린 상태에서 뒤로가기 = 닫기
        closeLeaveConfirm();
      } else {
        // 뒤로가기 차단: 현재 URL 다시 push해서 막고 다이얼로그 표시
        history.pushState(null, "", location.href);
        showLeaveConfirmRef.current = true;
        setShowLeaveConfirm(true);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <RoomPage>
      <RoomHeader>
        <h1>
          {roomName}{" "}
          <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 400 }}>
            {displayName}
          </span>
        </h1>
        <RoomInfo>
          <div
            style={{
              background: helpButtonStyle.background,
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
            onClick={onHelp}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = helpButtonStyle.boxShadow;
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
          <LeaveButton onClick={handleLeave} aria-label="나가기">
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
          {children}

          <ToggleButtonStack>

            {!hideChatToggle && (
              <ChatToggleButtonWrapper>
                <ChatToggleButton onClick={onToggleChat} aria-label="채팅">
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
            )}
          </ToggleButtonStack>
        </GameArea>

        <ChatOverlay $isOpen={isChatOpen} onClick={onCloseChat} />

        <ChatArea $isOpen={isChatOpen}>
          <ChatHeaderMobile>
            <span>{chatReadOnly ? "채팅 기록" : "채팅"}</span>
            <ChatCloseButton onClick={onCloseChat}>
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
          {!chatReadOnly && (
            <ChatInputArea>
              <ChatInput
                type="text"
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="메시지 입력..."
                onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
              />
              <ChatSendButton onClick={onSendMessage} disabled={!inputMessage.trim()}>
                전송
              </ChatSendButton>
            </ChatInputArea>
          )}
        </ChatArea>
      </RoomContent>


      {modals}

      {reconnecting && (
        <div
          role="status"
          style={{
            position: "fixed", top: 52, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.75)", color: "#e0e0e0", fontSize: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9500,
          }}
        >
          연결 중...
        </div>
      )}

      {showLeaveConfirm && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={closeLeaveConfirm}
        >
          <div
            style={{
              background: "#2a2a2a", borderRadius: 12, padding: "1.5rem",
              width: "90%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "1.25rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: 0, color: "#e0e0e0", fontSize: "1rem", textAlign: "center" }}>
              방에서 나가시겠습니까?
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={closeLeaveConfirm}
                style={{ padding: "0.6rem 1.2rem", borderRadius: 6, border: "none", background: "#3a3a3a", color: "#ccc", cursor: "pointer", fontSize: "0.95rem" }}
              >
                취소
              </button>
              <button
                onClick={confirmLeave}
                style={{ padding: "0.6rem 1.2rem", borderRadius: 6, border: "none", background: "#ff6b6b", color: "#fff", cursor: "pointer", fontSize: "0.95rem" }}
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </RoomPage>
  );
}
