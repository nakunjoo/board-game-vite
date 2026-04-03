import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room/index";
import SlidePuzzle from "./pages/Single/SlidePuzzle/index";
import Minesweeper from "./pages/Single/Minesweeper/index";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 멀티 게임 (소켓) */}
        <Route
          path="/"
          element={
            <WebSocketProvider>
              <Lobby />
            </WebSocketProvider>
          }
        />
        <Route
          path="/room/:roomName"
          element={
            <WebSocketProvider>
              <Room />
            </WebSocketProvider>
          }
        />

        {/* 싱글 게임 (소켓 없음) */}
        <Route path="/single/slide-puzzle" element={<SlidePuzzle />} />
        <Route path="/single/minesweeper" element={<Minesweeper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
