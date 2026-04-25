import { Cat, Dog, Bird, Pencil } from "lucide-react";

const PLAYERS = [
  { id: "1", name: "You", avatar: Cat, color: "bg-red-400", score: 1250, isDrawing: true },
  { id: "2", name: "DoodleBob", avatar: Dog, color: "bg-blue-400", score: 980, isDrawing: false },
  { id: "3", name: "Picasso", avatar: Bird, color: "bg-green-400", score: 450, isDrawing: false },
  { id: "4", name: "Gary", avatar: Cat, color: "bg-pink-400", score: 320, isDrawing: false },
];

export function PlayerList({ compact }: { compact?: boolean }) {
  const sorted = [...PLAYERS].sort((a, b) => b.score - a.score);

  /* ── Compact: horizontal scrollable pill strip for mobile ── */
  if (compact) {
    return (
      <>
        {sorted.map((player, index) => {
          const Icon = player.avatar;
          return (
            <div
              key={player.id}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl border-2 shrink-0 transition-all ${
                player.isDrawing
                  ? "border-primary bg-primary/10"
                  : "border-blue-100 bg-white/80"
              }`}
            >
              <span className="text-[10px] font-black text-slate-400">#{index + 1}</span>
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${player.color} bg-opacity-20`}>
                <Icon size={20} className={player.color.replace("bg-", "text-")} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 max-w-[52px] truncate">{player.name}</span>
              <span className="text-[10px] font-semibold text-slate-400">{player.score}</span>
              {player.isDrawing && (
                <div className="absolute -right-1 -top-1 bg-primary border-2 border-white rounded-full p-0.5">
                  <Pencil size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }

  /* ── Full: vertical card list — compact on mobile, spacious on desktop ── */
  return (
    <div className="flex flex-col h-full bg-white rounded-sm md:rounded-3xl border border-blue-200 playful-shadow overflow-hidden">
      <div className="bg-blue-50 text-slate-700 py-1.5 md:p-4 font-bold text-center text-xs md:text-lg tracking-widest border-b-2 border-blue-100 uppercase shrink-0">
        Players
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 md:p-4 space-y-1.5 md:space-y-3">
        {sorted.map((player, index) => {
          const Icon = player.avatar;
          return (
            <div
              key={player.id}
              className={`relative flex items-center gap-1.5 md:gap-0 p-1.5 md:p-3 rounded-xl md:rounded-2xl border-2 transition-all ${
                player.isDrawing
                  ? "border-primary bg-blue-50 ring-1 md:ring-2 ring-primary/20"
                  : "border-blue-100 bg-white shadow-sm"
              }`}
            >
              {/* Rank — hidden on mobile to save space */}
              <div className="hidden md:block w-8 font-black text-slate-400 text-xl text-center">
                #{index + 1}
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl ${player.color} bg-opacity-20 md:ml-2 shrink-0`}>
                <Icon size={16} className={player.color.replace("bg-", "text-")} strokeWidth={2.5} />
              </div>

              {/* Name + score */}
              <div className="flex-1 min-w-0 md:ml-4">
                <div className="font-bold text-slate-800 text-xs md:text-lg truncate leading-tight">
                  {player.name}
                </div>
                <div className="font-semibold text-slate-400 text-[10px] md:text-sm leading-tight">
                  {player.score} pts
                </div>
              </div>

              {player.isDrawing && (
                <div className="absolute -right-1 -top-1 md:-right-2 md:-top-2 bg-primary border-2 border-white rounded-full p-0.5 md:p-2 shadow-sm">
                  <Pencil size={10} className="text-white md:w-4 md:h-4" strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
