import { Check, Flame } from "lucide-react";

import { cn } from "@/lib/utils";

export function StreakCard({ streak, weekDone, saved }: { streak: number; weekDone: number; saved: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="grid size-14 shrink-0 place-items-center rounded-full bg-flame-soft text-3xl">🔥</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={cn("font-display text-3xl font-semibold", saved && "animate-pop")}>{streak}</span>
          <span className="font-display text-xs tracking-display text-muted-foreground">dias seguidos</span>
        </div>
        <div className="mt-1 flex gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <Flame
              key={i}
              className={cn("size-4", i < weekDone ? "fill-flame text-flame" : "fill-flame-off text-flame-off")}
            />
          ))}
        </div>
      </div>
      {saved ? (
        <div className="grid size-7 shrink-0 animate-pop place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" strokeWidth={3} />
        </div>
      ) : (
        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-destructive font-bold text-destructive-foreground">
          !
        </div>
      )}
    </div>
  );
}

export function RewardsRow({ streakDay, xp }: { streakDay: number; xp: number }) {
  const rewards = [
    { icon: "🔥", top: `${streakDay}º dia`, bottom: "na sequência" },
    { icon: "🎁", top: `+${xp} XP`, bottom: "de experiência" },
    { icon: "📝", top: "+1 lição", bottom: "concluída" },
  ];
  return (
    <div className="grid grid-cols-3 divide-x divide-border">
      {rewards.map((r) => (
        <div key={r.bottom} className="flex flex-col items-center gap-1 px-1 text-center">
          <span className="text-xl">{r.icon}</span>
          <span className="font-display text-xs leading-tight tracking-wide">{r.top}</span>
          <span className="font-display text-[11px] leading-tight tracking-wide text-muted-foreground">
            {r.bottom}
          </span>
        </div>
      ))}
    </div>
  );
}
