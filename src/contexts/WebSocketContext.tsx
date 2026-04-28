import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface WebSocketContextType {
  connected: boolean;
  send: (event: string, data?: unknown) => void;
  subscribe: (callback: (event: string, data: unknown) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const [connected, setConnected] = useState(false);
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

  useEffect(() => {
    if (loading || !session?.access_token) return;

    const wsBase = import.meta.env.VITE_WS_URL || "ws://localhost:9030/ws";
    const wsUrl = `${wsBase}?token=${encodeURIComponent(session.access_token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const { event: eventName, data } = JSON.parse(event.data);
      listenersRef.current.forEach((listener) => listener(eventName, data));
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [loading, session?.access_token]);

  return (
    <WebSocketContext.Provider
      value={{ connected, send, subscribe }}
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
