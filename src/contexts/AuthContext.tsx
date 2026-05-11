import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL as string;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  nickname: string | null;
  nicknameUpdatedAt: string | null | undefined;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateNickname: (newNickname: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameUpdatedAt, setNicknameUpdatedAt] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (accessToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNickname(data.nickname ?? null);
      setNicknameUpdatedAt(data.nicknameUpdatedAt ?? null);
      setIsAdmin(data.isAdmin ?? false);
    } catch {
      // 서버 연결 실패 시 무시
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) fetchProfile(session.access_token);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchProfile(session.access_token);
      } else {
        setNickname(null);
        setNicknameUpdatedAt(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateNickname = async (newNickname: string): Promise<{ error?: string }> => {
    if (!session) return { error: "로그인이 필요합니다" };

    try {
      const res = await fetch(`${API_URL}/api/profile/nickname`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ nickname: newNickname }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.message ?? "닉네임 변경에 실패했습니다" };
      }
      if (data.error) return { error: data.error };

      setNickname(data.nickname);
      setNicknameUpdatedAt(data.nicknameUpdatedAt);
      return {};
    } catch {
      return { error: "서버 연결에 실패했습니다" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, nickname, nicknameUpdatedAt, isAdmin, signInWithGoogle, signOut, updateNickname }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
