import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Copy, Settings, Cat, Dog, Bird, Crown } from "lucide-react";

// Mock players for the UI
const PLAYERS = [
  { id: "1", name: "You", avatar: Cat, color: "bg-red-400", isHost: true },
  { id: "2", name: "DoodleBob", avatar: Dog, color: "bg-blue-400", isHost: false },
  { id: "3", name: "Picasso", avatar: Bird, color: "bg-green-400", isHost: false },
];

export default function LobbyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "join";
  const roomCode = searchParams.get("code") || "XYZ123";
  const isHost = mode === "host";

  const [rounds, setRounds] = useState("3");
  const [drawTime, setDrawTime] = useState("80");
  const [language, setLanguage] = useState("English");

  return (
    <div className="flex justify-center min-h-screen p-4 overflow-hidden text-slate-800">
      
      {/* Container */}
      <div className="w-full max-w-5xl flex gap-8 my-auto max-h-[90vh] flex-col md:flex-row">
        
        {/* Left column: Players & Room Code */}
        <div className="flex flex-col gap-8 md:w-2/3">
          
          <div className="flex flex-col items-center p-8 bg-white rounded-3xl playfully border border-blue-200 playful-shadow">
            <h2 className="text-xl font-bold mb-3 text-slate-500 uppercase tracking-widest">Room Code</h2>
            <div className="flex items-center gap-4 bg-blue-50 py-3 px-6 rounded-2xl border-2 border-blue-200">
              <span className="text-5xl font-black tracking-widest text-primary">{roomCode}</span>
              <button className="playful-hover p-2 bg-white rounded-xl border-2 border-blue-200 text-slate-500 hover:text-primary transition-colors">
                <Copy size={24} />
              </button>
            </div>
            <p className="mt-4 text-slate-500 font-semibold">Share this code with your friends!</p>
          </div>

          <div className="flex-1 p-6 bg-white rounded-3xl border border-blue-200 playful-shadow overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-blue-100">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                <Users className="text-primary" size={28} />
                Players <span className="text-slate-400 text-lg">({PLAYERS.length}/8)</span>
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {PLAYERS.map((player) => {
                const Icon = player.avatar;
                return (
                  <div key={player.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-2xl border border-blue-100 transition-transform hover:-translate-y-1 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-white border-2 border-transparent ${player.color} bg-opacity-20`}>
                        <Icon size={28} className={player.color.replace('bg-', 'text-')} strokeWidth={2.5} />
                      </div>
                      <span className="text-xl font-bold text-slate-700">{player.name}</span>
                    </div>
                    {player.isHost && (
                      <Crown className="text-amber-400 fill-amber-400" size={24} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Settings & Start block */}
        <div className="flex flex-col gap-8 md:w-1/3">
          
          <div className="flex-1 p-6 bg-white rounded-3xl border border-blue-200 playful-shadow flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-blue-100">
              <Settings className="text-slate-400" size={28} />
              <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
            </div>

            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="font-bold text-slate-600 text-sm uppercase">Rounds</label>
                <select 
                  className="w-full bg-blue-50 text-slate-800 border-2 border-blue-200 rounded-xl px-4 py-3 font-bold text-lg disabled:opacity-50 focus:border-primary focus:ring-0 appearance-none"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  disabled={!isHost}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-600 text-sm uppercase">Draw Time (seconds)</label>
                <select 
                  className="w-full bg-blue-50 text-slate-800 border-2 border-blue-200 rounded-xl px-4 py-3 font-bold text-lg disabled:opacity-50 focus:border-primary focus:ring-0 appearance-none"
                  value={drawTime}
                  onChange={(e) => setDrawTime(e.target.value)}
                  disabled={!isHost}
                >
                  <option value="30">30</option>
                  <option value="60">60</option>
                  <option value="80">80</option>
                  <option value="100">100</option>
                  <option value="120">120</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-600 text-sm uppercase">Language</label>
                <select 
                  className="w-full bg-blue-50 text-slate-800 border-2 border-blue-200 rounded-xl px-4 py-3 font-bold text-lg disabled:opacity-50 focus:border-primary focus:ring-0 appearance-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={!isHost}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t-2 border-blue-100">
              {isHost ? (
                <Button className="w-full text-xl font-bold h-16 bg-primary text-white hover:bg-blue-600 rounded-xl playful-hover shadow-sm" onClick={() => navigate("/game")}>
                  Start Game
                </Button>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                  <p className="font-bold text-slate-500">Waiting for host to start...</p>
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/" className="text-slate-400 font-bold hover:text-red-500 transition-colors uppercase text-sm tracking-wider">
                  Leave Room
                </Link>
              </div>
            </div>
            
          </div>

        </div>

      </div>
      
    </div>
  );
}
