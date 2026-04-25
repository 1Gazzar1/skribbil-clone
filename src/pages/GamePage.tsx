import { useEffect, useState } from "react";
import { PlayerList } from "@/components/PlayerList";
import { GameCanvas } from "@/components/GameCanvas";
import { ChatPanel } from "@/components/ChatPanel";
import socket from "@/socket";
import { useGame, type Player, type Room } from "@/contexts/GameContext";
import * as z from "zod"

const canvasEventTypeSchema = z.union([
    z.literal("newStroke"),
    z.literal("oldStroke"),
    z.literal("undo"),
]);
const canvasToolSchema = z.union([
        z.literal("pen"),
        z.literal("eraser"),
        z.literal("bucket"),
        z.literal("clear"),
    ])
export const canvasSchema = z.object({
    x: z.number(),
    y: z.number(),
    tool: canvasToolSchema,
    color: z.string(),
    size: z.number(),
    eventType: canvasEventTypeSchema,
});
export type Canvas = z.infer<typeof canvasSchema>;
export type CanvasEventType = z.infer<typeof canvasEventTypeSchema>;

export type GameState = ChoosingState | DrawingState | GuessingState | WaitingState | TurnEndState | GameOverState
export type GameStateUnion = Pick<GameState, "state">
export type ChoosingState = { 
  state : "choosing", 
  words: string[],
  chooseHandler: (word: string) => void;  
}
export type DrawingState = { 
  state : "drawing", 
  word : string, 
  onDraw: (canvas: Canvas) => void; 
}
export type GuessingState = { 
  state : "guessing", 
  wordLength : number | null, 
  canvasEvent: Canvas | null; // null when first rendered 
}
// for guessing players waiting for drawer to choose a word 
// disable guessing 
export type WaitingState = { 
  state : "waiting"
}
// drawer's turn ends, to show a panel with players' old and new scores 
export type TurnEndState = { 
  state : "turn_end";
  newPlayers: Player[];
  oldPlayers: Player[];
}
export type GameOverState = { 
  state : "game_over"
}
export default function GamePage() {
  const {setRoom, players,setCorrectWordLength, correctWordLength,  room, initialState} = useGame()
  const [gameState, setGameState] = useState<GameState>(initialState ?? {state : "waiting"} );
  useEffect(() => {
    socket.on("game.words", (data : {words : string[]}) => { 
      setGameState( { 
        state: "choosing", 
        words: data.words, 
        chooseHandler: onChooseWord, 
      })
    })
    // this one only has the word's length
    // for everyone except the drawer 
    socket.on("game.word_chosen", (data : { wordLength : number}) => { 
      setGameState({ 
        state: "guessing", 
        wordLength : data.wordLength, 
        canvasEvent: null,
        
      })
      setCorrectWordLength(data.wordLength);
     })
    // this one is for the drawer only
    socket.on("game.word", (data: {word : string}) => {
      setGameState({ 
        state : "drawing", 
        word: data.word, 
        onDraw, 
      })
    }) 
    // this is to the whole room
    // username & id to know if the player is the one who sent it
    socket.on("game.guess.wrong", (data : { 
      guess: string, 
      username: string,
      playerId: string
    }) => { 

    })
    // this is sent only for the guesser
    socket.on("game.guess.close", () => { 

    })
    // notify the whole room that this player got it right
    socket.on("game.guess.correct", (data: { 
      playerId: string, 
      username : string, 
    }) => { 

    })
    socket.on("game.turn_end", (data : 
      {  newPlayers : Player[],
          oldPlayers: Player[],}) => {
      setGameState({ 
        state: "turn_end", 
        newPlayers : data.newPlayers, 
        oldPlayers : data.oldPlayers
      })
    })
    // this will be for the whole room
    // except the drawer 
    socket.on("canvas.draw", (data: Canvas) => { 
      setGameState({ 
        state: "guessing", 
        wordLength: correctWordLength, 
        canvasEvent: data, 
      })
    })
    return () => { 
      socket.off("game.words")
      socket.off("game.word");
      socket.off("game.word_chosen");
      socket.off("game.turn_end"); 
      socket.off("game.guess.close")
      socket.off("game.guess.wrong")
      socket.off("game.guess.correct")
    }
  }, [])
  function onChooseWord(word: string) {
    socket.emit("game.choose_word", { roomId : room?.id,word })
  }
  function onGuessWord(guess : string) { 
    socket.emit("game.guess", { roomId: room?.id,  guess})
  }
  // only the drawer emits this event  
  function onDraw(canvas: Canvas) { 
    socket.emit("canvas.draw", {roomId : room?.id, canvas})
  }

  const isDrawing = gameState?.state === "drawing";

  return (
    <div className="relative z-10 w-full flex flex-col overflow-x-hidden">

      {/* ══════════════════════════════════════════
          MOBILE layout (< md): fixed 100dvh sections
          ══════════════════════════════════════════ */}
      <div className="md:hidden h-[100dvh] flex flex-col overflow-hidden">

        {/* ── 10%: Word / Timer bar ── */}
        <div className="h-[10dvh] shrink-0 flex items-center justify-between gap-2 px-3 bg-white border-b-2 border-blue-100 rounded-sm">
          <div className="text-primary font-black text-sm tracking-wide bg-primary/10 px-3 py-1 rounded-xl border-2 border-primary/20 shrink-0">
            01:24
          </div>
          <div className="flex-1 text-center min-w-0">
            <h2 className={`text-lg font-black text-slate-800 tracking-[0.25em] truncate ${gameState?.state === "guessing" ? "blur-[2px]" : ""}`}>
              {gameState?.state === "choosing" ? "WAITING..." : "_ _ A _ _ E"}
            </h2>
          </div>
          <div className="text-slate-500 font-bold text-xs bg-blue-50 px-2.5 py-1 rounded-xl border-2 border-blue-200 shrink-0">
            R&nbsp;1/3
          </div>
        </div>

        {/* ── 50%: Canvas (no header, floating toolbar) ── */}
        <div className="h-[50dvh] shrink-0">
          <GameCanvas gameState={gameState} showHeader={false} compact />
        </div>

        {/* ── 40%: Players (left) + Chat (right) ── */}
        <div className="h-[40dvh] shrink-0 flex gap-1.5 px-2 pb-2 pt-1.5 overflow-hidden">
          <div className="w-1/2 h-full overflow-hidden">
            <PlayerList />
          </div>
          <div className="w-1/2 h-full overflow-hidden">
            <ChatPanel onGuess={onGuessWord} />
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════
          TABLET + DESKTOP layout (≥ md): fixed height
          ══════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col h-screen p-4 lg:p-6 overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px] flex gap-4 lg:gap-6 h-full">

          {/* Left: Players — desktop only */}
          <div className="w-[240px] xl:w-[280px] shrink-0 h-full hidden lg:block">
            <PlayerList />
          </div>

          {/* Center: Canvas */}
          <div className="flex-1 h-full min-w-0">
            <GameCanvas gameState={gameState} />
          </div>

          {/* Right: Chat */}
          <div className="w-[280px] xl:w-[320px] shrink-0 h-full">
            <ChatPanel onGuess={onGuessWord} />
          </div>

        </div>
      </div>
    </div>
  );
}

