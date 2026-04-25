import { useEffect, useRef, useState } from "react";
import type { Player } from "@/contexts/GameContext";
import { Trophy, TrendingUp } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────
interface TurnEndOverlayProps {
  newPlayers: Player[];
  oldPlayers: Player[];
  /** Called when the 5-second display period expires */
  onComplete: () => void;
}

const DURATION_MS = 5_000;

// ─── helpers ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-primary",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-teal-500",
];

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

// ─── animated score counter ───────────────────────────────────────────────────
function AnimatedScore({
  from,
  to,
  durationMs,
}: {
  from: number;
  to: number;
  durationMs: number;
}) {
  const [current, setCurrent] = useState(from);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // Delay the count-up slightly so the entry animation settles first
    const delay = setTimeout(() => {
      startRef.current = null;

      const step = (timestamp: number) => {
        if (startRef.current === null) startRef.current = timestamp;
        const elapsed = timestamp - startRef.current;
        const progress = Math.min(elapsed / (durationMs * 0.7), 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(from + (to - from) * eased));
        if (progress < 1) rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    }, 400);

    return () => {
      clearTimeout(delay);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [from, to, durationMs]);

  return <>{current.toLocaleString()}</>;
}

// ─── main component ───────────────────────────────────────────────────────────
export function TurnEndOverlay({
  newPlayers,
  oldPlayers,
  onComplete,
}: TurnEndOverlayProps) {
  const [progress, setProgress] = useState(0); // 0 → 1
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Build a map of old scores keyed by player id
  const oldScoreMap = new Map<string, number>(
    oldPlayers.map((p) => [p.id, p.score])
  );

  // Sort by new score descending
  const sorted = [...newPlayers].sort((a, b) => b.score - a.score);

  // 5-second progress bar + auto-complete
  useEffect(() => {
    startRef.current = null;

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const p = Math.min(elapsed / DURATION_MS, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    /* Backdrop */
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(10, 10, 30, 0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "turn-end-fade-in 0.35s ease forwards",
      }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0f0c29, #302b63, #24243e)",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          animation: "turn-end-panel-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* ── Progress bar (top) ── */}
        <div className="h-1.5 w-full bg-white/10">
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #7c3aed, #ec4899)",
            }}
          />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            <Trophy size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-white font-black text-xl leading-tight tracking-tight">
              Round Results
            </h2>
            <p className="text-white/40 text-xs font-medium mt-0.5">
              Next turn starts in a moment…
            </p>
          </div>
          {/* countdown badge */}
          <div className="ml-auto">
            <span
              className="text-white/60 font-black text-2xl tabular-nums"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {Math.ceil((1 - progress) * (DURATION_MS / 1000))}
            </span>
          </div>
        </div>

        {/* ── Player rows ── */}
        <div className="px-4 pb-5 space-y-2.5">
          {sorted.map((player, index) => {
            const oldScore = oldScoreMap.get(player.id) ?? player.score;
            const gained = player.score - oldScore;
            const isFirst = index === 0;

            return (
              <div
                key={player.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                style={{
                  background: isFirst
                    ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))"
                    : "rgba(255,255,255,0.05)",
                  border: isFirst
                    ? "1px solid rgba(124,58,237,0.4)"
                    : "1px solid rgba(255,255,255,0.07)",
                  animation: `turn-end-row-in 0.4s ${index * 60}ms cubic-bezier(0.34,1.4,0.64,1) both`,
                }}
              >
                {/* Rank */}
                <span
                  className="w-6 text-center font-black text-sm shrink-0"
                  style={{ color: isFirst ? "#f0c040" : "rgba(255,255,255,0.3)" }}
                >
                  {index === 0 ? "🥇" : `#${index + 1}`}
                </span>

                {/* Avatar */}
                <div
                  className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-white ${avatarColor(index)}`}
                >
                  {initials(player.username)}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">
                    {player.username}
                  </p>
                </div>

                {/* Score gain badge */}
                {gained > 0 && (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: "rgba(52, 211, 153, 0.18)",
                      border: "1px solid rgba(52,211,153,0.35)",
                      animation: "turn-end-badge-pop 0.5s 0.5s cubic-bezier(0.34,1.8,0.64,1) both",
                    }}
                  >
                    <TrendingUp size={10} className="text-emerald-400" strokeWidth={2.5} />
                    <span className="text-emerald-400 font-black text-xs">
                      +{gained}
                    </span>
                  </div>
                )}

                {/* Animated total score */}
                <div className="text-right shrink-0 w-16">
                  <span className="text-white font-black text-base tabular-nums">
                    <AnimatedScore
                      from={oldScore}
                      to={player.score}
                      durationMs={DURATION_MS}
                    />
                  </span>
                  <span className="text-white/30 text-[10px] font-semibold ml-0.5">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── keyframes injected inline ── */}
      <style>{`
        @keyframes turn-end-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes turn-end-panel-in {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes turn-end-row-in {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes turn-end-badge-pop {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
