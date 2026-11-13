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
const MAX_AUTH_RETRIES = 5; // 토큰 검증의 일시적 실패를 재시도하는 횟수 (백오프 합계 약 25초)
const AUTH_FAILED_MESSAGE = "인증에 실패했습니다";
// 백그라운드에서 돌아온 직후 getSession·소켓 연결이 멈춰 있는 경우가 있어 기다리는 한도를 둔다
// (다른 탭이 세션 잠금을 쥔 채 멈추거나, 멈춘 동안 만든 소켓이 CONNECTING에 묶임)
const GET_SESSION_TIMEOUT_MS = 4000;
const CONNECT_TIMEOUT_MS = 8000;

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
  // getSession이 늦을 때 쓸 마지막 토큰
  const lastTokenRef = useRef<string | undefined>(session?.access_token);
  useEffect(() => {
    if (session?.access_token) lastTokenRef.current = session.access_token;
  }, [session?.access_token]);
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
    let connectingSince = 0;
    let authRejected = false;
    let authFailures = 0;
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
      const startedAt = Date.now();
      connectingSince = startedAt;
      // getSession은 만료된 토큰을 갱신해서 돌려준다. 멈춰 있으면 마지막 토큰으로 접속한다
      const token = await Promise.race([
        supabase.auth
          .getSession()
          .then(({ data }) => data.session?.access_token)
          .catch(() => undefined),
        new Promise<undefined>((resolve) =>
          setTimeout(() => resolve(undefined), GET_SESSION_TIMEOUT_MS),
        ),
      ]).then((t) => t ?? lastTokenRef.current);
      // 기다리는 사이 화면 복귀로 새 시도가 시작됐으면 이 시도는 버린다
      if (connectingSince !== startedAt) return;
      connecting = false;
      if (disposed) return;
      if (!token) {
        scheduleRetry();
        return;
      }

      const wsBase = import.meta.env.VITE_WS_URL || "ws://localhost:9030/ws";
      const ws = new WebSocket(`${wsBase}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      const connectTimer = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) ws.close();
      }, CONNECT_TIMEOUT_MS);

      ws.onopen = () => {
        clearTimeout(connectTimer);
        setConnected(true);
      };

      ws.onmessage = (event) => {
        const { event: eventName, data } = JSON.parse(event.data);
        if (eventName === "authenticated") {
          attempts = 0;
          authFailures = 0;
          setConnectionId((id) => id + 1);
        } else if (
          eventName === "error" &&
          (data as { message?: string }).message === AUTH_FAILED_MESSAGE
        ) {
          // 일시적인 검증 실패일 수 있으니 재연결 유예 안에서는 조용히 다시 시도한다
          authFailures += 1;
          if (authFailures <= MAX_AUTH_RETRIES) return;
          authRejected = true; // 계속 실패하면 같은 토큰으로 재시도해도 alert만 반복된다
        }
        listenersRef.current.forEach((listener) => listener(eventName, data));
      };

      ws.onclose = () => {
        clearTimeout(connectTimer);
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
      authFailures = 0;
      attempts = 0;
      // 멈춰 있던 시도는 기다리지 않고 새로 시작한다
      if (connecting && Date.now() - connectingSince > GET_SESSION_TIMEOUT_MS) {
        connecting = false;
        connectingSince = 0;
      }
      const current = wsRef.current;
      if (current?.readyState === WebSocket.CONNECTING) {
        wsRef.current = null;
        current.onclose = null;
        current.close();
      }
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
