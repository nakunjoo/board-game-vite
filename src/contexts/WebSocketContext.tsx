import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000; // 서버 재연결 유예(30초) 안에 여러 번 시도하도록 짧게 둔다

interface WebSocketContextType {
  connected: boolean;
  /** 서버 인증이 끝난 연결마다 1씩 증가 (0이면 아직 없음). 방 재입장 트리거로 쓴다 */
  connectionId: number;
  send: (event: string, data?: unknown) => void;
  subscribe: (callback: (event: string, data: unknown) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const userId = session?.user.id;
  const [connected, setConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<(event: string, data: unknown) => void>>(
    new Set()
  );

  const send = (event: string, data: unknown = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    }
  };

  const subscribe = (callback: (event: string, data: unknown) => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  // 서버는 접속 시에만 토큰을 검증하므로 토큰이 갱신돼도 소켓을 바꾸지 않는다.
  // (access_token을 의존성에 넣으면 게임 중 자동 갱신 때마다 연결이 끊긴다)
  useEffect(() => {
    if (loading || !userId) return;

    let disposed = false;
    let connecting = false;
    let authRejected = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRetry = () => {
      if (disposed) return;
      clearTimeout(retryTimer);
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempts, RECONNECT_MAX_MS);
      attempts += 1;
      retryTimer = setTimeout(connect, delay);
    };

    const connect = async () => {
      if (disposed || connecting) return;
      const current = wsRef.current;
      if (
        current?.readyState === WebSocket.OPEN ||
        current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      clearTimeout(retryTimer);
      connecting = true;
      // getSession은 만료된 토큰을 갱신해서 돌려준다
      const token = await supabase.auth
        .getSession()
        .then(({ data }) => data.session?.access_token)
        .catch(() => undefined);
      connecting = false;
      if (disposed) return;
      if (!token) {
        scheduleRetry();
        return;
      }

      const wsBase = import.meta.env.VITE_WS_URL || "ws://localhost:9030/ws";
      const ws = new WebSocket(`${wsBase}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        attempts = 0;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        const { event: eventName, data } = JSON.parse(event.data);
        if (eventName === "authenticated") {
          setConnectionId((id) => id + 1);
        } else if (
          eventName === "error" &&
          (data as { message?: string }).message === "인증에 실패했습니다"
        ) {
          authRejected = true; // 같은 토큰으로 재시도해도 소용없고 alert만 반복된다
        }
        listenersRef.current.forEach((listener) => listener(eventName, data));
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          setConnected(false);
        }
        if (!authRejected) scheduleRetry();
      };
    };

    // 화면 복귀나 네트워크 복구 때는 백오프를 기다리지 않는다 (iOS 잠금 해제 등)
    const reconnectNow = () => {
      if (document.visibilityState !== "visible") return;
      authRejected = false;
      attempts = 0;
      void connect();
    };

    void connect();
    document.addEventListener("visibilitychange", reconnectNow);
    window.addEventListener("online", reconnectNow);

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", reconnectNow);
      window.removeEventListener("online", reconnectNow);
      wsRef.current?.close();
    };
  }, [loading, userId]);

  return (
    <WebSocketContext.Provider
      value={{ connected, connectionId, send, subscribe }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
