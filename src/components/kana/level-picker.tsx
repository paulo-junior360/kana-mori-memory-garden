import { Check } from "lucide-react";

import type { ProfileLevel } from "@/lib/progress";
import { cn } from "@/lib/utils";

const OPTIONS: { id: ProfileLevel; title: string; desc: string; glyphs: string }[] = [
  { id: "iniciante", title: "Iniciante", desc: "Estou começando: quero aprender hiragana e katakana.", glyphs: "あア" },
  {
    id: "avancado",
    title: "Intermediário/Avançado",
    desc: "Já conheço os kana e quero estudar e revisar kanji.",
    glyphs: "あア字",
  },
];

export function LevelPicker({
  value,
  onChange,
  error,
}: {
  value: ProfileLevel | null;
  onChange: (level: ProfileLevel) => void;
  error?: string | undefined;
}) {
  return (
    <fieldset>
      <legend className="font-display text-sm tracking-wide text-foreground">Nível de conhecimento</legend>
      <div role="radiogroup" className="mt-1.5 grid gap-2">
        {OPTIONS.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all",
                active ? "border-primary bg-primary-soft ring-3 ring-primary/15" : "border-input",
                error && !value && "border-destructive",
              )}
            >
              <span className="grid h-11 min-w-11 shrink-0 place-items-center rounded-lg bg-muted px-1.5 font-display text-lg">
                {o.glyphs}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-semibold tracking-wide">{o.title}</span>
                <span className="block text-xs text-muted-foreground">{o.desc}</span>
              </span>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border-2",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {active ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
      {error && !value ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </fieldset>
  );
}
