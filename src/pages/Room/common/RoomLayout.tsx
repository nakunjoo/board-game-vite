import type { ReactNode, RefObject } from "react";
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
}: Props) {
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
          <LeaveButton onClick={onLeave} aria-label="나가기">
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
        </GameArea>

        <ChatOverlay $isOpen={isChatOpen} onClick={onCloseChat} />

        <ChatArea $isOpen={isChatOpen}>
          <ChatHeaderMobile>
            <span>채팅</span>
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
        </ChatArea>
      </RoomContent>

      {modals}
    </RoomPage>
  );
}
