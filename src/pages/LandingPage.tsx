import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarSelector } from "@/components/AvatarSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import socket from "@/socket";
import { useGame, type Player, type Room } from "@/contexts/GameContext";

export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();
  const { room, setRoom, setPlayers } = useGame()

  useEffect(() => {
    if (room?.id) {
      navigate(`/lobby/${room.id}`);
    }
  }, [room?.id, navigate]);

  useEffect( () => { 
    socket.on("room.created", (data: { room : Room, players : Player[]}) => {
      console.log("Room created", data);
      setRoom(data.room)
      setPlayers(data.players)
    });
    socket.on("room.updated", (data: { room : Room, players : Player[]}) => {
      console.log("Room updated", data);
      if (data.room){ 
        setRoom(data.room)
      }
      if (data.players) { 
        setPlayers(data.players)
      }
    });
    return () => {
      socket.off("room.created");
      socket.off("room.updated");
    };
  },[])

  function onRoomCreate() {
    socket.emit("room.create", {
      username,
    });
    
  }
  function onRoomJoin() { 
    socket.emit("room.join", {
      username,
      roomId : roomCode,
    });
  }   
    
  const handleHost = () => {
    if (!username || !avatarId) {
      alert("Please enter a username and select an avatar!");
      return;
    }
    onRoomCreate();
  };

  const handleJoin = () => {
    if (!username || !avatarId || !roomCode) {
      alert("Please enter a username, avatar, and room code!");
      return;
    }
    onRoomJoin();
  };
  
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 pointer-events-none z-20">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 playful-shadow border-4 border-black pointer-events-auto">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-primary tracking-tight mb-4 flex flex-col items-center">
            <span>Skribbil</span>
            <span className="text-white bg-black px-3 py-1 rounded-xl -rotate-3 inline-block mt-1 text-4xl">
              .clone
            </span>
          </h1>
          <p className="text-lg font-bold text-slate-500">Draw, guess, and laugh!</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Your Name
            </label>
            <Input
              id="username"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-center text-lg font-bold bg-zinc-100 border-2 border-zinc-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-primary focus-visible:border-primary rounded-xl h-14 transition-colors"
            />
          </div>

          <AvatarSelector selectedId={avatarId} onSelect={setAvatarId} />

          <div className="pt-4 space-y-4 border-t-2 border-zinc-200">
            <Button
              className="w-full text-xl font-bold h-14 bg-primary text-white hover:bg-pink-600 rounded-xl playful-hover shadow-sm"
              size="lg"
              onClick={handleHost}
            >
              Host a Room
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-2 border-zinc-200"></div>
              <span className="flex-shrink-0 px-4 text-slate-400 font-bold text-sm tracking-widest uppercase">OR</span>
              <div className="flex-grow border-t-2 border-zinc-200"></div>
            </div>

            <div className="flex space-x-3">
              <Input
                placeholder="ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="text-center uppercase text-xl font-bold bg-zinc-100 border-2 border-zinc-300 text-slate-800 rounded-xl h-14"
              />
              <Button
                size="lg"
                onClick={handleJoin}
                className="text-lg font-bold h-14 px-8 bg-black text-white hover:bg-zinc-800 rounded-xl playful-hover shadow-sm"
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
