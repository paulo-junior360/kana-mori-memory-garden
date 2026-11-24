import type { ScriptId } from "@/data/kana";
import { cn } from "@/lib/utils";

const styles: Record<ScriptId, string> = {
  hiragana: "bg-primary-soft text-accent-foreground",
  katakana: "bg-info/50 text-info-foreground",
  kanji: "bg-lavender-soft text-lavender-foreground",
};
const names: Record<ScriptId, string> = { hiragana: "Hiragana", katakana: "Katakana", kanji: "Kanji" };

export function ScriptTag({ script, className }: { script: ScriptId; className?: string }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 font-display text-[10px] tracking-wide", styles[script], className)}>
      {names[script]}
    </span>
  );
}
