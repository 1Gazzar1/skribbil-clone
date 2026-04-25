import { useState } from "react";
import { Send } from "lucide-react";
import type { Message } from "@/pages/GamePage";
import  { useGame } from "@/contexts/GameContext";

export function ChatPanel({ onGuess, messages}: { onGuess?: (guess: string) => void, messages: Message[] }) {
  const [input, setInput] = useState("");
  const {id, room} = useGame()
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onGuess?.(input.trim());

    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-sm md:rounded-3xl border border-blue-200 playful-shadow overflow-hidden">
      <div className="bg-blue-50 text-slate-700 py-1.5 md:p-4 font-bold text-center text-xs md:text-lg tracking-widest border-b-2 border-blue-100 uppercase shrink-0">
        Chat
      </div>

      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1.5 md:space-y-3 flex flex-col">
        {messages.map((msg) => (

          <div
            key={msg.playerId}
            className={`px-2 py-1.5 md:p-3 rounded-xl md:rounded-2xl max-w-[92%] 
              
              ${msg.playerId === id ? "ms-auto" : ""} 

              
              ${
              msg.type === "CLOSE"
                ? "bg-amber-200 text-amber-800 font-bold self-center text-center w-full text-[10px] md:text-sm rounded-lg py-1"
                : msg.type === "CORRECT"
                ? "bg-green-200 text-green-800 font-bold self-center text-center w-full text-[10px] md:text-sm rounded-lg py-1"
                : msg.type === "CHAT_AFTER_GUESS"
                ? "bg-primary text-white self-end rounded-tr-sm"
                : "bg-blue-50 text-slate-800 self-start rounded-tl-sm border border-blue-200"
            }`}
          >
            {msg.type !== "CORRECT" && msg.type !== "CLOSE" && msg.type !== "CHAT_AFTER_GUESS" && (
              <span className={`font-bold text-[10px] md:text-xs block mb-0.5 opacity-80`}>
                {msg.username}
              </span>
            )}
            <span className={`font-semibold ${msg.type === "CORRECT" || msg.type === "CLOSE" || msg.type === "CHAT_AFTER_GUESS" ? "text-[10px] md:text-sm" : "text-xs md:text-base"}`}>
              {msg.message}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-1.5 md:p-4 bg-blue-50 border-t-2 border-blue-100 flex gap-1.5 md:gap-2 shrink-0">
        <input
          disabled={room?.drawingPlayerId === id}
          type="text"
          placeholder="Guess..."
          className={`flex-1 rounded-lg md:rounded-xl border-2 border-blue-200 ${room?.drawingPlayerId === id ? "bg-gray-200/50" : "bg-white"} text-slate-800 px-2 md:px-3 py-1 md:py-2 font-semibold text-xs md:text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={room?.drawingPlayerId === id}
          type="submit"
          className={`bg-primary text-white p-1.5 md:p-3 rounded-lg md:rounded-xl hover:bg-primary/80 ${room?.drawingPlayerId === id ? "bg-primary/50" : ""} transition-colors shadow-sm flex items-center justify-center shrink-0`}
        >
          <Send size={14} className="md:hidden" strokeWidth={2.5} />
          <Send size={18} className="hidden md:block" strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
