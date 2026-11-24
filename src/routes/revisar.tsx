import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, Volume2 } from "lucide-react";

import { BackLink } from "@/components/kana/back-button";
import { ProgressBar } from "@/components/kana/brand";
import { MnemonicArt } from "@/components/kana/mnemonic-art";
import { ScriptTag } from "@/components/kana/script-tag";
import { Button } from "@/components/ui/button";
import { getItem, reviewQueue } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import { REVIEW_XP, scriptsForLevel } from "@/lib/progress";
import { intervalLabel, nextBox, type Rating } from "@/lib/srs";
import { speakJapanese } from "@/lib/speak";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/revisar")({
  head: () => ({
    meta: [
      { title: "Sessão de revisão — KanaMori" },
      { name: "description", content: "Revise caracteres com cartões e avalie sua lembrança para agendar a próxima revisão." },
      { property: "og:title", content: "Sessão de revisão — KanaMori" },
      {
        property: "og:description",
        content: "Revise caracteres com cartões e avalie sua lembrança para agendar a próxima revisão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReviewSession,
});

const RATINGS: { id: Rating; label: string; cls: string }[] = [
  { id: "errei", label: "Errei", cls: "bg-destructive-soft text-destructive" },
  { id: "dificil", label: "Difícil", cls: "bg-warning-soft text-warning" },
  { id: "bom", label: "Bom", cls: "bg-info text-info-foreground" },
  { id: "facil", label: "Fácil", cls: "bg-primary-soft text-accent-foreground" },
];

function ReviewSession() {
  const { state, actions } = useAppStore();
  const navigate = useNavigate();
  const queue = useMemo(() => reviewQueue(scriptsForLevel(state.profileLevel)), [state.profileLevel]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const total = queue.length;
  const finished = index >= total;

  if (finished) {
    const counts = RATINGS.map((r) => ({ ...r, n: Object.values(ratings).filter((x) => x === r.id).length }));
    return (
      <div className="flex flex-1 animate-rise flex-col px-6 pt-12 pb-8">
        <div className="text-center text-6xl">🧠</div>
        <h1 className="mt-4 text-center font-display text-3xl tracking-display">Revisão concluída!</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          +{REVIEW_XP} XP · cada item volta no momento certo
        </p>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {counts.map((c) => (
            <div key={c.id} className={cn("rounded-2xl p-3 text-center", c.cls)}>
              <p className="font-display text-2xl">{c.n}</p>
              <p className="text-[11px]">{c.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 mb-2 font-display text-sm tracking-wide">Próximas revisões</p>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
          {queue.map(({ id }) => {
            const k = getItem(id);
            const box = nextBox(state.srs[id] ?? 0, ratings[id] ?? "bom");
            return (
              <li key={id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-8 font-display text-2xl">{k.char}</span>
                <span className="flex-1 truncate text-sm text-muted-foreground">
                  {k.script === "kanji" ? k.meaning : k.romaji}
                </span>
                <span className="font-display text-sm text-primary">em {intervalLabel(box)}</span>
              </li>
            );
          })}
        </ul>
        <Button
          variant="hero"
          size="xl"
          className="mt-6"
          onClick={() => {
            actions.completeReview(ratings);
            navigate({ to: "/revisao" });
          }}
        >
          Concluir
        </Button>
      </div>
    );
  }

  const entry = queue[index]!;
  const k = getItem(entry.id);
  const isKanji = k.script === "kanji";
  const box = state.srs[entry.id] ?? 0;

  function rate(r: Rating) {
    setRatings((prev) => ({ ...prev, [entry.id]: r }));
    setShown(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center gap-4">
        <BackLink to="/revisao" />
        <ProgressBar value={(index / total) * 100} className="flex-1" />
        <span className="font-display text-sm text-muted-foreground tabular-nums">
          {index + 1}/{total}
        </span>
      </div>

      <div
        key={entry.id}
        className="mt-8 flex flex-1 animate-rise flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-card"
      >
        <div className="flex items-center gap-2">
          <ScriptTag script={k.script} />
          <span className="font-display text-xs tracking-display text-muted-foreground">
            {shown ? "RESPOSTA" : "VOCÊ LEMBRA?"}
          </span>
        </div>
        <div className="mt-6 font-display text-[120px] leading-none">{k.char}</div>
        {shown ? (
          <div className="mt-6 w-full animate-rise space-y-3">
            <p className="font-display text-2xl tracking-display">{isKanji ? k.meaning : k.romaji}</p>
            <button
              onClick={() => speakJapanese(k.reading ?? k.char)}
              className="mx-auto flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm text-accent-foreground"
            >
              <Volume2 className="size-4" /> {isKanji ? `${k.reading} · ${k.romaji}` : "Ouvir"}
            </button>
            <div className="flex items-center gap-3 rounded-2xl bg-muted p-3 text-left text-sm text-muted-foreground">
              <MnemonicArt item={k} className="size-10 shrink-0 text-sm" />
              <span>{k.mnemonic}</span>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            {isKanji ? "Pense no significado e na leitura antes de virar." : "Pense em como se lê antes de virar."}
          </p>
        )}
      </div>

      {shown ? (
        <div className="mt-5 grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => rate(r.id)}
              className={cn("rounded-2xl px-1 py-3 text-center transition-transform active:scale-95", r.cls)}
            >
              <p className="font-display text-sm font-semibold">{r.label}</p>
              <p className="mt-0.5 text-[11px] opacity-80">{intervalLabel(nextBox(box, r.id))}</p>
            </button>
          ))}
        </div>
      ) : (
        <Button variant="hero" size="xl" className="mt-5" onClick={() => setShown(true)}>
          <Eye /> Mostrar resposta
        </Button>
      )}
    </div>
  );
}
