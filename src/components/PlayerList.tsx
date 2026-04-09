import { Cat, Dog, Bird, Pencil } from "lucide-react";

const PLAYERS = [
  { id: "1", name: "You", avatar: Cat, color: "bg-red-400", score: 1250, isDrawing: true },
  { id: "2", name: "DoodleBob", avatar: Dog, color: "bg-blue-400", score: 980, isDrawing: false },
  { id: "3", name: "Picasso", avatar: Bird, color: "bg-green-400", score: 450, isDrawing: false },
  { id: "4", name: "Gary", avatar: Cat, color: "bg-pink-400", score: 320, isDrawing: false },
];

export function PlayerList() {
  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-blue-200 playful-shadow overflow-hidden">
      <div className="bg-blue-50 text-zinc-200 p-4 font-bold text-center text-lg tracking-widest border-b-2 border-blue-100 uppercase">
        Players
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {PLAYERS.sort((a,b) => b.score - a.score).map((player, index) => {
          const Icon = player.avatar;
          return (
            <div 
              key={player.id} 
              className={`relative flex items-center p-3 rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-sm ${
                player.isDrawing 
                  ? 'border-primary bg-blue-50 ring-2 ring-primary/20' 
                  : 'border-blue-100 bg-white shadow-sm'
              }`}
            >
              <div className="w-8 font-black text-slate-400 text-xl text-center">#{index + 1}</div>
              
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-transparent ${player.color} bg-opacity-20 ml-2`}>
                <Icon size={24} className={player.color.replace('bg-', 'text-')} strokeWidth={2.5} />
              </div>
              
              <div className="ml-4 flex-1">
                <div className="font-bold text-slate-800 text-lg">{player.name}</div>
                <div className="font-semibold text-slate-500 text-sm">Score: {player.score}</div>
              </div>

              {player.isDrawing && (
                <div className="absolute -right-2 -top-2 bg-primary border-2 border-white rounded-full p-2 shadow-sm">
                  <Pencil size={16} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
