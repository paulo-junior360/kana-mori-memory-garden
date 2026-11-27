import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { BackLink } from "@/components/kana/back-button";
import { CharDetailSheet } from "@/components/kana/char-detail";
import { CharCircle, MnemonicArt } from "@/components/kana/mnemonic-art";
import { Check, ChevronLeft, ChevronRight, Lock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isScriptId, scripts, type CharItem } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import { scriptsForLevel } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estudar/$sistema")({
  validateSearch: (search: Record<string, unknown>): { pagina: number } => {
    const n = Number(search["pagina"]);
    return { pagina: Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1 };
  },
  loader: ({ params }) => {
    if (!isScriptId(params.sistema)) throw notFound();
    return { name: scripts[params.sistema].name };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Caracteres";
    return {
      meta: [
        { title: `${name} com mnemônicos — KanaMori` },
        { name: "description", content: `Estude ${name} com imagens e frases em português que ajudam a memorizar.` },
        { property: "og:title", content: `${name} com mnemônicos — KanaMori` },
        {
          property: "og:description",
          content: `Estude ${name} com imagens e frases em português que ajudam a memorizar.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Study,
});

function Study() {
  const { sistema } = Route.useParams();
  const { pagina } = Route.useSearch();
  const [open, setOpen] = useState<CharItem | null>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const { state } = useAppStore();
  const validScript = isScriptId(sistema);
  const totalPages = validScript ? scripts[sistema].units.length : 1;
  const page = Math.min(pagina, totalPages);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const container = pagerRef.current;
      const active = container?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!container || !active) return;
      const target = active.offsetLeft + active.offsetWidth / 2 - container.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [page, sistema]);

  if (!validScript) return null;
  if (!scriptsForLevel(state.profileLevel).includes(sistema)) {
    return (
      <div className="flex flex-1 flex-col px-6 pt-6 pb-8">
        <BackLink to="/aprender" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="grid size-20 place-items-center rounded-full bg-lavender-soft text-lavender-foreground">
            <Lock className="size-8" />
          </div>
          <h1 className="mt-5 font-display text-2xl tracking-display">Kanji bloqueado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O kanji faz parte do perfil intermediário/avançado. Mude seu nível de conhecimento em Editar perfil.
          </p>
          <Button asChild variant="hero" size="xl" className="mt-8">
            <Link to="/perfil">Ir para o perfil</Link>
          </Button>
        </div>
      </div>
    );
  }
  const data = scripts[sistema];
  const unit = data.units[page - 1]!;
  const isKanji = sistema === "kanji";
  const savedInUnit = unit.items.filter((it) => state.myReview.includes(it.id)).length;

  return (
    <div className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
        <BackLink to="/aprender" />
        <h1 className="text-center font-display text-2xl tracking-display">KanaMori</h1>
      </div>
      <div className="mt-4 text-center">
        <p className="font-display text-xl tracking-display">{data.name}</p>
        <p className="text-sm text-muted-foreground">{unit.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {savedInUnit > 0
            ? `${savedInUnit} de ${unit.items.length} na sua revisão · toque em um item para gerenciar`
            : "Toque em um caractere para ver detalhes e adicionar à revisão"}
        </p>
      </div>

      <ul key={unit.id} className="mt-5 flex-1 space-y-2.5">
        {unit.items.map((it, i) => {
          const inReview = state.myReview.includes(it.id);
          return (
            <li key={it.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <button
                onClick={() => setOpen(it)}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.99]",
                  inReview
                    ? "border-primary/45 bg-primary-soft/60 shadow-card"
                    : "border-border bg-card shadow-card hover:border-primary/30",
                )}
              >
                <div className="min-w-0">
                  <p className="font-display text-2xl leading-tight tracking-wide">{isKanji ? it.meaning : it.romaji}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {isKanji ? `${it.reading} · ${it.romaji}` : it.mnemonic}
                  </p>
                  <div className="mt-2">
                    {inReview ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 font-display text-[11px] font-medium tracking-wide text-primary-foreground">
                        <Check className="size-3" strokeWidth={3} /> Na sua revisão
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/45 bg-muted/70 px-2.5 py-0.5 font-display text-[11px] tracking-wide text-muted-foreground">
                        <Plus className="size-3" /> Adicionar à revisão
                      </span>
                    )}
                  </div>
                </div>
                <MnemonicArt item={it} className="size-16 text-2xl" />
                <div className="relative">
                  <CharCircle
                    char={it.char}
                    className={cn("size-16 text-3xl", inReview && "border-primary ring-2 ring-primary/25")}
                  />
                  {inReview ? (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <nav aria-label="Páginas" className="mt-5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          {page > 1 ? (
            <Link
              to="/estudar/$sistema"
              params={{ sistema }}
              search={{ pagina: page - 1 }}
              replace
              resetScroll={false}
              aria-label="Página anterior"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition-transform active:scale-95"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-muted/60 text-muted-foreground/40"
            >
              <ChevronLeft className="size-4" />
            </span>
          )}

          <div
            ref={pagerRef}
            onWheel={(e) => {
              if (!pagerRef.current || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
              e.preventDefault();
              pagerRef.current.scrollLeft += e.deltaY;
            }}
            className="no-scrollbar relative flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1.5"
          >
            <span aria-hidden className="w-[calc(50%-1.75rem)] shrink-0" />
            {data.units.map((u, i) => {
              const active = i + 1 === page;
              return (
                <Link
                  key={u.id}
                  to="/estudar/$sistema"
                  params={{ sistema }}
                  search={{ pagina: i + 1 }}
                  replace
                  resetScroll={false}
                  aria-label={`${u.title} (página ${i + 1})`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full font-display text-sm transition-colors",
                    active ? "bg-primary text-primary-foreground shadow-button" : "bg-muted text-muted-foreground hover:bg-border",
                  )}
                >
                  {i + 1}
                </Link>
              );
            })}
            <span aria-hidden className="w-[calc(50%-1.75rem)] shrink-0" />
          </div>

          {page < data.units.length ? (
            <Link
              to="/estudar/$sistema"
              params={{ sistema }}
              search={{ pagina: page + 1 }}
              replace
              resetScroll={false}
              aria-label="Próxima página"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition-transform active:scale-95"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-muted/60 text-muted-foreground/40"
            >
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
        <p className="text-center text-[11px] text-muted-foreground tabular-nums">
          Página {page} de {data.units.length} · {unit.title}
        </p>
      </nav>

      <CharDetailSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
