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
    const numCols = 15;
    
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        // Randomly pick a doodle
        const doodle = DOODLES[Math.floor(Math.random() * DOODLES.length)];
        items.push(
          <div key={`${r}-${c}`} className="flex items-center justify-center p-6 w-[150px] h-[150px]">
            {/* 
              By using mix-blend-mode: multiply, any white backgrounds in the SVGs will 
              become completely transparent against the light blue container background, 
              while the black lines stay perfectly intact! 
            */}
            <img 
              src={doodle} 
              alt="" 
              className="w-full h-full object-contain opacity-10 hover:opacity-20 transition-opacity duration-300 pointer-events-auto mix-blend-multiply" 
            />
          </div>
        );
      }
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-sky-50">
      <div className="absolute top-0 left-0 w-[4500px] h-[2400px] flex flex-wrap animate-[scroll-bg_240s_linear_infinite]">
        {/* We need 4 quadrants to make diagonal scrolling seamless */}
        <div className="flex flex-wrap w-[2250px] h-[1200px] shrink-0 content-start">{grid}</div>
        <div className="flex flex-wrap w-[2250px] h-[1200px] shrink-0 content-start">{grid}</div>
        <div className="flex flex-wrap w-[2250px] h-[1200px] shrink-0 content-start">{grid}</div>
        <div className="flex flex-wrap w-[2250px] h-[1200px] shrink-0 content-start">{grid}</div>
      </div>
    </div>
  );
}
