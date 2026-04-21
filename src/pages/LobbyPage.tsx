import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Copy, Settings, Cat, Dog, Bird, Crown } from "lucide-react";
import { useGame, type Player, type Room } from "@/contexts/GameContext";
import socket from "@/socket";

// Avatars and colors for fallback
const AVATARS = [Cat, Dog, Bird];
const COLORS = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400", "bg-pink-400", "bg-indigo-400", "bg-teal-400"];

export default function LobbyPage() {
  const { roomCode: paramRoomCode } = useParams();
  const navigate = useNavigate();

  const { players, room, id: playerId, setRoom, setPlayers } = useGame();
  
  const isHost = room ? playerId === room.hostId : false;
  const roomCode = room?.id || paramRoomCode || "XYZ123";

  const [rounds, setRounds] = useState(room?.noOfRounds || 3);
  const [drawTime, setDrawTime] = useState(room?.turnDuration || 80);

  useEffect(() => {
    socket.on("room.updated", (data: { room : Room, players : Player[]}) => {
      setRoom(data.room)
      setPlayers(data.players)
    });
    return () => {
      socket.off("room.updated");
    };
  },[])

  useEffect(() => {
    if (isHost){
      onSettingsChange()
    }
  },[rounds,drawTime])

  function onSettingsChange() {
    const partialRoom : Partial<Room> = { 
      noOfRounds: rounds,
      turnDuration: drawTime,
    }
    console.log(room?.id)
    console.log(partialRoom)
    socket.emit("room.settings", {roomId: room?.id, room: partialRoom})
  }
  function onLeave(){ 
    socket.emit("room.leave", { roomId : roomCode })
    setRoom(null)
    setPlayers([])
    navigate("/")
  }
  return (
    <div className="relative flex justify-center min-h-screen p-4 overflow-hidden text-slate-800 pointer-events-none z-20">
      
      {/* Container */}
      <div className="w-full max-w-5xl flex gap-8 my-auto max-h-[90vh] flex-col md:flex-row pointer-events-auto">
        
        {/* Left column: Players & Room Code */}
        <div className="flex flex-col gap-8 md:w-2/3">
          
          <div className="flex flex-col items-center p-8 bg-white rounded-3xl border-4 border-black playful-shadow">
            <h2 className="text-xl font-bold mb-3 text-slate-500 uppercase tracking-widest">Room Code</h2>
            <div className="flex items-center gap-4 bg-zinc-100 py-3 px-6 rounded-2xl border-2 border-zinc-300">
              <span className="text-5xl font-black tracking-widest text-primary">{roomCode}</span>
              <button className="playful-hover p-2 bg-white rounded-xl border-2 border-zinc-300 text-slate-500 hover:text-primary transition-colors">
                <Copy size={24} />
              </button>
            </div>
            <p className="mt-4 text-slate-500 font-semibold">Share this code with your friends!</p>
          </div>

          <div className="flex-1 p-6 bg-white rounded-3xl border-4 border-black playful-shadow overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-zinc-200">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                <Users className="text-primary" size={28} />
                Players <span className="text-slate-400 text-lg">({players?.length || 0}/{room?.maxPlayers || 8})</span>
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {players?.map((player, idx) => {
                const Icon = AVATARS[idx % AVATARS.length];
                const color = COLORS[idx % COLORS.length];
                const isPlayerHost = room?.hostId === player.id;
                
                return (
                  <div key={player.id} className="flex items-center justify-between bg-zinc-100 p-3 rounded-2xl border border-zinc-300 transition-transform hover:-translate-y-1 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-white border-2 border-transparent ${color} bg-opacity-20`}>
                        <Icon size={28} className={color.replace('bg-', 'text-')} strokeWidth={2.5} />
                      </div>
                      <span className="text-xl font-bold text-slate-700">{player.username} {playerId === player.id ? "(You)" : ""}</span>
                    </div>
                    {isPlayerHost && (
                      <Crown className="text-primary fill-primary" size={24} />
                    )}
                  </div>
                );
              })}
              {(!players || players.length === 0) && (
                <div className="text-center p-4 text-slate-500 font-semibold">
                  Waiting for players to join...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Settings & Start block */}
        <div className="flex flex-col gap-8 md:w-1/3">
          
          <div className="flex-1 p-6 bg-white rounded-3xl border-4 border-black playful-shadow flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-zinc-200">
              <Settings className="text-slate-400" size={28} />
              <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
            </div>

            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="font-bold text-slate-600 text-sm uppercase">Rounds</label>
                <select 
                  className="w-full bg-zinc-100 text-slate-800 border-2 border-zinc-300 rounded-xl px-4 py-3 font-bold text-lg disabled:opacity-50 focus:border-primary focus:ring-0 appearance-none"
                  value={room?.noOfRounds}
                  onChange={(e) => {setRounds(+e.target.value);}}
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
                  className="w-full bg-zinc-100 text-slate-800 border-2 border-zinc-300 rounded-xl px-4 py-3 font-bold text-lg disabled:opacity-50 focus:border-primary focus:ring-0 appearance-none"
                  value={room?.turnDuration}
                  onChange={(e) => {setDrawTime(+e.target.value);}}
                  disabled={!isHost}
                >
                  <option value="30">30</option>
                  <option value="60">60</option>
                  <option value="80">80</option>
                  <option value="100">100</option>
                  <option value="120">120</option>
                </select>
              </div>

            </div>

            <div className="pt-6 mt-4 border-t-2 border-zinc-200">
              {isHost ? (
                <Button className="w-full text-xl font-bold h-16 bg-primary text-white hover:bg-pink-600 rounded-xl playful-hover shadow-sm" onClick={() => navigate("/game")}>
                  Start Game
                </Button>
              ) : (
                <div className="bg-zinc-100 border-2 border-zinc-300 rounded-xl p-4 text-center">
                  <p className="font-bold text-slate-500">Waiting for host to start...</p>
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/" onClick={onLeave} className="text-slate-400 font-bold hover:text-red-500 transition-colors uppercase text-sm tracking-wider">
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
