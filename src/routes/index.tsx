import { createFileRoute, Link } from "@tanstack/react-router";

import hero from "@/assets/gato.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KanaMori — Aprenda japonês com memórias que ficam" },
      {
        name: "description",
        content: "Comece a aprender hiragana, katakana e kanji com imagens que grudam na memória.",
      },
      { property: "og:title", content: "KanaMori — Aprenda japonês com memórias que ficam" },
      {
        property: "og:description",
        content: "Comece a aprender hiragana, katakana e kanji com imagens que grudam na memória.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="flex min-h-full flex-1 flex-col px-6 pt-10 pb-8">
      <div className="animate-rise text-center">
        <p className="inline-block rounded-full bg-primary-soft px-4 py-1 font-display text-lg font-semibold tracking-[0.28em] text-primary">
          かなもり
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-display">KanaMori</h1>
        <p className="mx-auto mt-2.5 max-w-[16rem] font-display text-base leading-snug tracking-wide text-muted-foreground">
          Aprenda japonês com memórias que ficam
        </p>
      </div>

      <div className="relative -mx-6 my-5 flex flex-1 items-center justify-center">
        <img
          src={hero}
          alt="Gato malhado sentado sobre uma placa verde de rua japonesa escrita Miyuki Dōri"
          className="max-h-[430px] w-full object-contain"
        />
        <span
          aria-hidden
          className="absolute top-3 left-4 rounded-2xl border border-primary/30 bg-card/90 px-2.5 py-3.5 font-display text-3xl font-semibold tracking-[0.18em] text-primary shadow-card backdrop-blur-sm [writing-mode:vertical-rl]"
        >
          かなもり
        </span>
      </div>

      <div className="flex animate-rise flex-col gap-3 [animation-delay:150ms]">
        <Button asChild variant="hero" size="xl">
          <Link to="/cadastro">Começar agora!</Link>
        </Button>
        <Button asChild variant="soft" size="xl">
          <Link to="/entrar">Já tenho uma conta</Link>
        </Button>
      </div>
    </div>
  );
}
