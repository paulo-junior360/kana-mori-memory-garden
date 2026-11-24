import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ChevronRight, Clock, Info } from "lucide-react";

import { CharDetailSheet } from "@/components/kana/char-detail";
import { DifficultyTag } from "@/components/kana/difficulty";
import { ScriptTag } from "@/components/kana/script-tag";
import { Button } from "@/components/ui/button";
import { getItem, reviewQueue, scripts, type CharItem } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import { PROFILE_LABEL, scriptsForLevel } from "@/lib/progress";
import { intervalLabel } from "@/lib/srs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/revisao")({
  head: () => ({
    meta: [
      { title: "Revisão do dia — KanaMori" },
      {
        name: "description",
        content: "Revisão espaçada de hiragana, katakana e kanji escolhida automaticamente pelas suas dificuldades.",
      },
      { property: "og:title", content: "Revisão do dia — KanaMori" },
      {
        property: "og:description",
        content: "Revisão espaçada de hiragana, katakana e kanji escolhida automaticamente pelas suas dificuldades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Review,
});

function Review() {
  const { state } = useAppStore();
  const [open, setOpen] = useState<CharItem | null>(null);
  const done = state.reviewDone;
  const allowed = scriptsForLevel(state.profileLevel);
  const queue = reviewQueue(allowed);
  const advanced = state.profileLevel === "avancado";
  const minutes = Math.max(3, Math.round(queue.length * 0.7));

  return (
    <div className="px-5 pt-8 pb-8">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl tracking-display">Revisão do dia</h1>
        <span
          className={cn(
            "rounded-full px-3 py-1 font-display text-xs tracking-wide",
            advanced ? "bg-lavender-soft text-lavender-foreground" : "bg-primary-soft text-accent-foreground",
          )}
        >
          {PROFILE_LABEL[state.profileLevel]}
        </span>
      </div>
      <p className="mt-1 text-center font-display text-sm tracking-wide text-muted-foreground">
        {allowed.map((s) => scripts[s].name).join(" · ")}
      </p>

      {done ? (
        <div className="mt-6 flex animate-rise items-center gap-4 rounded-2xl bg-primary-soft p-4 text-accent-foreground">
          <CalendarCheck className="size-8 shrink-0" />
          <div>
            <p className="font-display text-base tracking-wide">Tudo revisado por hoje!</p>
            <p className="text-sm opacity-85">Veja abaixo quando cada item volta para você.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="font-display text-base tracking-wide">
              {queue.length} itens · Aproximadamente {minutes} min
            </p>
            <p className="text-sm text-muted-foreground">Baseado nas suas dificuldades da semana passada</p>
          </div>
        </div>
      )}

      {allowed.map((script) => {
        const entries = queue.filter((e) => getItem(e.id).script === script);
        if (!entries.length) return null;
        return (
          <section key={script} className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-sm tracking-wide">{scripts[script].name}</p>
              <span className="text-xs text-muted-foreground">{entries.length} itens</span>
            </div>
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
              {entries.map(({ id, difficulty }) => {
                const k = getItem(id);
                const isKanji = k.script === "kanji";
                return (
                  <li key={id}>
                    <button
                      onClick={() => setOpen(k)}
                      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3 text-left"
                    >
                      <span className="grid size-12 place-items-center rounded-xl bg-muted font-display text-2xl">
                        {k.char}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{isKanji ? k.reading : k.romaji}</p>
                        <p className="truncate font-display text-sm tracking-wide">{isKanji ? k.meaning : k.mnemonic}</p>
                      </div>
                      {done ? (
                        <span className="rounded-full bg-primary-soft px-3 py-1 font-display text-xs text-accent-foreground">
                          em {intervalLabel(state.srs[id] ?? 0)}
                        </span>
                      ) : (
                        <DifficultyTag level={difficulty} />
                      )}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary-soft px-4 py-3 text-accent-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">
          Sem configurar flashcards manualmente. O app escolhe o que revisar por você.
          {!advanced ? " Kanji entra na revisão quando você mudar para o perfil intermediário/avançado." : ""}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {allowed.map((s) => (
          <ScriptTag key={s} script={s} />
        ))}
      </div>

      <Button asChild variant="hero" size="xl" className="mt-6">
        <Link to="/revisar">{done ? "Revisar novamente" : "Começar revisão"}</Link>
      </Button>
      {!advanced ? (
        <Link to="/perfil" className="mt-3 block text-center text-sm text-primary">
          Já sabe kana? Mude seu nível no perfil
        </Link>
      ) : null}

      <CharDetailSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
