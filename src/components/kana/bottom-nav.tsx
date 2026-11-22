import { Link } from "@tanstack/react-router";
import { BookOpen, Home, NotebookText, Trophy, User } from "lucide-react";

const items = [
  { to: "/inicio", label: "Início", Icon: Home },
  { to: "/aprender", label: "Aprender", Icon: BookOpen },
  { to: "/revisao", label: "Revisão", Icon: NotebookText },
  { to: "/conquistas", label: "Conquistas", Icon: Trophy },
  { to: "/perfil", label: "Perfil", Icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 px-1 pt-2 pb-3 backdrop-blur">
      {items.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          className="group flex flex-col items-center gap-1 text-muted-foreground data-[status=active]:text-primary"
        >
          <Icon className="size-5" strokeWidth={1.8} />
          <span className="font-display text-[11px] tracking-wide">{label}</span>
          <span className="h-0.5 w-6 rounded-full bg-transparent group-data-[status=active]:bg-primary" />
        </Link>
      ))}
    </nav>
  );
}
