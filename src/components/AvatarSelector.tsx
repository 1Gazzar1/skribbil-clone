import { Cat, Dog, Bird, Rabbit, Snail, Turtle } from "lucide-react";

const AVATARS = [
  { id: "cat", icon: Cat, color: "bg-red-400" },
  { id: "dog", icon: Dog, color: "bg-blue-400" },
  { id: "bird", icon: Bird, color: "bg-green-400" },
  { id: "rabbit", icon: Rabbit, color: "bg-pink-400" },
  { id: "snail", icon: Snail, color: "bg-purple-400" },
  { id: "turtle", icon: Turtle, color: "bg-yellow-400" },
];

interface AvatarSelectorProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export function AvatarSelector({ onSelect, selectedId }: AvatarSelectorProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-xl font-bold text-slate-700">Choose your Avatar</h3>
      <div className="grid grid-cols-3 gap-4">
        {AVATARS.map((avatar) => {
          const Icon = avatar.icon;
          const isSelected = selectedId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id)}
              className={`flex h-20 w-20 items-center justify-center rounded-2xl border-4 ${
                isSelected
                  ? "border-primary shadow-md scale-110"
                  : "border-transparent bg-zinc-100 playful-shadow-sm hover:scale-105"
              } ${avatar.color} transition-all duration-200 text-white hover:opacity-90`}
            >
              <Icon size={40} strokeWidth={2.5} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
