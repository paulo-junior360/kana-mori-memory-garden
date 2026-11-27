import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Sparkles } from "lucide-react";

import { Wordmark } from "@/components/kana/brand";
import { RewardsRow, StreakCard } from "@/components/kana/streak";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import { LESSON_XP, xpBalance } from "@/lib/progress";

export const Route = createFileRoute("/_tabs/inicio")({
  head: () => ({
    meta: [
      { title: "Início — KanaMori" },
      { name: "description", content: "Veja sua ofensiva de estudos e a revisão rápida do dia no KanaMori." },
      { property: "og:title", content: "Início — KanaMori" },
      { property: "og:description", content: "Veja sua ofensiva de estudos e a revisão rápida do dia no KanaMori." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function useTimeLeftToday() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const mins = Math.max(1, Math.floor((midnight.getTime() - now.getTime()) / 60000));
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const hPart = h > 0 ? `${h} ${h === 1 ? "hora" : "horas"}` : "";
      const mPart = `${m} ${m === 1 ? "minuto" : "minutos"}`;
      setLabel(hPart ? `${hPart} e ${mPart}` : mPart);
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return label;
}

function Home() {
  const { state } = useAppStore();
  const timeLeft = useTimeLeftToday();
  const firstName = state.userName.split(" ")[0];
  const advanced = state.profileLevel === "avancado";

  return (
    <div className="px-5 pt-8 pb-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <Link to="/loja" search={{ aba: "bloqueio", de: "inicio" }} className="justify-self-start rounded-full bg-sky-50 px-2.5 py-1 font-display text-xs tabular-nums" aria-label="Bloqueios de ofensiva">
          🧊 {state.streakFreezes}
        </Link>
        <Wordmark className="text-center" />
        <Link to="/loja" search={{ de: "inicio" }} className="justify-self-end rounded-full bg-flame-soft px-2.5 py-1 font-display text-xs tabular-nums" aria-label="Loja">
          ⭐ {xpBalance(state)}
        </Link>
      </div>

      {state.savedToday ? (
        <div className="mt-6 animate-rise space-y-5">
          <div className="text-center">
            <h2 className="font-display text-2xl tracking-display">Ofensiva salva!</h2>
            <p className="mt-1 font-display text-sm tracking-wide text-muted-foreground">
              Você estudou hoje e manteve sua sequência.
            </p>
          </div>
          <StreakCard streak={state.streak} weekDone={state.weekDone} saved />
          <div className="flex items-center gap-3 rounded-2xl bg-primary-soft px-4 py-3 text-accent-foreground">
            <span className="text-2xl">🎉</span>
            <p className="font-display text-sm tracking-wide">Parabéns! Sua sequência foi mantida.</p>
          </div>
          <div>
            <p className="mb-3 font-display text-sm tracking-wide">Recompensas desbloqueadas:</p>
            <RewardsRow streakDay={state.streak} xp={state.lastLesson?.xpEarned ?? LESSON_XP} />
          </div>
          <div>
            <p className="mb-3 font-display text-sm tracking-wide">Próximo passo:</p>
            <Link
              to="/revisao"
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.99]"
            >
              <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted font-display text-3xl">
                {advanced ? "学" : "ア"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base tracking-wide">Próxima revisão</p>
                <p className="text-sm text-muted-foreground">
                  {advanced ? "Hiragana, katakana e kanji" : "Hiragana e katakana"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> 6 min
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          </div>
          <Button asChild variant="hero" size="xl">
            <Link to="/revisao">Ir para a próxima revisão</Link>
          </Button>
          <Link to="/aprender" className="block text-center text-sm text-primary">
            Ou continue sua trilha de aprendizado
          </Link>
        </div>
      ) : (
        <div className="mt-6 animate-rise space-y-5">
          <div className="text-center">
            <p className="font-display text-sm tracking-wide text-muted-foreground">Olá, {firstName}!</p>
            <h2 className="mt-1 font-display text-2xl tracking-display">Sua ofensiva está em perigo!</h2>
          </div>
          <StreakCard streak={state.streak} weekDone={state.weekDone} saved={false} />
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-destructive-soft px-4 py-3 text-destructive">
            <Clock className="size-4 shrink-0" />
            <p className="font-display text-sm tracking-wide">
              Restam <strong>{timeLeft ?? "algumas horas"}</strong>!
            </p>
          </div>
          <div>
            <p className="mb-3 font-display text-sm tracking-wide">Revisão rápida de hoje</p>
            <Link
              to="/licao"
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.99]"
            >
              <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted font-display text-3xl">あ</div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base tracking-wide">Lição de Revisão</p>
                <p className="truncate text-sm text-muted-foreground">Hiragana: a, i, u, e, o (20 exercícios)</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> 2 min
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          </div>
          <div>
            <p className="mb-3 font-display text-sm tracking-wide">Se você completar agora, ganha:</p>
            <RewardsRow streakDay={state.streak + 1} xp={LESSON_XP} />
          </div>
          <Button asChild variant="hero" size="xl">
            <Link to="/licao">
              <Sparkles /> Salvar minha ofensiva!
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
