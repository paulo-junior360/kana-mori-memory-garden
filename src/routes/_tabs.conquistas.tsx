import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";

import { ProgressBar } from "@/components/kana/brand";
import { useAppStore } from "@/lib/app-store";
import { levelFromXp, XP_PER_LEVEL } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/conquistas")({
  head: () => ({
    meta: [
      { title: "Conquistas — KanaMori" },
      { name: "description", content: "Suas medalhas, sequência de estudos e estatísticas de aprendizado." },
      { property: "og:title", content: "Conquistas — KanaMori" },
      { property: "og:description", content: "Suas medalhas, sequência de estudos e estatísticas de aprendizado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Achievements,
});

const WEEK = ["S", "T", "Q", "Q", "S", "S", "D"];
const WEEK_XP = [60, 120, 40, 90, 0, 0, 0];

function Achievements() {
  const { state } = useAppStore();
  const [tab, setTab] = useState<"medals" | "stats">("medals");
  const level = levelFromXp(state.xp);

  const medals = [
    { title: "Primeiro passo", desc: "Conclua sua primeira lição", progress: 1, goal: 1, medal: "bg-medal-bronze", icon: "🌱" },
    { title: "Estudante consistente", desc: "Estude por 7 dias seguidos", progress: Math.min(7, state.streak), goal: 7, medal: "bg-medal-silver", icon: "📅" },
    { title: "Combo perfeito", desc: "Acerte 5 seguidas em uma lição", progress: state.comboMedal ? 1 : 0, goal: 1, medal: "bg-medal-gold", icon: "✨" },
    { title: "Ofensiva de fogo", desc: "Mantenha 30 dias seguidos", progress: Math.min(30, state.streak), goal: 30, medal: "bg-medal-gold", icon: "🔥" },
    { title: "Mestre do Hiragana", desc: "Complete todos os módulos de Hiragana", progress: 2, goal: 10, medal: "bg-medal-gold", icon: "あ" },
    { title: "Explorador do Katakana", desc: "Complete o primeiro módulo de Katakana", progress: 0, goal: 1, medal: "bg-medal-silver", icon: "ア" },
    { title: "Caçador de Kanji", desc: "Revise 50 kanjis", progress: state.kanjiReviewDone ? 18 : 12, goal: 50, medal: "bg-medal-gold", icon: "字" },
  ];

  const weekXp = WEEK_XP.map((v, i) => (i === 4 && state.savedToday ? (state.lastLesson?.xpEarned ?? 50) : v));
  const maxXp = Math.max(...weekXp, 1);

  return (
    <div className="px-5 pt-8 pb-8">
      <h1 className="text-center font-display text-3xl tracking-display">Suas Conquistas</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: "📅", value: state.streak, label: "Dias seguidos" },
          { icon: "📚", value: state.lessonsCompleted, label: "Lições concluídas" },
          { icon: "🎓", value: level, label: "Nível atual" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-card">
            <div className="text-2xl">{s.icon}</div>
            <p className="mt-1 font-display text-2xl">{s.value}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 border-b border-border">
        {(["medals", "stats"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 font-display text-base tracking-wide transition-colors",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground",
            )}
          >
            {t === "medals" ? "Conquistas" : "Estatísticas"}
          </button>
        ))}
      </div>

      {tab === "medals" ? (
        <div className="mt-5 animate-rise">
          <p className="mb-3 font-display text-sm tracking-wide">Medalhas:</p>
          <ul className="space-y-3">
            {medals.map((m) => {
              const unlocked = m.progress >= m.goal;
              return (
                <li key={m.title} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-card">
                  <div
                    className={cn(
                      "relative grid size-14 shrink-0 place-items-center rounded-full font-display text-2xl",
                      unlocked ? m.medal : "bg-option text-muted-foreground grayscale",
                    )}
                  >
                    <span className={cn(!unlocked && "opacity-40")}>{m.icon}</span>
                    {!unlocked ? (
                      <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-card ring-1 ring-border">
                        <Lock className="size-3.5" />
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base tracking-wide">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                    {m.goal > 1 ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <ProgressBar value={(m.progress / m.goal) * 100} className="h-1.5 flex-1" />
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {m.progress}/{m.goal}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  {unlocked ? (
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-5 animate-rise space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-sm tracking-wide">Nível {level}</p>
              <p className="text-xs text-muted-foreground">
                {state.xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP para o nível {level + 1}
              </p>
            </div>
            <ProgressBar value={((state.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">{state.xp} XP no total</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="font-display text-sm tracking-wide">XP da semana</p>
            <div className="mt-4 flex h-32 items-end justify-between gap-2">
              {weekXp.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={cn("w-full rounded-t-lg transition-all", v ? "bg-primary" : "bg-option")}
                    style={{ height: `${Math.max(6, (v / maxXp) * 100)}%` }}
                  />
                  <span className="font-display text-[11px] text-muted-foreground">{WEEK[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="font-display text-sm tracking-wide">Caracteres aprendidos</p>
            {[
              { name: "Hiragana", n: 10, total: 46 },
              { name: "Katakana", n: 0, total: 46 },
              { name: "Kanji", n: 12, total: 24 },
            ].map((s) => (
              <div key={s.name} className="mt-3">
                <div className="flex justify-between text-xs">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">
                    {s.n}/{s.total}
                  </span>
                </div>
                <ProgressBar value={(s.n / s.total) * 100} className="mt-1" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary-soft p-4 text-accent-foreground">
              <p className="font-display text-2xl">87%</p>
              <p className="text-xs">Precisão média</p>
            </div>
            <div className="rounded-2xl bg-warning-soft p-4 text-warning">
              <p className="font-display text-2xl">{state.reviewItems}</p>
              <p className="text-xs">Itens em revisão</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
