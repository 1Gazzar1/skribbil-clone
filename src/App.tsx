import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import { DoodleBackground } from "./components/DoodleBackground";
import { GameProvider } from "./contexts/GameContext";
import { Toaster } from "@/components/ui/sonner"
function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <DoodleBackground />
        <Toaster richColors />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lobby/:roomCode" element={<LobbyPage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;
