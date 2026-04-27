import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Load all SVG doodles from the assets/Doodles folder
const doodleModules = import.meta.glob('/src/assets/Doodles/*.svg', { eager: true });
const AVATARS = Object.values(doodleModules).map((mod: any) => mod.default as string);

interface AvatarSelectorProps {
  onSelect: (id: string) => void;
}

export function AvatarSelector({ onSelect }: AvatarSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (AVATARS.length > 0) {
      // Pick a random index on load
      const randomIdx = Math.floor(Math.random() * AVATARS.length);
      setCurrentIndex(randomIdx);
      onSelect(AVATARS[randomIdx]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevious = () => {
    if (AVATARS.length === 0) return;
    const newIdx = (currentIndex - 1 + AVATARS.length) % AVATARS.length;
    setCurrentIndex(newIdx);
    onSelect(AVATARS[newIdx]);
  };

  const handleNext = () => {
    if (AVATARS.length === 0) return;
    const newIdx = (currentIndex + 1) % AVATARS.length;
    setCurrentIndex(newIdx);
    onSelect(AVATARS[newIdx]);
  };

  if (AVATARS.length === 0) {
    return <div className="text-center p-4 font-bold">No avatars found in /assets/Doodles.</div>;
  }

  const currentAvatarUrl = AVATARS[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-xl font-bold text-slate-700 uppercase tracking-wider">Choose your Avatar</h3>
      <div className="flex items-center space-x-6">
        <button
          type="button"
          onClick={handlePrevious}
          className="p-3 bg-zinc-100 border-4 border-black rounded-2xl hover:bg-zinc-200 playful-hover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-black active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
        
        <div className="flex h-40 w-40 items-center justify-center rounded-3xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
          <img 
            src={currentAvatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-contain drop-shadow-md" 
          />
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 bg-zinc-100 border-4 border-black rounded-2xl hover:bg-zinc-200 playful-hover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-black active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <ChevronRight size={32} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
