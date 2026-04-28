import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <Container>
      <Card>
        <Title>BOBOGANG</Title>
        <GoogleButton onClick={signInWithGoogle}>
          <GoogleIcon src="https://www.google.com/favicon.ico" alt="" />
          Google로 로그인
        </GoogleButton>
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



const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const GoogleIcon = styled.img`
  width: 18px;
  height: 18px;
`;
