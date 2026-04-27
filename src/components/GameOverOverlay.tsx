import { type Player } from "@/contexts/GameContext";
import { Trophy, Home } from "lucide-react";

interface GameOverOverlayProps {
  players: Player[];
  onBackToHome: () => void;
}

export function GameOverOverlay({ players, onBackToHome }: GameOverOverlayProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ animation: "game-over-fade-in 0.35s ease forwards" }}
    >
      <div
        className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
        style={{
          animation: "game-over-panel-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6 border-b-4 border-black bg-slate-50">
          <div className="w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center bg-primary rotate-3">
            <Trophy size={32} className="text-white" strokeWidth={3} />
          </div>
          <div className="text-center">
            <h2 className="text-black font-black text-3xl md:text-4xl leading-tight tracking-tight uppercase">
              Game Over!
            </h2>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest">
              {winner ? `${winner.username} wins!` : "It's a tie!"}
            </p>
          </div>
        </div>

        {/* Players */}
        <div className="px-4 py-6 space-y-3 bg-white max-h-[40vh] overflow-y-auto">
          {sorted.map((player, index) => {
            const isWinner = index === 0;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-4 ${
                  isWinner ? "border-primary bg-primary/10" : "border-black bg-slate-50"
                }`}
              >
                <span className="w-8 text-center font-black text-xl shrink-0 text-black">
                  {index === 0 ? "🥇" : `#${index + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-black font-black text-lg truncate">
                    {player.username}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-black font-black text-2xl tabular-nums">
                    {player.score}
                  </span>
                  <span className="text-slate-500 font-bold ml-1 uppercase text-sm">pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 p-6 border-t-4 border-black bg-slate-50">
          <button
            onClick={onBackToHome}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-4 border-black font-black uppercase tracking-wider bg-primary text-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all"
          >
            <Home size={20} strokeWidth={3} />
            Home
          </button>
        </div>
      </div>

      <style>{`
        @keyframes game-over-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes game-over-panel-in {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
