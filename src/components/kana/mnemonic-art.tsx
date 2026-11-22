import { toneBg, type CharItem } from "@/data/kana";
import { cn } from "@/lib/utils";

/** The memory picture for a character: illustration when available, otherwise emoji on its color. */
export function MnemonicArt({ item, className }: { item: CharItem; className?: string }) {
  if (item.image) {
    return (
      <div className={cn("overflow-hidden rounded-full", toneBg[item.tone], className)}>
        <img src={item.image} alt={item.mnemonic} className="size-full scale-[1.04] object-cover" loading="lazy" />
      </div>
    );
  }
  return (
    <div className={cn("relative grid place-items-center overflow-hidden rounded-full", toneBg[item.tone], className)}>
      <span
        aria-hidden
        className="absolute font-display text-[3.2em] leading-none text-primary-foreground/35 select-none"
      >
        {item.char}
      </span>
      <span role="img" aria-label={item.mnemonic} className="relative text-[1.6em] drop-shadow-sm">
        {item.emoji}
      </span>
    </div>
  );
}

export function CharCircle({ char, className }: { char: string; className?: string }) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-full border-2 border-foreground bg-card font-display leading-none",
        className,
      )}
    >
      {char}
    </div>
  );
}
