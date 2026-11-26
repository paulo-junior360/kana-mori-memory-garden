import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, TrendingDown, TrendingUp } from "lucide-react";

import { ProgressBar } from "@/components/kana/brand";
import { useAppStore } from "@/lib/app-store";
import { DAILY_GOAL_XP, levelFromXp, scriptsForLevel, todayTotal, XP_PER_LEVEL, type TodayXp } from "@/lib/progress";
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

const WEEK = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEK_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
/** Demo history for the days before today (lessons / reviews / combo bonus). */
const PAST: TodayXp[] = [
  { lessons: 50, review: 0, combo: 10 },
  { lessons: 100, review: 30, combo: 10 },
  { lessons: 0, review: 30, combo: 0 },
  { lessons: 50, review: 30, combo: 0 },
  { lessons: 100, review: 0, combo: 20 },
  { lessons: 50, review: 30, combo: 10 },
  { lessons: 50, review: 0, combo: 0 },
];
/** Demo XP per day last week, compared over the same days elapsed this week. */
const LAST_WEEK = [40, 90, 60, 50, 70, 40, 30];

function useTodayIndex() {
  const [idx, setIdx] = useState(4);
  useEffect(() => setIdx((new Date().getDay() + 6) % 7), []);
  return idx;
}

function Achievements() {
  const { state } = useAppStore();
  const [tab, setTab] = useState<"medals" | "stats">("medals");
  const level = levelFromXp(state.xp);
  const advanced = state.profileLevel === "avancado";

  const medals = [
    { title: "Primeiro passo", desc: "Conclua sua primeira lição", progress: 1, goal: 1, medal: "bg-medal-bronze", icon: "🌱" },
    { title: "Estudante consistente", desc: "Estude por 7 dias seguidos", progress: Math.min(7, state.streak), goal: 7, medal: "bg-medal-silver", icon: "📅" },
    { title: "Combo perfeito", desc: "Acerte 5 seguidas em uma lição", progress: state.comboMedal ? 1 : 0, goal: 1, medal: "bg-medal-gold", icon: "✨" },
    { title: "Ofensiva de fogo", desc: "Mantenha 30 dias seguidos", progress: Math.min(30, state.streak), goal: 30, medal: "bg-medal-gold", icon: "🔥" },
    { title: "Mestre do Hiragana", desc: "Complete todos os módulos de Hiragana", progress: 2, goal: 10, medal: "bg-medal-gold", icon: "あ" },
    { title: "Explorador do Katakana", desc: "Complete o primeiro módulo de Katakana", progress: 0, goal: 1, medal: "bg-medal-silver", icon: "ア" },
    ...(advanced
      ? [{ title: "Caçador de Kanji", desc: "Revise 50 kanjis", progress: state.reviewDone ? 16 : 12, goal: 50, medal: "bg-medal-gold", icon: "字" }]
      : []),
  ];

  const learned = [
    { id: "hiragana", name: "Hiragana", n: 10, total: 46 },
    { id: "katakana", name: "Katakana", n: 0, total: 46 },
    { id: "kanji", name: "Kanji", n: 12, total: 24 },
  ].filter((s) => scriptsForLevel(state.profileLevel).includes(s.id as "hiragana"));

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

          <WeeklyXp today={state.today} />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="font-display text-sm tracking-wide">Caracteres aprendidos</p>
            {learned.map((s) => (
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

const SOURCES = [
  { key: "lessons", label: "Lições", bar: "bg-primary", dot: "bg-primary" },
  { key: "review", label: "Revisões", bar: "bg-link", dot: "bg-link" },
  { key: "combo", label: "Bônus de combo", bar: "bg-star", dot: "bg-star" },
] as const;

function WeeklyXp({ today }: { today: TodayXp }) {
  const todayIdx = useTodayIndex();
  const [selected, setSelected] = useState<number | null>(null);
  const sel = selected ?? todayIdx;

  const days = WEEK.map((_, i) => (i < todayIdx ? PAST[i]! : i === todayIdx ? today : null));
  const totals = days.map((d) => (d ? todayTotal(d) : 0));
  const elapsed = todayIdx + 1;
  const weekTotal = totals.reduce((a, b) => a + b, 0);
  const avg = Math.round(weekTotal / elapsed);
  const best = totals.reduce((bi, v, i) => (v > totals[bi]! ? i : bi), 0);
  const goalDays = totals.filter((v, i) => i <= todayIdx && v >= DAILY_GOAL_XP).length;
  const lastWeekSoFar = LAST_WEEK.slice(0, elapsed).reduce((a, b) => a + b, 0);
  const diff = Math.round(((weekTotal - lastWeekSoFar) / lastWeekSoFar) * 100);
  const scaleMax = Math.max(DAILY_GOAL_XP * 2, ...totals);
  const goalPct = (DAILY_GOAL_XP / scaleMax) * 100;
  const selDay = days[sel];
  const selTotal = totals[sel] ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm tracking-wide">XP da semana</p>
          <p className="mt-0.5 font-display text-3xl">
            {weekTotal} <span className="text-sm text-muted-foreground">XP</span>
          </p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-xs",
            diff >= 0 ? "bg-primary-soft text-accent-foreground" : "bg-destructive-soft text-destructive",
          )}
        >
          {diff >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {diff >= 0 ? "+" : ""}
          {diff}% vs mesmo período da semana passada
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted px-2 py-2">
          <p className="font-display text-lg">{avg}</p>
          <p className="text-[10px] leading-tight text-muted-foreground">Média por dia</p>
        </div>
        <div className="rounded-xl bg-muted px-2 py-2">
          <p className="font-display text-lg">{WEEK[best]}</p>
          <p className="text-[10px] leading-tight text-muted-foreground">Melhor dia ({totals[best]} XP)</p>
        </div>
        <div className="rounded-xl bg-muted px-2 py-2">
          <p className="font-display text-lg">
            {goalDays}/{elapsed}
          </p>
          <p className="text-[10px] leading-tight text-muted-foreground">Dias com meta batida</p>
        </div>
      </div>

      <div className="relative mt-6 h-40">
        <div
          aria-hidden
          className="absolute inset-x-0 border-t-2 border-dashed border-flame/60"
          style={{ bottom: `calc(${goalPct}% * 0.82 + 1.25rem)` }}
        >
          <span className="absolute -top-4 right-0 bg-card pl-1 font-display text-[10px] text-flame">
            meta {DAILY_GOAL_XP} XP
          </span>
        </div>
        <div className="flex h-full items-end justify-between gap-2">
          {days.map((d, i) => {
            const total = totals[i]!;
            const future = d === null;
            const isSel = i === sel;
            return (
              <button
                key={WEEK[i]}
                onClick={() => setSelected(i)}
                disabled={future}
                aria-label={`${WEEK_FULL[i]}: ${total} XP`}
                aria-pressed={isSel}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span className={cn("font-display text-[10px]", isSel ? "text-foreground" : "text-muted-foreground")}>
                  {future ? "" : total}
                </span>
                <div className="flex h-[82%] w-full flex-col justify-end">
                  {future ? (
                    <div className="h-2 w-full rounded-md border border-dashed border-border" />
                  ) : total === 0 ? (
                    <div className="h-1.5 w-full rounded-md bg-option" />
                  ) : (
                    <div
                      className={cn(
                        "flex w-full flex-col-reverse overflow-hidden rounded-t-lg transition-all",
                        isSel ? "ring-2 ring-foreground/70 ring-offset-2 ring-offset-card" : "opacity-85",
                      )}
                      style={{ height: `${(total / scaleMax) * 100}%` }}
                    >
                      {SOURCES.map((s) =>
                        d[s.key] ? (
                          <div key={s.key} className={s.bar} style={{ height: `${(d[s.key] / total) * 100}%` }} />
                        ) : null,
                      )}
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "font-display text-[11px]",
                    i === todayIdx ? "font-semibold text-primary" : "text-muted-foreground",
                  )}
                >
                  {i === todayIdx ? "Hoje" : WEEK[i]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {SOURCES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn("size-2.5 rounded-sm", s.dot)} /> {s.label}
          </span>
        ))}
      </div>

      <div key={sel} className="mt-4 animate-rise rounded-xl bg-muted p-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm tracking-wide">
            {sel === todayIdx ? "Hoje" : WEEK_FULL[sel]}
          </p>
          {selTotal >= DAILY_GOAL_XP ? (
            <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] text-accent-foreground">
              <Check className="size-3" strokeWidth={3} /> Meta batida
            </span>
          ) : (
            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] text-warning">
              Faltam {DAILY_GOAL_XP - selTotal} XP para a meta
            </span>
          )}
        </div>
        <ul className="mt-2 space-y-1.5">
          {SOURCES.map((s) => (
            <li key={s.key} className="flex items-center gap-2 text-sm">
              <span className={cn("size-2.5 rounded-sm", s.dot)} />
              <span className="flex-1 text-muted-foreground">{s.label}</span>
              <span className="font-display tabular-nums">+{selDay?.[s.key] ?? 0} XP</span>
            </li>
          ))}
          <li className="flex items-center justify-between border-t border-border pt-1.5 text-sm">
            <span className="font-display">Total do dia</span>
            <span className="font-display font-semibold tabular-nums">{selTotal} XP</span>
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-muted-foreground">Toque em uma barra para ver o detalhe do dia.</p>
      </div>
    </div>
  );
}
