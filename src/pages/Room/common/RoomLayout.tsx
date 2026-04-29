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
  VoiceToggleButton,
  VoiceToggleButtonWrapper,
  VoiceOverlay,
  VoicePanel,
  VoicePanelHeader,
  VoicePanelCloseButton,
  VoiceParticipantList,
  VoiceParticipantItem,
  VoiceEmptyMessage,
  VoiceConnectButton,
} from "../../../styles/chat";
import { useVoice } from "./useVoice";

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
  // 음성 통화 (선택)
  send?: (event: string, data: unknown) => void;
  subscribe?: (handler: (event: string, data: unknown) => void) => () => void;
  playerId?: string;
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
  send,
  subscribe,
  playerId,
}: Props) {
  const voiceEnabled = !!(send && subscribe && playerId && roomName);
  const voice = useVoice(
    voiceEnabled
      ? { send, subscribe, roomName, playerId: playerId! }
      : { send: () => {}, subscribe: () => () => {}, roomName: "", playerId: "" },
  );

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const showLeaveConfirmRef = useRef(false);
  const isLeavingRef = useRef(false);

  const closeLeaveConfirm = () => {
    showLeaveConfirmRef.current = false;
    setShowLeaveConfirm(false);
  };

  const confirmLeave = () => {
    isLeavingRef.current = true;
    if (voice.isConnected) voice.disconnect();
    // 뒤로가기 차단용으로 추가했던 pushState 엔트리 소비
    history.back();
    onLeave();
  };

  const handleLeave = () => {
    // 나가기 버튼 클릭 시: pushState로 엔트리 추가 후 다이얼로그 표시
    history.pushState(null, "", location.href);
    showLeaveConfirmRef.current = true;
    setShowLeaveConfirm(true);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isLeavingRef.current) return;
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
            {voiceEnabled && (
              <VoiceToggleButtonWrapper>
                <VoiceToggleButton
                  $active={voice.isConnected}
                  onClick={() => voice.setIsVoicePanelOpen(!voice.isVoicePanelOpen)}
                  aria-label="음성 통화"
                >
                  {voice.isConnected ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4zm6.5 7.5a5.5 5.5 0 0 1-11 0H5a7 7 0 0 0 6 6.93V20H9v2h6v-2h-2v-1.07A7 7 0 0 0 19 11.5h-1.5z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </VoiceToggleButton>
              </VoiceToggleButtonWrapper>
            )}

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
          </ToggleButtonStack>
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

      {voiceEnabled && (
        <>
          <VoiceOverlay
            $isOpen={voice.isVoicePanelOpen}
            onClick={() => voice.setIsVoicePanelOpen(false)}
          />
          <VoicePanel $isOpen={voice.isVoicePanelOpen}>
            <VoicePanelHeader>
              <span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                음성 통화
                {voice.voiceParticipants.length > 0 && (
                  <span style={{ fontSize: "0.85rem", color: "#888", fontWeight: 400 }}>
                    ({voice.voiceParticipants.length}명 참여 중)
                  </span>
                )}
              </span>
              <VoicePanelCloseButton onClick={() => voice.setIsVoicePanelOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </VoicePanelCloseButton>
            </VoicePanelHeader>

            <VoiceParticipantList>
              {voice.voiceParticipants.length === 0 ? (
                <VoiceEmptyMessage>아직 통화 참여자가 없습니다.</VoiceEmptyMessage>
              ) : (
                voice.voiceParticipants.map((p) => (
                  <VoiceParticipantItem key={p.playerId} $isSpeaking={p.isSpeaking}>
                    <div className="avatar">{p.nickname.charAt(0).toUpperCase()}</div>
                    <span className="name">{p.nickname}</span>
                    <span className="mic-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </VoiceParticipantItem>
                ))
              )}
            </VoiceParticipantList>

            <VoiceConnectButton
              $connected={voice.isConnected}
              onClick={voice.isConnected ? voice.disconnect : voice.connect}
            >
              {voice.isConnected ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M16.5 16.5L21 21M9 15H3l3-3m0 0a6 6 0 0 1 12 0m-3 3h6l-3-3" />
                  </svg>
                  연결 끊기
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  연결하기
                </>
              )}
            </VoiceConnectButton>
          </VoicePanel>
        </>
      )}

      {modals}

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
