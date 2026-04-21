import { useMemo } from 'react';

// Dynamically import all SVGs from the Doodles folder
const svgModules = import.meta.glob('../assets/Doodles/*.svg', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

const DOODLES = Object.values(svgModules);

export function DoodleBackground() {
  // Create a randomized grid of doodles to maintain a dense pattern
  const grid = useMemo(() => {
    const items = [];
    const numRows = 8;
    const numCols = 16;
    
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        // Randomly pick a doodle
        const doodle = DOODLES[Math.floor(Math.random() * DOODLES.length)];
        const isWhiteTile = (r + c) % 2 === 0;

        items.push(
          <div 
            key={`${r}-${c}`} 
            className={`flex items-center rounded-2xl hover:p-2 transition-all duration-300 justify-center p-6 w-[150px] h-[150px] ${isWhiteTile ? 'bg-white' : 'bg-zinc-950'}`}
          >
            <img 
              src={doodle} 
              alt="" 
              className={`w-full h-full object-contain  pointer-events-auto ${
                isWhiteTile 
                  ? 'opacity-60 hover:opacity-100 transition-all duration-300 mix-blend-multiply' 
                  : 'opacity-50 hover:opacity-100 transition-all duration-300 mix-blend-screen'
              }`}
              style={{ filter: isWhiteTile ? 'none' : 'invert(1) brightness(1.5)' }}
            />
          </div>
        );
      }
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-zinc-950">
      <div className="absolute top-0 left-0 w-[4800px] h-[2400px] flex flex-wrap animate-[scroll-bg_240s_linear_infinite]">
        {/* We need 4 quadrants to make diagonal scrolling seamless */}
        <div className="flex flex-wrap w-[2400px] h-[1200px] shrink-0 content-start">{grid}</div>
        <div className="flex flex-wrap w-[2400px] h-[1200px] shrink-0 content-start">{grid}</div>
        <div className="flex flex-wrap w-[2400px] h-[1200px] shrink-0 content-start">{grid}</div>
        <div className="flex flex-wrap w-[2400px] h-[1200px] shrink-0 content-start">{grid}</div>
      </div>
      {/* Dim overlay — sits above the grid but below page content */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-10" />
    </div>
  );
}
