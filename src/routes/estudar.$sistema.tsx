import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { BackLink } from "@/components/kana/back-button";
import { CharDetailSheet } from "@/components/kana/char-detail";
import { CharCircle, MnemonicArt } from "@/components/kana/mnemonic-art";
import { isScriptId, scripts, type CharItem } from "@/data/kana";
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
  if (!isScriptId(sistema)) return null;
  const data = scripts[sistema];
  const page = Math.min(pagina, data.units.length);
  const unit = data.units[page - 1]!;
  const isKanji = sistema === "kanji";

  return (
    <div className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
        <BackLink to="/aprender" />
        <h1 className="text-center font-display text-2xl tracking-display">KanaMori</h1>
      </div>
      <div className="mt-4 text-center">
        <p className="font-display text-xl tracking-display">{data.name}</p>
        <p className="text-sm text-muted-foreground">{unit.title}</p>
      </div>

      <ul key={unit.id} className="mt-6 flex-1 divide-y divide-border">
        {unit.items.map((it, i) => (
          <li key={it.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
            <button
              onClick={() => setOpen(it)}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-4 text-left"
            >
              <div className="min-w-0">
                <p className="font-display text-2xl tracking-wide">{isKanji ? it.meaning : it.romaji}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {isKanji ? `${it.reading} · ${it.romaji}` : it.mnemonic}
                </p>
              </div>
              <MnemonicArt item={it} className="size-16 text-2xl" />
              <CharCircle char={it.char} className="size-16 text-3xl" />
            </button>
          </li>
        ))}
      </ul>

      <nav aria-label="Páginas" className="no-scrollbar mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {data.units.map((u, i) => (
          <Link
            key={u.id}
            to="/estudar/$sistema"
            params={{ sistema }}
            search={{ pagina: i + 1 }}
            replace
            aria-label={u.title}
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full font-display text-sm transition-colors",
              i + 1 === page ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </Link>
        ))}
      </nav>

      <CharDetailSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
