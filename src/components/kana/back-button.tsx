import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

const cls =
  "grid size-10 shrink-0 place-items-center rounded-full bg-card text-link shadow-card ring-1 ring-border transition-transform active:scale-95";

export function BackLink({ to, className }: { to: "/" | "/inicio" | "/aprender" | "/revisao" | "/perfil"; className?: string }) {
  return (
    <Link to={to} aria-label="Voltar" className={cn(cls, className)}>
      <ArrowLeft className="size-5" />
    </Link>
  );
}

export function BackButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} aria-label="Voltar" className={cn(cls, className)}>
      <ArrowLeft className="size-5" />
    </button>
  );
}
