import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ChevronRight, Clock, Info } from "lucide-react";

import { CharDetailSheet } from "@/components/kana/char-detail";
import { DifficultyTag } from "@/components/kana/difficulty";
import { Button } from "@/components/ui/button";
import { getItem, todaysKanjiReview, type CharItem } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import { intervalLabel } from "@/lib/srs";

export const Route = createFileRoute("/_tabs/revisao")({
  head: () => ({
    meta: [
      { title: "Revisão de Kanji — KanaMori" },
      { name: "description", content: "Revisão espaçada de kanji escolhida automaticamente pelas suas dificuldades." },
      { property: "og:title", content: "Revisão de Kanji — KanaMori" },
      {
        property: "og:description",
        content: "Revisão espaçada de kanji escolhida automaticamente pelas suas dificuldades.",
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
  const done = state.kanjiReviewDone;

  return (
    <div className="px-5 pt-8 pb-8">
      <div className="flex items-center justify-center gap-3">
        <h1 className="font-display text-2xl tracking-display">Revisão de Kanji</h1>
        <span className="rounded-full bg-lavender-soft px-3 py-1 font-display text-xs tracking-wide text-lavender-foreground">
          Avançado
        </span>
      </div>
      <p className="mt-1 text-center font-display text-sm tracking-wide text-muted-foreground">
        Selecionados automaticamente para hoje
      </p>

      {done ? (
        <div className="mt-6 flex animate-rise items-center gap-4 rounded-2xl bg-primary-soft p-4 text-accent-foreground">
          <CalendarCheck className="size-8 shrink-0" />
          <div>
            <p className="font-display text-base tracking-wide">Tudo revisado por hoje!</p>
            <p className="text-sm opacity-85">Veja abaixo quando cada kanji volta para você.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="font-display text-base tracking-wide">
              {todaysKanjiReview.length} kanjis · Aproximadamente 5 min
            </p>
            <p className="text-sm text-muted-foreground">Baseado nas suas dificuldades da semana passada</p>
          </div>
        </div>
      )}

      <p className="mt-6 mb-2 font-display text-sm tracking-wide">{done ? "Próximas revisões" : "Para revisar"}</p>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {todaysKanjiReview.map(({ id, difficulty }) => {
          const k = getItem(id);
          return (
            <li key={id}>
              <button
                onClick={() => setOpen(k)}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3 text-left"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-muted font-display text-2xl">{k.char}</span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{k.reading}</p>
                  <p className="truncate font-display text-sm tracking-wide">{k.meaning}</p>
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

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary-soft px-4 py-3 text-accent-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">Sem configurar flashcards manualmente. O app escolhe o que revisar por você.</p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
        <div>
          <p className="font-display text-sm tracking-wide">Kana na revisão</p>
          <p className="text-xs text-muted-foreground">{state.reviewItems} itens aguardando</p>
        </div>
        <Link to="/licao" className="font-display text-sm text-primary">
          Revisar kana
        </Link>
      </div>

      <Button asChild variant="hero" size="xl" className="mt-6">
        <Link to="/revisar">{done ? "Revisar novamente" : "Começar revisão"}</Link>
      </Button>

      <CharDetailSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
