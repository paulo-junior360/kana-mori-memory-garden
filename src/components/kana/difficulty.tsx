import { cn } from "@/lib/utils";

const styles = {
  Difícil: "bg-destructive-soft text-destructive",
  Médio: "bg-warning-soft text-warning",
  Fácil: "bg-primary-soft text-accent-foreground",
} as const;

export function DifficultyTag({ level }: { level: keyof typeof styles }) {
  return (
    <span className={cn("rounded-full px-3 py-1 font-display text-xs tracking-wide", styles[level])}>{level}</span>
  );
}
