import { Sparkle } from "lucide-react";

import { COMBO_BONUS_XP } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function ComboMeter({
  combo,
  justScored,
  celebrating = false,
  combosCompleted = 0,
}: {
  combo: number;
  justScored: boolean;
  celebrating?: boolean;
  combosCompleted?: number;
}) {
  const filled = celebrating ? 5 : Math.min(5, combo);
  return (
    <div className="flex flex-col items-center gap-1.5">
      {celebrating ? (
        <div
          key={`combo-boom-${combosCompleted}`}
          className="animate-pop rounded-full bg-flame-soft px-3.5 py-1 font-display text-sm font-semibold tracking-wide text-foreground shadow-card ring-2 ring-star"
        >
          🎉 Combo 5X completo! +{COMBO_BONUS_XP} XP de bônus!
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p
            key={combo}
            className={cn(
              "font-display text-lg tracking-display",
              justScored ? "animate-pop text-star" : "text-link",
            )}
          >
            {combo}X Combo{justScored ? "!" : ""}
          </p>
          {combosCompleted > 0 ? (
            <span className="rounded-full bg-flame-soft px-2 py-0.5 font-display text-[11px] font-semibold tabular-nums text-foreground">
              +{combosCompleted * COMBO_BONUS_XP} XP ({combosCompleted}×)
            </span>
          ) : null}
        </div>
      )}
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Sparkle
            key={i}
            className={cn(
              "size-6 transition-all duration-300",
              i < filled ? "fill-star text-star" : "fill-star-off text-star-off opacity-60",
              (celebrating || (justScored && i === filled - 1)) && "animate-pop",
            )}
          />
        ))}
      </div>
    </div>
  );
}
