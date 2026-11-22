import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return <h1 className={cn("font-display text-3xl tracking-display text-foreground", className)}>KanaMori</h1>;
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("font-display text-xl tracking-display text-foreground", className)}>{children}</h2>;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-border", className)}>
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
