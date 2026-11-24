import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock, Star } from "lucide-react";
import { toast } from "sonner";

import { ProgressBar } from "@/components/kana/brand";
import { Sheet } from "@/components/kana/sheet";
import { Button } from "@/components/ui/button";
import { scripts, type ScriptId, type Unit } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import { scriptsForLevel } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/aprender")({
  head: () => ({
    meta: [
      { title: "Trilha de aprendizado — KanaMori" },
      { name: "description", content: "Siga a trilha de hiragana, katakana e kanji em níveis progressivos." },
      { property: "og:title", content: "Trilha de aprendizado — KanaMori" },
      { property: "og:description", content: "Siga a trilha de hiragana, katakana e kanji em níveis progressivos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Learn,
});

type Status = "done" | "current" | "locked";

/** Demo progress: how many units are finished in each script. */
const DONE_UNITS: Record<ScriptId, number> = { hiragana: 2, katakana: 0, kanji: 3 };
const OFFSETS = [0, 44, 64, 44, 0, -44, -64, -44];
const LEVEL: Record<ScriptId, string> = { hiragana: "Iniciante", katakana: "Iniciante", kanji: "Intermediário" };

function statusOf(script: ScriptId, i: number): Status {
  const done = DONE_UNITS[script];
  if (i < done) return "done";
  if (i === done) return "current";
  return "locked";
}

function Learn() {
  const { state } = useAppStore();
  const allowed = scriptsForLevel(state.profileLevel);
  const [script, setScript] = useState<ScriptId>("hiragana");
  useEffect(() => {
    if (!allowed.includes(script)) setScript("hiragana");
  }, [allowed, script]);
  const [open, setOpen] = useState<{ unit: Unit; index: number; status: Status } | null>(null);
  const data = scripts[script];
  const total = data.units.reduce((n, u) => n + u.items.length, 0);
  const learned = data.units.slice(0, DONE_UNITS[script]).reduce((n, u) => n + u.items.length, 0);

  return (
    <div className="px-5 pt-8 pb-8">
      <h1 className="text-center font-display text-3xl tracking-display">Aprender</h1>
      <p className="mt-1 text-center font-display text-sm tracking-wide text-muted-foreground">
        Escolha um sistema de escrita
      </p>

      <div
        className={cn(
          "mt-6 grid gap-1 rounded-2xl bg-muted p-1",
          allowed.length === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {allowed.map((id) => (
          <button
            key={id}
            onClick={() => setScript(id)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-display text-sm tracking-wide transition-all",
              script === id ? "bg-card text-primary shadow-card" : "text-muted-foreground",
            )}
          >
            <span className="text-base">{scripts[id].glyph}</span> {scripts[id].name}
          </button>
        ))}
      </div>

      {allowed.length === 2 ? (
        <Link
          to="/perfil"
          className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"
        >
          <span className="font-display text-lg text-lavender-foreground">字</span>
          <span className="flex-1">Kanji fica disponível no perfil intermediário/avançado.</span>
          <span className="text-primary">Mudar nível</span>
        </Link>
      ) : null}

      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-primary p-4 text-primary-foreground shadow-button">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 font-display text-4xl">
          {data.glyph}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg tracking-display">{data.name}</p>
          <p className="text-xs opacity-85">
            Nível {LEVEL[script]} · {learned} de {total} {script === "kanji" ? "kanjis" : "caracteres"}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-foreground/25">
            <div className="h-full rounded-full bg-primary-foreground" style={{ width: `${(learned / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="relative mt-8 flex flex-col items-center gap-6">
        {data.units.map((unit, i) => {
          const status = statusOf(script, i);
          const off = OFFSETS[i % OFFSETS.length]!;
          return (
            <div key={unit.id} className="flex flex-col items-center" style={{ transform: `translateX(${off}px)` }}>
              {status === "current" ? (
                <span className="mb-2 animate-pop rounded-lg bg-card px-3 py-1 font-display text-xs tracking-display text-primary shadow-card ring-1 ring-border">
                  COMEÇAR
                </span>
              ) : null}
              <button
                onClick={() => setOpen({ unit, index: i, status })}
                aria-label={`${unit.title} — ${status === "done" ? "concluída" : status === "current" ? "atual" : "bloqueada"}`}
                className={cn(
                  "relative grid size-18 place-items-center rounded-full font-display text-3xl transition-transform active:scale-95",
                  status === "done" && "bg-primary text-primary-foreground shadow-button",
                  status === "current" && "animate-glow bg-primary text-primary-foreground ring-4 ring-primary-soft",
                  status === "locked" && "bg-option text-muted-foreground",
                )}
              >
                {status === "locked" ? <Lock className="size-6" /> : unit.items[0]!.char}
                {status === "done" ? (
                  <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-star text-foreground ring-2 ring-background">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
              <span
                className={cn(
                  "mt-2 font-display text-xs tracking-wide",
                  status === "locked" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {unit.title}
              </span>
            </div>
          );
        })}
        <div className="mt-2 flex flex-col items-center gap-1 text-muted-foreground">
          <Star className="size-8" />
          <span className="font-display text-xs tracking-wide">Mestre do {data.name}</span>
        </div>
      </div>

      <Sheet open={open !== null} onClose={() => setOpen(null)} title={open ? `${data.name} · ${open.unit.title}` : undefined}>
        {open ? (
          <>
            <div className="flex flex-wrap gap-2">
              {open.unit.items.map((it) => (
                <span
                  key={it.id}
                  className="grid h-14 min-w-14 place-items-center rounded-xl bg-muted px-2 font-display text-2xl"
                >
                  {it.char}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {open.status === "done"
                ? "Unidade concluída! Pratique de novo para fortalecer a memória."
                : open.status === "current"
                  ? "Sua próxima unidade. Conheça as imagens e depois pratique."
                  : "Conclua a unidade anterior para desbloquear a prática. Você já pode espiar os caracteres."}
            </p>
            {open.status !== "locked" ? <ProgressBar value={open.status === "done" ? 100 : 20} className="mt-4" /> : null}
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant={open.status === "locked" ? "hero" : "soft"} size="xl">
                <Link to="/estudar/$sistema" params={{ sistema: script }} search={{ pagina: open.index + 1 }}>
                  Estudar caracteres
                </Link>
              </Button>
              {open.status !== "locked" ? (
                <Button asChild variant="hero" size="xl">
                  <Link to="/licao">{open.status === "done" ? "Praticar de novo" : "Começar lição"}</Link>
                </Button>
              ) : (
                <Button
                  variant="soft"
                  size="xl"
                  className="text-muted-foreground"
                  onClick={() => toast("Complete a unidade anterior primeiro 🔒")}
                >
                  <Lock /> Lição bloqueada
                </Button>
              )}
            </div>
          </>
        ) : null}
      </Sheet>
    </div>
  );
}
