import { useState } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  text: string;
  type: "chat" | "guess" | "system";
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", sender: "System", text: "Game started! You are drawing.", type: "system" },
  { id: "2", sender: "DoodleBob", text: "Is it a cat?", type: "chat" },
  { id: "3", sender: "Picasso", text: "Picasso guessed the word!", type: "system" },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { id: Date.now().toString(), sender: "You", text: input, type: "chat" }
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-blue-200 playful-shadow overflow-hidden">
      <div className="bg-blue-50 text-slate-700 p-4 font-bold text-center text-lg tracking-widest border-b-2 border-blue-100 uppercase">
        Chat & Guesses
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-3 rounded-2xl max-w-[90%] ${
              msg.type === "system" 
                ? "bg-amber-100 text-amber-800 font-bold self-center text-center w-full text-sm rounded-xl py-2" 
                : msg.sender === "You"
                  ? "bg-primary text-white self-end rounded-tr-sm"
                  : "bg-blue-50 text-slate-800 self-start rounded-tl-sm border border-blue-200"
            }`}
          >
            {msg.type !== "system" && <span className={`font-bold text-xs block mb-1 opacity-80 ${msg.sender === "You" ? "text-blue-100" : "text-slate-500"}`}>{msg.sender}</span>}
            <span className={`font-semibold ${msg.type === "system" ? "text-sm" : "text-base"}`}>{msg.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-blue-50 border-t-2 border-blue-100 flex gap-2">
        <input 
          type="text" 
          placeholder="Type your guess..." 
          className="flex-1 rounded-xl border-2 border-blue-200 bg-white text-slate-800 px-4 py-2 font-semibold text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          type="submit" 
          className="bg-primary text-white p-3 rounded-xl hover:bg-blue-600 transition-colors playful-hover shadow-sm flex items-center justify-center"
        >
          <Send size={20} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
