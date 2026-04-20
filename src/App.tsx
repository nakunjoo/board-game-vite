import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import AuthGuard from "./components/AuthGuard";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room/index";
import SlidePuzzle from "./pages/Single/SlidePuzzle/index";
import Minesweeper from "./pages/Single/Minesweeper/index";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* 멀티 게임 (소켓) */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <WebSocketProvider>
                  <Lobby />
                </WebSocketProvider>
              </AuthGuard>
            }
          />
          <Route
            path="/room/:roomName"
            element={
              <AuthGuard>
                <WebSocketProvider>
                  <Room />
                </WebSocketProvider>
              </AuthGuard>
            }
          />

          {/* 싱글 게임 */}
          <Route path="/single/slide-puzzle" element={<AuthGuard><SlidePuzzle /></AuthGuard>} />
          <Route path="/single/minesweeper" element={<AuthGuard><Minesweeper /></AuthGuard>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
