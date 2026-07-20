import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room/index";
import SlidePuzzle from "./pages/Single/SlidePuzzle/index";
import Minesweeper from "./pages/Single/Minesweeper/index";
import MyPage from "./pages/MyPage";
import Manager from "./pages/Manager/index";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

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

          {/* 마이페이지 */}
          <Route path="/mypage" element={<AuthGuard><MyPage /></AuthGuard>} />

          {/* 관리자 페이지 */}
          <Route path="/manager" element={<AdminGuard><Manager /></AdminGuard>} />

          {/* 싱글 게임 */}
          <Route path="/single/slide-puzzle" element={<AuthGuard><SlidePuzzle /></AuthGuard>} />
          <Route path="/single/minesweeper" element={<AuthGuard><Minesweeper /></AuthGuard>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
