import { useEffect, useState, useRef } from "react";
import { PlayerList } from "@/components/PlayerList";
import { GameCanvas } from "@/components/GameCanvas";
import { ChatPanel } from "@/components/ChatPanel";
import { TurnEndOverlay } from "@/components/TurnEndOverlay";
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
  startTimer: boolean; // this timer isn't for the round, it's for the 15s word choosing 
}
export type DrawingState = { 
  state : "drawing", 
  word : string, 
  onDraw: (canvas: Canvas) => void; 
  startTimer: boolean; // startTimer can happen to both guessers and drawers ( the actual turn )
  // it's in the drawing and guessing state so it covers both states 
}
export type GuessingState = { 
  state : "guessing", 
  wordLength : number | null, 
  canvasEvent: Canvas | null; // null when first rendered 
  startTimer: boolean;
}
// for guessing players waiting for drawer to choose a word 
// disable guessing 
export type WaitingState = { 
  state : "waiting"
  startTimer: boolean; // this timer isn't for the round, it's for the 15s word choosing 
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

export function GameHeader({ gameState }: { gameState: GameState }) {
  const { room } = useGame();
  const [timer, setTimer] = useState(0);
  const intervalIdRef = useRef<number>(0);

  // Timer countdown logic
  useEffect(() => {
    // if state changes at all we reset the timer 
    clearInterval(intervalIdRef.current as number)
    if ((gameState?.state !== 'guessing' &&
      gameState?.state !== 'drawing' &&
      gameState?.state !== "waiting" &&
      gameState?.state !== "choosing") || !("startTimer" in gameState) || !gameState.startTimer) return;
    

    if (gameState.state === "guessing" || gameState.state === "drawing") {
      setTimer(room?.turnDuration || 0)
    }
    if (gameState.state === "waiting" || gameState.state === "choosing") {
      setTimer(15) // the 15s 
    }
    intervalIdRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalIdRef.current as number);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalIdRef.current as number);
  }, [gameState, room?.turnDuration]);

  const wordString = gameState.state === "choosing" || gameState.state === "waiting"
    ? "WAITING..." 
    : (gameState.state === "guessing" && gameState.wordLength)
      ? Array(gameState.wordLength).fill('_').join(' ')
      : (gameState.state === "drawing" ? gameState.word.split('').join(' ') : "_ _ _ _ _ _");

  const hintString = gameState.state === "choosing" || gameState.state === "waiting"
    ? "Waiting for drawer"
    : (gameState.state === "guessing" && gameState.wordLength)
      ? `${gameState.wordLength} letters`
      : "";

  return (
    <div className="h-[10dvh] md:h-auto shrink-0 flex items-center justify-between gap-2 px-3 md:px-6 py-2 md:py-4 bg-white border-b-2 border-blue-100 md:border md:border-blue-200 md:rounded-3xl md:playful-shadow z-10 relative">
      <div className="text-primary font-black md:font-bold text-sm md:text-2xl tracking-wide md:tracking-wider bg-primary/10 px-3 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl border-2 border-primary/20 shrink-0">
        {timer}
      </div>
      <div className="flex-1 text-center min-w-0 group">
        <h2 className={`${gameState.state === "guessing" ? "animate-pulse" : ""} text-lg md:text-4xl font-black text-slate-800 tracking-[0.25em] md:tracking-[0.4em] transition-transform duration-500 truncate`}>
          {wordString}
        </h2>
        {hintString && (
          <p className="hidden md:block text-slate-500 font-bold mt-1 text-sm tracking-widest uppercase">
            {hintString}
          </p>
        )}
      </div>
      <div className="text-slate-500 font-bold text-xs md:text-xl bg-blue-50 px-2.5 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl border-2 border-blue-200 shrink-0">
        <span className="md:hidden">R {room?.currentRound || "N/A"}/{room?.noOfRounds || "N/A"}</span>
        <span className="hidden md:inline">Round {room?.currentRound || "N/A"} / {room?.noOfRounds || "N/A"}</span>
      </div>
    </div>
  );
}
export type Message = {username: string, message: string, playerId: string, type: "CORRECT" | "CLOSE" | "NORMAL_GUESS" | "CHAT_AFTER_GUESS"};
export default function GamePage() {
  const {setRoom, players,setPlayers,setCorrectWordLength, correctWordLength,  room, initialState} = useGame()
  const [gameState, setGameState] = useState<GameState>(initialState ?? {state : "waiting", startTimer: true} );
  const [chat,setChat] = useState<Message[]>([])
  useEffect(() => {
    socket.on("game.words", (data : {words : string[]}) => { 
      setGameState( { 
        state: "choosing", 
        words: data.words, 
        chooseHandler: onChooseWord, 
        startTimer: true,
      })
    })
    // this one only has the word's length
    // for everyone except the drawer 
    socket.on("game.word_chosen", (data : { wordLength : number}) => { 
      setGameState({ 
        state: "guessing", 
        wordLength : data.wordLength, 
        canvasEvent: null,
        startTimer: true,
        
      })
      setCorrectWordLength(data.wordLength);
     })
    // this one is for the drawer only
    socket.on("game.word", (data: {word : string}) => {
      setGameState({ 
        state : "drawing", 
        word: data.word, 
        onDraw, 
        startTimer: true,
      })
    }) 
    // this is to the whole room
    // username & id to know if the player is the one who sent it
    socket.on("game.guess.wrong", (data : { 
      guess: string, 
      username: string,
      playerId: string
    }) => { 
      setChat((prev) => [...prev, {username: data.username, message: data.guess, playerId: data.playerId,type:"NORMAL_GUESS"}])
    })
    // this is sent only for the guesser
    socket.on("game.guess.close", () => { 
      setChat((prev) => [...prev, {username: "NOT_PLAYER", message: "you're close ! 🍉", playerId: "NOT_PLAYER", type: "CLOSE"}])
    })
    // notify the whole room that this player got it right
    socket.on("game.guess.correct", (data: { 
      playerId: string, 
      username : string, 
    }) => { 
      setChat((prev) => [...prev, {username: "NOT_PLAYER", message: `${data.username} got it right ! 🎉`, playerId: data.playerId,type: "CORRECT"}])
    })
    socket.on("game.guess.chat", (data: {
      username: string
      playerId: string
      message: string
    }) => { 
      setChat((prev) => [...prev, {username: data.username, message: data.message, playerId: data.playerId,type: "CHAT_AFTER_GUESS"}])
    })
    // this will be recieved by all players after 5s of 'turn_end'
    socket.on("game.turn_start", (data: { room : Omit<Room , "wordOptions">}) => { 
      setGameState({state : "waiting", startTimer: true})
      setRoom(data.room)
    })
    socket.on("game.turn_end", (data : 
      {  newPlayers : Player[],
          oldPlayers: Player[],}) => {
      setGameState({ 
        state: "turn_end", 
        newPlayers : data.newPlayers, 
        oldPlayers : data.oldPlayers
      })
      setPlayers(data.newPlayers)
    })
    // this will be for the whole room
    // except the drawer 
    socket.on("canvas.draw", (data: Canvas) => { 
      setGameState({ 
        state: "guessing", 
        wordLength: correctWordLength, 
        canvasEvent: data, 
        startTimer: false,
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
      socket.off("game.guess.chat")
      socket.off("canvas.draw")
      socket.off("game.turn_start")
    }
  }, [])

  useEffect(() => {
    setChat([])
  }, [gameState.state])
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

  function handleTurnEndComplete() {
    // The overlay dismisses itself after 5 s; the server will have already
    // sent game.turn_start (or game.words for the next drawer) by then.
    // We don't need to proactively change state — just hide the overlay.
    setGameState({ state: "waiting", startTimer: true});
  }

  return (
    <div className="relative z-10 w-full flex flex-col overflow-x-hidden">

      {/* ══════════════════════════════════════════
          MOBILE layout (< md): fixed 100dvh sections
          ══════════════════════════════════════════ */}
      <div className="md:hidden h-[100dvh] flex flex-col overflow-hidden">
        <GameHeader gameState={gameState} />

        {/* ── 50%: Canvas (no header, floating toolbar) ── */}
        <div className="h-[50dvh] shrink-0">
          <GameCanvas gameState={gameState} compact />
        </div>

        {/* ── 40%: Players (left) + Chat (right) ── */}
        <div className="h-[40dvh] shrink-0 flex gap-1.5 px-2 pb-2 pt-1.5 overflow-hidden">
          <div className="w-1/2 h-full overflow-hidden">
            <PlayerList players={players} />
          </div>
          <div className="w-1/2 h-full overflow-hidden">
            <ChatPanel onGuess={onGuessWord} messages={chat}/>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════
          TABLET + DESKTOP layout (≥ md): fixed height
          ══════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col h-screen p-4 lg:p-6 overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px] flex flex-col h-full min-h-0">
          <GameHeader gameState={gameState} />
          
          <div className="flex gap-4 lg:gap-6 flex-1 min-h-0 mt-4">
            {/* Left: Players — desktop only */}
            <div className="w-[240px] xl:w-[280px] shrink-0 h-full hidden lg:block">
              <PlayerList players={players} />
            </div>

            {/* Center: Canvas */}
            <div className="flex-1 h-full min-w-0">
              <GameCanvas gameState={gameState} />
            </div>

            {/* Right: Chat */}
            <div className="w-[280px] xl:w-[320px] shrink-0 h-full">
              <ChatPanel onGuess={onGuessWord} messages={chat}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── Turn-end score overlay ── */}
      {gameState.state === "turn_end" && (
        <TurnEndOverlay
          newPlayers={gameState.newPlayers}
          oldPlayers={gameState.oldPlayers}
          onComplete={handleTurnEndComplete}
        />
      )}
    </div>
  );
}

