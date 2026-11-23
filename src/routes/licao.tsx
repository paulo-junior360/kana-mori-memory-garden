import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eraser, RotateCcw, Volume2 } from "lucide-react";
import { toast } from "sonner";

import { BackButton } from "@/components/kana/back-button";
import { ProgressBar } from "@/components/kana/brand";
import { ComboMeter } from "@/components/kana/combo";
import { CharCircle, MnemonicArt } from "@/components/kana/mnemonic-art";
import { Sheet } from "@/components/kana/sheet";
import { WritePad } from "@/components/kana/write-pad";
import { Button } from "@/components/ui/button";
import { getItem } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import { COMBO_BONUS_AT, lessonXp, type LessonResult } from "@/lib/progress";
import { playCombo, playCorrect, playFanfare, playWrong } from "@/lib/sfx";
import { speakJapanese } from "@/lib/speak";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/licao")({
  head: () => ({
    meta: [
      { title: "Lição de Hiragana — KanaMori" },
      { name: "description", content: "Pratique hiragana com imagens mnemônicas, combos e escrita à mão." },
      { property: "og:title", content: "Lição de Hiragana — KanaMori" },
      { property: "og:description", content: "Pratique hiragana com imagens mnemônicas, combos e escrita à mão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Lesson,
});

type Question =
  | { kind: "choice"; prompt: "image" | "kana" | "romaji"; itemId: string; options: string[]; answer: string }
  | { kind: "write"; itemId: string };

const QUESTIONS: Question[] = [
  { kind: "choice", prompt: "image", itemId: "h-ku", options: ["ka", "ku", "ki", "ko"], answer: "ku" },
  { kind: "choice", prompt: "image", itemId: "h-a", options: ["o", "e", "a", "i"], answer: "a" },
  { kind: "choice", prompt: "kana", itemId: "h-ki", options: ["ka", "ke", "ki", "ku"], answer: "ki" },
  { kind: "choice", prompt: "romaji", itemId: "h-u", options: ["あ", "う", "え", "お"], answer: "う" },
  { kind: "choice", prompt: "image", itemId: "h-e", options: ["i", "e", "u", "a"], answer: "e" },
  { kind: "write", itemId: "h-o" },
];

const TOTAL_SECONDS = 120;

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Lesson() {
  const { state, actions } = useAppStore();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [justScored, setJustScored] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [phase, setPhase] = useState<"playing" | "done" | "timeout">("playing");
  const [exitOpen, setExitOpen] = useState(false);
  const [strokes, setStrokes] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);
  const [result, setResult] = useState<(LessonResult & { xp: number; savedStreak: boolean }) | null>(null);
  const finished = useRef(false);

  const q = QUESTIONS[index]!;
  const item = getItem(q.itemId);
  const answered = q.kind === "choice" ? selected !== null : revealed;
  const isLast = index === QUESTIONS.length - 1;

  useEffect(() => {
    if (phase !== "playing" || exitOpen) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase, exitOpen]);

  useEffect(() => {
    if (timeLeft === 0 && phase === "playing") setPhase("timeout");
  }, [timeLeft, phase]);

  const score = useCallback(
    (ok: boolean) => {
      if (ok) {
        const next = combo + 1;
        setCombo(next);
        setMaxCombo((m) => Math.max(m, next));
        setCorrect((c) => c + 1);
        setJustScored(true);
        if (next === COMBO_BONUS_AT) {
          playCombo();
          if (!state.comboMedal) {
            actions.unlockComboMedal();
            toast.success("🏅 Medalha desbloqueada: Combo perfeito!", {
              description: `${COMBO_BONUS_AT} acertos seguidos — +10 XP de bônus`,
            });
          }
        } else {
          playCorrect();
        }
      } else {
        playWrong();
        setCombo(0);
        setJustScored(false);
      }
    },
    [combo, state.comboMedal, actions],
  );

  function choose(option: string) {
    if (q.kind !== "choice" || selected !== null) return;
    setSelected(option);
    score(option === q.answer);
  }

  function checkWriting() {
    setRevealed(true);
    score(true);
    speakJapanese(item.char);
  }

  function next() {
    if (isLast) {
      if (finished.current) return;
      finished.current = true;
      const r: LessonResult = {
        correct,
        total: QUESTIONS.length,
        maxCombo,
        seconds: TOTAL_SECONDS - timeLeft,
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
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setCombo(0);
    setMaxCombo(0);
    setCorrect(0);
    setJustScored(false);
    setTimeLeft(TOTAL_SECONDS);
    setStrokes(0);
    setRevealed(false);
    setPhase("playing");
  }

  const title = useMemo(() => {
    if (q.kind === "write") return "Escreva o kana";
    if (q.prompt === "kana") return "Como se lê?";
    if (q.prompt === "romaji") return "Qual é o kana?";
    return "Qual é correto?";
  }, [q]);

  if (phase === "done" && result) {
    return <LessonDone result={result} streak={state.streak} onContinue={() => navigate({ to: "/inicio" })} />;
  }

  if (phase === "timeout") {
    return (
      <div className="flex flex-1 animate-rise flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl">⏰</div>
        <h1 className="mt-6 font-display text-3xl tracking-display">Tempo esgotado!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Você acertou {correct} de {QUESTIONS.length}. Tente de novo para salvar sua ofensiva — dessa vez você já
          conhece as imagens!
        </p>
        <div className="mt-10 flex w-full flex-col gap-3">
          <Button variant="hero" size="xl" onClick={restart}>
            <RotateCcw /> Tentar novamente
          </Button>
          <Button asChild variant="soft" size="xl">
            <Link to="/inicio">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((index + (answered ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center gap-4">
        <BackButton onClick={() => setExitOpen(true)} />
        <ProgressBar value={progress} className="flex-1" />
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
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={selected !== null}
                    className={cn(
                      "aspect-square rounded-full font-display text-4xl transition-all active:scale-95",
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
                    {item.char} = {item.romaji}
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
                char={item.char}
                revealed={revealed}
                clearSignal={clearSignal}
                onStroke={() => setStrokes((s) => s + 1)}
              />
              {revealed ? (
                <div className="absolute -top-3 right-2 animate-pop rounded-xl bg-card px-3 py-1.5 text-center shadow-card ring-1 ring-border">
                  <p className="font-display text-sm font-bold text-primary">+10 XP</p>
                  <p className="text-[10px] text-muted-foreground">{combo} acertos seguidos</p>
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => speakJapanese(item.char)}
                aria-label="Ouvir pronúncia"
                className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary"
              >
                <Volume2 className="size-5" />
              </button>
              {!revealed ? (
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
              ) : null}
            </div>
            {!revealed ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Contorne o “{item.romaji}” com o dedo — {item.mnemonic}
              </p>
            ) : null}
          </>
        )}

        <div className="mt-auto pt-6">
          <ComboMeter combo={combo} justScored={justScored} />
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
          Se sair agora, você perde o progresso desta lição e sua ofensiva continua em perigo.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="hero" size="xl" onClick={() => setExitOpen(false)}>
            Continuar lição
          </Button>
          <Button variant="soft" size="xl" className="text-destructive" onClick={() => navigate({ to: "/inicio" })}>
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
  onContinue,
}: {
  result: LessonResult & { xp: number; savedStreak: boolean };
  streak: number;
  onContinue: () => void;
}) {
  const accuracy = Math.round((result.correct / result.total) * 100);
  const stats = [
    { label: "Acertos", value: `${result.correct}/${result.total}` },
    { label: "Precisão", value: `${accuracy}%` },
    { label: "Tempo", value: fmt(result.seconds) },
    { label: "Maior combo", value: `${result.maxCombo}X` },
  ];
  return (
    <div className="flex flex-1 flex-col px-6 pt-12 pb-8">
      <div className="relative mx-auto grid size-32 place-items-center">
        <span className="absolute inset-0 animate-burst rounded-full bg-star/40" />
        <span className="relative animate-pop text-7xl">🎉</span>
      </div>
      <h1 className="mt-4 text-center font-display text-3xl tracking-display">Lição concluída!</h1>
      <p className="mt-2 text-center font-display text-sm tracking-wide text-muted-foreground">
        すごい! Você revisou as vogais do hiragana.
      </p>

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
          <span>Lição concluída</span> <span>+50 XP</span>
        </p>
        {result.maxCombo >= COMBO_BONUS_AT ? (
          <p className="flex justify-between font-display text-sm tracking-wide">
            <span>Bônus de combo</span> <span>+10 XP</span>
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
