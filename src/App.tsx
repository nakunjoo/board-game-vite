import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/room/:roomName" element={<Room />} />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;
