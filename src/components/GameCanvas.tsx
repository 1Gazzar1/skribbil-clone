import { useRef, useState, useEffect } from "react";
import { PenTool, PaintBucket, Eraser, Trash2, Undo } from "lucide-react";
import type { GameState } from "../pages/GamePage";

const COLORS = [
  "#000000", "#ef4444", "#3b82f6", "#22c55e", 
  "#eab308", "#a855f7", "#ec4899", "#f97316",
  "#ffffff", "#fca5a5", "#93c5fd", "#86efac",
  "#fef08a", "#d8b4fe", "#fbcfe8", "#fdba74"
];

const BRUSH_SIZES = [
  { size: 4, iconSize: 10 },
  { size: 8, iconSize: 14 },
  { size: 16, iconSize: 18 },
  { size: 24, iconSize: 24 },
];

export function GameCanvas({ gameState }: { gameState?: GameState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].size);
  const [tool, setTool] = useState<"pen" | "eraser" | "bucket">("pen");
  
  // History for Undo
  const historyRef = useRef<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Throttling draw rate (30fps)
  const lastDrawTimeRef = useRef(0);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set actual size in memory (scaled to account for display size)
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial blank state
    saveHistoryState(canvas, ctx);

    const handleResize = () => {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imgData, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveHistoryState = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = historyRef.current.slice(0, historyStep + 1);
    newHistory.push(data);
    historyRef.current = newHistory;
    setHistoryStep(newHistory.length - 1);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState && gameState !== "drawing") return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    if (tool === "bucket") {
      fillCanvas();
      return;
    }

    setIsDrawing(true);
    lastDrawTimeRef.current = performance.now();
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Draw a single dot if it's just a click
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState && gameState !== "drawing") return;
    e.preventDefault();
    if (!isDrawing) return;
    
    // Throttle to 60 FPS (approx 16ms per frame)
    const now = performance.now();
    if (now - lastDrawTimeRef.current < 16) {
      return;
    }
    lastDrawTimeRef.current = now;

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    console.log(e)
    console.log(coords)
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.closePath();
        saveHistoryState(canvas, ctx);
      }
      setIsDrawing(false);
    }
  };

  const fillCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState(canvas, ctx);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      
      const newStep = historyStep - 1;
      ctx.putImageData(historyRef.current[newStep], 0, 0);
      setHistoryStep(newStep);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState(canvas, ctx);
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      
      {/* Top Header: Word / Hint */}
      <div className="flex justify-between items-center bg-white rounded-3xl border border-blue-200 playful-shadow p-4 mb-4">
        <div className="text-primary font-bold text-2xl tracking-wider bg-primary/10 px-6 py-2 rounded-2xl border-2 border-primary/20">
          01:24
        </div>
        <div className="flex-1 text-center group">
          <h2 className={`text-4xl font-black text-slate-800 tracking-[0.4em] transition-transform duration-500 ${gameState === "guessing" ? "blur-[2px] hover:blur-none" : ""}`}>
            {gameState === 'choosing' ? "WAITING..." : "_ _ A _ _ E"}
          </h2>
          <p className="text-slate-500 font-bold mt-1 text-sm tracking-widest uppercase">
            {gameState === 'choosing' ? "Choosing a word" : "6 letters"}
          </p>
        </div>
        <div className="text-slate-500 font-bold text-xl bg-blue-50 px-6 py-2 rounded-2xl border-2 border-blue-200">
          Round 1/3
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-white rounded-3xl border border-blue-200 playful-shadow overflow-hidden relative min-h-[400px]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full block touch-none ${gameState === 'drawing' ? 'cursor-crosshair' : 'cursor-default pointer-events-none'}`}
        />
        
        {/* Overlay for "Choosing" State */}
        {gameState === 'choosing' && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl border-2 border-blue-200 shadow-xl text-center max-w-lg w-full transform transition-all scale-100">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Choose a word</h3>
              <p className="text-slate-500 font-semibold mb-6">You are drawing next!</p>
              <div className="flex gap-4 justify-center">
                {["Apple", "Elephant", "Skateboard"].map(word => (
                  <button 
                    key={word}
                    className="flex-1 bg-blue-50 border-2 border-blue-200 text-slate-700 font-bold text-xl py-4 px-6 rounded-2xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all playful-hover shadow-sm"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className={`bg-white rounded-3xl border border-blue-200 playful-shadow p-3 mt-4 flex items-center justify-between gap-4 overflow-x-auto transition-opacity duration-300 ${gameState !== 'drawing' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Tools */}
        <div className="flex gap-2 bg-blue-50 p-2 rounded-2xl border border-blue-200">
          <button 
            onClick={() => setTool("pen")}
            className={`p-3 rounded-xl transition-all ${tool === 'pen' ? 'bg-primary text-white shadow-sm scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
          >
            <PenTool size={24} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setTool("bucket")}
            className={`p-3 rounded-xl transition-all ${tool === 'bucket' ? 'bg-primary text-white shadow-sm scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
          >
            <PaintBucket size={24} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setTool("eraser")}
            className={`p-3 rounded-xl transition-all ${tool === 'eraser' ? 'bg-primary text-white shadow-sm scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
          >
            <Eraser size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Colors */}
        <div className="flex-1 flex flex-wrap gap-2 justify-center max-w-md bg-blue-50 p-3 rounded-2xl border border-blue-200">
          {COLORS.map((c) => (
            <button 
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 border-zinc-800 shadow-sm transition-transform ${color === c ? 'ring-4 ring-primary/40 ring-offset-2 ring-offset-slate-50 scale-125 z-10' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Sizes and Actions */}
        <div className="flex gap-4 items-center border-l-2 border-blue-200 pl-6">
          <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-2xl border border-blue-200">
            {BRUSH_SIZES.map((b) => (
              <button 
                key={b.size}
                onClick={() => setBrushSize(b.size)}
                className={`flex items-center justify-center p-2 rounded-xl transition-all w-10 h-10 ${brushSize === b.size ? 'bg-slate-200 scale-110' : 'hover:bg-slate-200 bg-transparent'}`}
              >
                <div 
                  className={`rounded-full ${brushSize === b.size ? "bg-zinc-100" : "bg-zinc-500"}`} 
                  style={{ width: b.iconSize, height: b.iconSize }} 
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={undo}
              disabled={historyStep <= 0}
              className="p-3 bg-blue-50 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-blue-200 transition-all text-slate-400 hover:text-slate-700 shadow-sm" 
              title="Undo"
            >
              <Undo size={24} strokeWidth={2.5} />
            </button>
            <button 
              onClick={clearCanvas}
              className="p-3 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all text-red-500 hover:text-red-700 shadow-sm" 
              title="Clear Canvas"
            >
              <Trash2 size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
