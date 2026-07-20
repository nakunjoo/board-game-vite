import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL as string;
const EMAIL_DOMAIN = "bobogang.local";
const ID_REGEX = /^[a-z0-9_]{4,20}$/;

type Mode = "login" | "signup";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setPassword("");
    setPasswordConfirm("");
  };

  const handleLogin = async () => {
    const trimmedId = id.trim().toLowerCase();
    if (!trimmedId || !password) {
      setError("아이디와 비밀번호를 입력해주세요");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${trimmedId}@${EMAIL_DOMAIN}`,
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다");
      return;
    }

    navigate("/");
  };

  const handleSignup = async () => {
    const trimmedId = id.trim().toLowerCase();
    const trimmedNickname = nickname.trim();

    if (!ID_REGEX.test(trimmedId)) {
      setError("아이디는 영문 소문자/숫자/언더스코어 4~20자여야 합니다");
      return;
    }
    if (!trimmedNickname || trimmedNickname.length > 6) {
      setError("닉네임은 1~6자여야 합니다");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trimmedId, nickname: trimmedNickname, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? data.message ?? "회원가입에 실패했습니다");
        setSubmitting(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${trimmedId}@${EMAIL_DOMAIN}`,
        password,
      });

      setSubmitting(false);

      if (signInError) {
        setError("가입은 완료되었지만 로그인에 실패했습니다. 다시 로그인해주세요");
        switchMode("login");
        return;
      }

      navigate("/");
    } catch {
      setSubmitting(false);
      setError("서버 연결에 실패했습니다");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (mode === "login") handleLogin();
    else handleSignup();
  };

  if (loading) return null;

  return (
    <Container>
      <Card>
        <Title>BOBOGANG</Title>

        <TabRow>
          <TabButton $active={mode === "login"} type="button" onClick={() => switchMode("login")}>
            로그인
          </TabButton>
          <TabButton $active={mode === "signup"} type="button" onClick={() => switchMode("signup")}>
            회원가입
          </TabButton>
        </TabRow>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="아이디 (영문/숫자, 4~20자)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
          />
          {mode === "signup" && (
            <Input
              type="text"
              placeholder="닉네임 (1~6자)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={6}
            />
          )}
          <Input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {mode === "signup" && (
            <Input
              type="password"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
            />
          )}

          {error && <ErrorText>{error}</ErrorText>}

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </SubmitButton>
        </Form>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
`;

const Card = styled.div`
  background: #16213e;
  border-radius: 16px;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2.4rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: 2px;
`;

const TabRow = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.$active ? "#8b5cf6" : "#1f2a48")};
  color: ${(p) => (p.$active ? "#fff" : "#8a93b8")};
  transition: background 0.2s, color 0.2s;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #2c3a63;
  background: #1f2a48;
  color: #fff;
  font-size: 0.95rem;
  box-sizing: border-box;

  &::placeholder {
    color: #6b7599;
  }

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const ErrorText = styled.div`
  color: #f87171;
  font-size: 0.85rem;
  text-align: center;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #8b5cf6;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
