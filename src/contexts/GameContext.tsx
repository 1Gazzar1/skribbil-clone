import type { GameState } from '@/pages/GamePage';
import socket from '@/socket';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toast } from "sonner"

// Assuming roomStateSchema is an enum for the different states a room can be in.
// If you have a different definition for this, you can replace it!
export const roomStateSchema = z.enum(["LOBBY", "PLAYING", "ROUND_END", "GAME_OVER"]);

export const playerSchema = z.object({
    roomId: z.string(),
    id: z.string(),
    username: z.string(),
    score: z.number(),
    joinedAt: z.number(), // Date.now
    playedThisRound: z.boolean(),
    scoreGainedThisTurn: z.number(),
});

export const roomSchema = z.object({
    id: z.string(),
    state: roomStateSchema,
    correctWord: z.string().optional(),
    wordOptions: z.array(z.string()),
    noOfRounds: z.number(),
    currentRound: z.number(),
    turnDuration: z.number(), // in seconds
    turnStartTime: z.number(),
    maxPlayers: z.number(),
    drawingPlayerId: z.string(), // defaults to host
    hostId: z.string(),
});

export type Player = z.infer<typeof playerSchema>;
export type Room = z.infer<typeof roomSchema>;
export type RoomState = z.infer<typeof roomStateSchema>;

interface GameContextType {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  room: Room | Omit<Room, "wordOptions"> | null;
  setRoom: React.Dispatch<React.SetStateAction<Room | Omit<Room, "wordOptions"> | null>>;
  id: string | null;
  initialState: GameState | null; 
  setInitialState: React.Dispatch<React.SetStateAction<GameState | null>>;
  correctWordLength: number | null; 
  setCorrectWordLength: React.Dispatch<React.SetStateAction<number | null>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<Room|Omit<Room,"wordOptions"> | null>(null);
  const [id,setId] = useState<string | null>(null); 
  const [initialState,setInitialState] = useState<GameState | null>(null)
  const [cwl,setCwl] = useState<number | null > (null)
  const navigate = useNavigate()
  useEffect(() => {
    socket.onAny((event, data) => { 
      console.log(event, data);
    })
    socket.on("connected", (data : {playerId : string}) => { 
      // console.log("Connected",data.playerId)
      setId(data.playerId)
    })
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
    socket.on("player.left", (data : {username : string}) => { 
      toast.error(`${data.username} left the game`,{position: "top-right"})
    })
    socket.on("game.return_to_lobby", () => { 
      handleLeave()
    })
    
    const handleLeave = () => {
      setPlayers([]);
      setRoom(null);
      setInitialState(null);
      setCwl(null);
      socket.disconnect(); // to fire a "disconnecting" event.
      navigate("/")
      socket.connect() // to generate a new socket.id      
    }
    window.addEventListener("beforeunload",handleLeave);
    window.addEventListener("popstate",handleLeave); // if the user goes back in the page while in the lobby or during the game
    return () => {
      socket.offAny();
      socket.off("player.left"); 
      socket.off("game.return_to_lobby");
      socket.off("connected");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("leave");
      window.removeEventListener("beforeunload",handleLeave);
      window.removeEventListener("popstate",handleLeave);
    }
  },[])
  return (
    <GameContext.Provider value={{ correctWordLength : cwl , setCorrectWordLength: setCwl , players, setPlayers, room, setRoom, id, initialState, setInitialState }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
