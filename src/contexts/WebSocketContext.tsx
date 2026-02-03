import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function generateCardName(): string {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const id = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${suit}${rank}${id}`;
}

function getRoomNicknameKey(roomName: string): string {
  return `nickname:${roomName}`;
}

export function getNicknameForRoom(roomName: string): string {
  const saved = sessionStorage.getItem(getRoomNicknameKey(roomName));
  if (saved) return saved;
  const newNickname = generateCardName();
  sessionStorage.setItem(getRoomNicknameKey(roomName), newNickname);
  return newNickname;
}

export function setNicknameForRoom(roomName: string, nickname: string): void {
  sessionStorage.setItem(getRoomNicknameKey(roomName), nickname);
}

export function clearNicknameForRoom(roomName: string): void {
  sessionStorage.removeItem(getRoomNicknameKey(roomName));
}

interface WebSocketContextType {
  connected: boolean;
  send: (event: string, data?: unknown) => void;
  subscribe: (callback: (event: string, data: unknown) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
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
    const ws = new WebSocket("ws://localhost:9030/ws");
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
  }, []);

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
