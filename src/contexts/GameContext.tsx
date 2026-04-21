import socket from '@/socket';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';

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
  room: Room | null;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  id: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [id,setId] = useState<string | null>(null); 
  
  useEffect(() => {
    socket.onAny((event, data) => { 
      console.log(event, data);
    })
    socket.on("connected", (data : {playerId : string}) => { 
      console.log("Connected",data.playerId)
      setId(data.playerId)
    })
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
    return () => {
      socket.offAny();
      socket.off("connected");
      socket.off("connect");
      socket.off("disconnect");
    }
  },[])
  return (
    <GameContext.Provider value={{ players, setPlayers, room, setRoom, id }}>
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
