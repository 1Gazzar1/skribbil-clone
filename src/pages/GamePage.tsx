import { useState } from "react";
import { PlayerList } from "@/components/PlayerList";
import { GameCanvas } from "@/components/GameCanvas";
import { ChatPanel } from "@/components/ChatPanel";

export type GameState = "choosing" | "drawing" | "guessing";

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("drawing");

  return (
    <div className="h-screen w-full p-4 md:p-6 flex flex-col overflow-hidden">
      
      {/* Dev Toggle for testing states */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white p-2 rounded-full shadow-md border border-blue-200 z-50">
        {(["choosing", "drawing", "guessing"] as GameState[]).map(state => (
          <button
            key={state}
            onClick={() => setGameState(state)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${
              gameState === state ? "bg-primary text-white" : "bg-blue-50 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[1600px] flex gap-4 md:gap-6 h-full pt-12 md:pt-0">
        
        {/* Left Panel: Players */}
        <div className="w-[280px] shrink-0 h-full hidden lg:block">
          <PlayerList />
        </div>

        {/* Center Panel: Canvas & Drawing Tools */}
        <div className="flex-1 h-full min-w-0">
          <GameCanvas gameState={gameState} />
        </div>

        {/* Right Panel: Chat */}
        <div className="w-[320px] shrink-0 h-full hidden md:block">
          <ChatPanel />
        </div>

      </div>

      {/* Mobile view warning (for simplicity in static UI) */}
      <div className="md:hidden fixed inset-0 bg-white z-50 flex items-center justify-center p-8 text-center flex-col gap-4">
        <h2 className="text-3xl font-black text-primary">Oops!</h2>
        <p className="text-lg font-bold text-slate-600">
          The game interface requires a wider screen. Please rotate your device or use a desktop/tablet.
        </p>
      </div>
    </div>
  );
}
