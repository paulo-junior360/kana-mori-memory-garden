import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eraser, Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { BackButton, BackLink } from "@/components/kana/back-button";
import { ProgressBar } from "@/components/kana/brand";
import { ComboMeter } from "@/components/kana/combo";
import { CharCircle, MnemonicArt } from "@/components/kana/mnemonic-art";
import { Sheet } from "@/components/kana/sheet";
import { WritePad, type WritePadHandle } from "@/components/kana/write-pad";
import { Button } from "@/components/ui/button";
import { buildUnitQuestions, getItem, getUnit, hiraganaUnits, isScriptId, scripts, type ScriptId } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import {
  COMBO_BONUS_AT,
  COMBO_BONUS_XP,
  combosFromResult,
  LESSON_XP,
  lessonComboXp,
  lessonXp,
  scriptsForLevel,
  type LessonResult,
} from "@/lib/progress";
import { playCombo, playCorrect, playFanfare, playWrong } from "@/lib/sfx";
import { speakJapanese } from "@/lib/speak";
import type { WriteEvalResult } from "@/lib/write-eval";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/licao")({
  validateSearch: (search: Record<string, unknown>): { sistema?: ScriptId | undefined; unidade?: string | undefined } => ({
    sistema: typeof search["sistema"] === "string" && isScriptId(search["sistema"]) ? search["sistema"] : undefined,
    unidade: typeof search["unidade"] === "string" ? search["unidade"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lição — KanaMori" },
      { name: "description", content: "Pratique hiragana, katakana e kanji com imagens mnemônicas, combos e escrita à mão." },
      { property: "og:title", content: "Lição — KanaMori" },
      { property: "og:description", content: "Pratique hiragana, katakana e kanji com imagens mnemônicas, combos e escrita à mão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Lesson,
});

const DEFAULT_QUESTIONS = buildUnitQuestions("hiragana", hiraganaUnits[0]!);
const SECONDS_PER_QUESTION = 20;

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Lesson() {
  const { state, actions } = useAppStore();
  const navigate = useNavigate();
  const { sistema, unidade } = Route.useSearch();
  const unit = sistema && unidade ? getUnit(sistema, unidade) : undefined;
  const blocked = Boolean(sistema && !scriptsForLevel(state.profileLevel).includes(sistema));
  const questions = useMemo(
    () => (sistema && unit ? buildUnitQuestions(sistema, unit) : DEFAULT_QUESTIONS),
    [sistema, unit],
  );
  const totalSeconds = Math.max(120, questions.length * SECONDS_PER_QUESTION);
  const backTo = sistema ? "/aprender" : "/inicio";

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [combosCompleted, setCombosCompleted] = useState(0);
  const [comboCelebrating, setComboCelebrating] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [justScored, setJustScored] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [phase, setPhase] = useState<"playing" | "done" | "timeout">("playing");
  const [exitOpen, setExitOpen] = useState(false);
  const [strokes, setStrokes] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [writeEval, setWriteEval] = useState<WriteEvalResult | null>(null);
  const [clearSignal, setClearSignal] = useState(0);
  const [result, setResult] = useState<(LessonResult & { xp: number; savedStreak: boolean }) | null>(null);
  const finished = useRef(false);
  const writePadRef = useRef<WritePadHandle>(null);
  const comboTimerRef = useRef<number | null>(null);

  const q = questions[index]!;
  const item = getItem(q.itemId);
  const isKanji = item.script === "kanji";
  const answered = q.kind === "choice" ? selected !== null : revealed;
  const isLast = index === questions.length - 1;

  useEffect(() => {
    return () => {
      if (comboTimerRef.current !== null) window.clearTimeout(comboTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (blocked || phase !== "playing" || exitOpen) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [blocked, phase, exitOpen]);

  useEffect(() => {
    if (!blocked && timeLeft === 0 && phase === "playing") setPhase("timeout");
  }, [blocked, timeLeft, phase]);

  const score = useCallback(
    (ok: boolean) => {
      if (comboTimerRef.current !== null) {
        window.clearTimeout(comboTimerRef.current);
        comboTimerRef.current = null;
      }
      if (ok) {
        const nextStreak = streakCount + 1;
        setStreakCount(nextStreak);
        setMaxCombo((m) => Math.max(m, nextStreak));
        setCorrect((c) => c + 1);
        setJustScored(true);

        const nextCombo = combo + 1;
        if (nextCombo >= COMBO_BONUS_AT) {
          const totalCombos = combosCompleted + 1;
          setCombosCompleted(totalCombos);
          setCombo(0);
          setComboCelebrating(true);
          comboTimerRef.current = window.setTimeout(() => {
            setComboCelebrating(false);
            comboTimerRef.current = null;
          }, 1100);
          playCombo();
          if (!state.comboMedal) {
            actions.unlockComboMedal();
            toast.success("🏅 Medalha desbloqueada: Combo perfeito!");
          }
        } else {
          setCombo(nextCombo);
          setComboCelebrating(false);
          playCorrect();
        }
      } else {
        playWrong();
        setCombo(0);
        setStreakCount(0);
        setComboCelebrating(false);
        setJustScored(false);
      }
    },
    [combo, streakCount, combosCompleted, state.comboMedal, actions],
  );

  function choose(option: string) {
    if (q.kind !== "choice" || selected !== null) return;
    setSelected(option);
    score(option === q.answer);
  }

  function checkWriting() {
    if (revealed) return;
    const evaluation = writePadRef.current?.evaluate() ?? { ok: false, coverage: 0, precision: 0, reason: "empty" as const };
    setWriteEval(evaluation);
    setRevealed(true);
    score(evaluation.ok);
    if (evaluation.ok) {
      speakJapanese(item.reading ?? item.char);
    }
  }

  function next() {
    if (comboTimerRef.current !== null) {
      window.clearTimeout(comboTimerRef.current);
      comboTimerRef.current = null;
    }
    setComboCelebrating(false);
    if (isLast) {
      if (finished.current) return;
      finished.current = true;
      const r: LessonResult = {
        correct,
        total: questions.length,
        maxCombo,
        combosCompleted,
        seconds: totalSeconds - timeLeft,
        ...(sistema && unit ? { script: sistema, unitId: unit.id } : {}),
      };
      setResult({ ...r, xp: lessonXp(r), savedStreak: !state.savedToday });
      actions.completeLesson(r);
      playFanfare();
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setJustScored(false);
    setStrokes(0);
    setRevealed(false);
    setWriteEval(null);
    setClearSignal((c) => c + 1);
  }

  function restart() {
    if (comboTimerRef.current !== null) {
      window.clearTimeout(comboTimerRef.current);
      comboTimerRef.current = null;
    }
    finished.current = false;
    setIndex(0);
    setSelected(null);
    setCombo(0);
    setStreakCount(0);
    setMaxCombo(0);
    setCombosCompleted(0);
    setComboCelebrating(false);
    setCorrect(0);
    setJustScored(false);
    setTimeLeft(totalSeconds);
    setStrokes(0);
    setRevealed(false);
    setWriteEval(null);
    setClearSignal((c) => c + 1);
    setPhase("playing");
  }

  const title = useMemo(() => {
    if (q.kind === "write") return isKanji ? "Escreva o kanji" : "Escreva o kana";
    if (q.prompt === "kana") return "Como se lê?";
    if (q.prompt === "romaji") return isKanji ? "Qual é o kanji?" : "Qual é o kana?";
    return "Qual é correto?";
  }, [q, isKanji]);

  if (blocked) {
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

  if (phase === "done" && result) {
    const subtitle =
      sistema && unit
        ? `すごい! Você completou ${scripts[sistema].name} · ${unit.title}.`
        : "すごい! Você revisou os caracteres do hiragana.";
    return (
      <LessonDone
        result={result}
        streak={state.streak}
        subtitle={subtitle}
        onContinue={() => navigate({ to: backTo })}
      />
    );
  }

  if (phase === "timeout") {
    return (
      <div className="flex flex-1 animate-rise flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl">⏰</div>
        <h1 className="mt-6 font-display text-3xl tracking-display">Tempo esgotado!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Você acertou {correct} de {questions.length}. Tente de novo para salvar sua ofensiva — dessa vez você já
          conhece as imagens!
        </p>
        <div className="mt-10 flex w-full flex-col gap-3">
          <Button variant="hero" size="xl" onClick={restart}>
            <RotateCcw /> Tentar novamente
          </Button>
          <Button asChild variant="soft" size="xl">
            <Link to={backTo}>Voltar</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center gap-4">
        <BackButton onClick={() => setExitOpen(true)} />
        <ProgressBar value={progress} className="flex-1" />
        <span className="font-display text-sm text-muted-foreground tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>

      <h1 className="mt-6 text-center font-display text-3xl tracking-display">{title}</h1>

      <div className="mx-auto mt-4 flex items-center gap-6 rounded-md border border-foreground/70 px-5 py-1.5 font-display tracking-wide">
        <span>Tempo</span>
        <span className={cn("tabular-nums", timeLeft <= 20 && "text-destructive")}>{fmt(timeLeft)}</span>
      </div>

      <div key={index} className="flex flex-1 animate-rise flex-col">
        {q.kind === "choice" ? (
          <>
            <div className="mt-6 flex justify-center">
              {q.prompt === "image" ? (
                <MnemonicArt item={item} className="size-40 text-5xl shadow-card" />
              ) : q.prompt === "kana" ? (
                <CharCircle char={item.char} className="size-40 text-7xl" />
              ) : isKanji ? (
                <div className="flex size-40 flex-col items-center justify-center rounded-full bg-muted px-4 text-center">
                  <span className="font-display text-xl leading-tight">{item.meaning}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {item.reading} · {item.romaji}
                  </span>
                </div>
              ) : (
                <div className="grid size-40 place-items-center rounded-full bg-muted font-display text-6xl">
                  {item.romaji}
                </div>
              )}
            </div>
            <div className="mx-auto mt-6 grid w-full max-w-[300px] grid-cols-2 gap-x-8 gap-y-5">
              {q.options.map((opt) => {
                const isAnswer = opt === q.answer;
                const isChosen = opt === selected;
                const sizeCls = opt.length >= 4 ? "text-2xl" : opt.length === 3 ? "text-3xl" : "text-4xl";
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={selected !== null}
                    className={cn(
                      "aspect-square rounded-full font-display transition-all active:scale-95",
                      sizeCls,
                      selected === null && "bg-option hover:bg-border",
                      selected !== null && isAnswer && "animate-pop bg-success text-success-foreground",
                      selected !== null && isChosen && !isAnswer && "animate-shake bg-destructive-soft text-destructive",
                      selected !== null && !isAnswer && !isChosen && "bg-option opacity-50",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected !== null && selected !== q.answer ? (
              <div className="mt-5 flex animate-rise items-center gap-3 rounded-2xl bg-destructive-soft px-4 py-3">
                <MnemonicArt item={item} className="size-10 shrink-0 text-sm" />
                <p className="text-sm">
                  <strong className="font-display">
                    {isKanji ? `${item.char} = ${item.meaning} (${item.romaji})` : `${item.char} = ${item.romaji}`}
                  </strong>{" "}
                  — {item.mnemonic}
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="relative mt-6">
              <WritePad
                ref={writePadRef}
                char={item.char}
                revealed={revealed}
                status={!revealed ? "idle" : writeEval?.ok ? "correct" : "wrong"}
                clearSignal={clearSignal}
                onStroke={() => setStrokes((s) => s + 1)}
              />
              {revealed && writeEval?.ok ? (
                <div className="absolute -top-3 right-2 animate-pop rounded-xl bg-card px-3 py-1.5 text-center shadow-card ring-1 ring-success">
                  <p className="font-display text-sm font-bold text-primary">
                    {comboCelebrating ? `+${COMBO_BONUS_XP} XP` : "Boa escrita!"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{streakCount} acertos seguidos</p>
                </div>
              ) : null}
            </div>
            {!revealed ? (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setClearSignal((c) => c + 1);
                    setStrokes(0);
                  }}
                  aria-label="Limpar"
                  className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"
                >
                  <Eraser className="size-5" />
                </button>
              </div>
            ) : null}
            {!revealed ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Contorne todo o “{isKanji ? item.meaning : item.romaji}” seguindo a marca d’água — {item.mnemonic}
              </p>
            ) : writeEval && !writeEval.ok ? (
              <div className="mt-4 flex animate-rise items-center gap-3 rounded-2xl bg-destructive-soft px-4 py-3">
                <MnemonicArt item={item} className="size-10 shrink-0 text-sm" />
                <p className="text-sm">
                  <strong className="font-display text-destructive">
                    {writeEval.reason === "off-target"
                      ? "Traço fora do contorno."
                      : "Traço incompleto — contorne todo o caractere."}
                  </strong>{" "}
                  {isKanji ? `${item.char} = ${item.meaning} (${item.romaji})` : `${item.char} = ${item.romaji}`} —{" "}
                  {item.mnemonic}
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-auto pt-6">
          <ComboMeter
            combo={combo}
            justScored={justScored}
            celebrating={comboCelebrating}
            combosCompleted={combosCompleted}
          />
          {q.kind === "write" && !revealed ? (
            <Button variant="quiz" size="xl" className="mt-5" disabled={strokes === 0} onClick={checkWriting}>
              Verificar escrita
            </Button>
          ) : (
            <Button variant="quiz" size="xl" className="mt-5" disabled={!answered} onClick={next}>
              {isLast ? "Finalizar exercício" : "Próxima pergunta"}
            </Button>
          )}
        </div>
      </div>

      <Sheet open={exitOpen} onClose={() => setExitOpen(false)} title="Sair da lição?">
        <p className="text-sm text-muted-foreground">
          Se sair agora, você perde o progresso desta lição{!state.savedToday ? " e sua ofensiva continua em perigo" : ""}.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="hero" size="xl" onClick={() => setExitOpen(false)}>
            Continuar lição
          </Button>
          <Button variant="soft" size="xl" className="text-destructive" onClick={() => navigate({ to: backTo })}>
            Sair
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function LessonDone({
  result,
  streak,
  subtitle,
  onContinue,
}: {
  result: LessonResult & { xp: number; savedStreak: boolean };
  streak: number;
  subtitle: string;
  onContinue: () => void;
}) {
  const accuracy = Math.round((result.correct / result.total) * 100);
  const combos = combosFromResult(result);
  const comboXp = lessonComboXp(result);
  const stats = [
    { label: "Acertos", value: `${result.correct}/${result.total}` },
    { label: "Precisão", value: `${accuracy}%` },
    { label: "Tempo", value: fmt(result.seconds) },
    { label: "Combos 5X", value: `${combos}×` },
  ];
  return (
    <div className="flex flex-1 flex-col px-6 pt-12 pb-8">
      <div className="relative mx-auto grid size-32 place-items-center">
        <span className="absolute inset-0 animate-burst rounded-full bg-star/40" />
        <span className="relative animate-pop text-7xl">🎉</span>
      </div>
      <h1 className="mt-4 text-center font-display text-3xl tracking-display">Lição concluída!</h1>
      <p className="mt-2 text-center font-display text-sm tracking-wide text-muted-foreground">{subtitle}</p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="animate-rise rounded-2xl border border-border bg-card p-4 text-center shadow-card"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <p className="font-display text-2xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-primary-soft p-4 text-accent-foreground">
        <p className="flex justify-between font-display text-sm tracking-wide">
          <span>Lição concluída</span> <span>+{LESSON_XP} XP</span>
        </p>
        {combos > 0 ? (
          <p className="flex justify-between font-display text-sm tracking-wide">
            <span>
              Bônus de combo ({combos}× 5X)
            </span>{" "}
            <span>+{comboXp} XP</span>
          </p>
        ) : null}
        <p className="flex justify-between border-t border-primary/20 pt-2 font-display font-semibold tracking-wide">
          <span>Total</span> <span>+{result.xp} XP</span>
        </p>
      </div>

      {result.savedStreak ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          <span className="text-3xl">🔥</span>
          <p className="font-display text-sm tracking-wide">
            Ofensiva salva! Agora são <strong>{streak} dias</strong> seguidos.
          </p>
        </div>
      ) : null}

      <Button variant="hero" size="xl" className="mt-auto" onClick={onContinue}>
        Continuar
      </Button>
    </div>
  );
}
