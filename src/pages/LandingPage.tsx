import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarSelector } from "@/components/AvatarSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleHost = () => {
    if (!username || !avatarId) {
      alert("Please enter a username and select an avatar!");
      return;
    }
    navigate("/lobby?mode=host");
  };

  const handleJoin = () => {
    if (!username || !avatarId || !roomCode) {
      alert("Please enter a username, avatar, and room code!");
      return;
    }
    navigate(`/lobby?mode=join&code=${roomCode}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 playful-shadow border border-blue-200">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-primary tracking-tight">
            Skribbil
            <span className="text-amber-400">
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
              className="text-center text-lg font-bold bg-blue-50 border-2 border-blue-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-primary focus-visible:border-primary rounded-xl h-14 transition-colors"
            />
          </div>

          <AvatarSelector selectedId={avatarId} onSelect={setAvatarId} />

          <div className="pt-4 space-y-4 border-t-2 border-blue-100">
            <Button
              className="w-full text-xl font-bold h-14 bg-primary text-white hover:bg-blue-600 rounded-xl playful-hover shadow-sm"
              size="lg"
              onClick={handleHost}
            >
              Host a Room
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-2 border-blue-100"></div>
              <span className="flex-shrink-0 px-4 text-slate-400 font-bold text-sm tracking-widest uppercase">OR</span>
              <div className="flex-grow border-t-2 border-blue-100"></div>
            </div>

            <div className="flex space-x-3">
              <Input
                placeholder="ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="text-center uppercase text-xl font-bold bg-blue-50 border-2 border-blue-200 text-slate-800 rounded-xl h-14"
                maxLength={6}
              />
              <Button
                size="lg"
                onClick={handleJoin}
                className="text-lg font-bold h-14 px-8 bg-amber-400 text-amber-950 hover:bg-amber-500 rounded-xl playful-hover shadow-sm"
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
