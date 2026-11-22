import { Sparkle } from "lucide-react";

import { cn } from "@/lib/utils";

export function ComboMeter({ combo, justScored }: { combo: number; justScored: boolean }) {
  const filled = Math.min(5, combo);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p
        key={combo}
        className={cn(
          "font-display text-lg tracking-display",
          justScored ? "animate-pop text-star" : "text-link",
        )}
      >
        {combo}X Combo{justScored ? "!" : ""}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Sparkle
            key={i}
            className={cn(
              "size-6 transition-colors",
              i < filled ? "fill-star text-star" : "fill-star-off text-star-off",
              justScored && i === filled - 1 && "animate-pop",
            )}
          />
        ))}
      </div>
    </div>
  );
}
