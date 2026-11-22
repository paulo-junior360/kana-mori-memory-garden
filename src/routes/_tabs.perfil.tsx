import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Check, ChevronRight, Globe, LogOut, Palette, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/kana/auth-bits";
import { Sheet } from "@/components/kana/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/app-store";
import { levelFromXp } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_tabs/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — KanaMori" },
      { name: "description", content: "Seu progresso no japonês e as configurações do KanaMori." },
      { property: "og:title", content: "Perfil — KanaMori" },
      { property: "og:description", content: "Seu progresso no japonês e as configurações do KanaMori." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profile,
});

function Avatar() {
  return (
    <div className="grid size-28 place-items-center rounded-full bg-lavender p-3">
      <div className="grid size-full place-items-center rounded-full bg-card">
        <svg viewBox="0 0 40 40" className="size-12 text-foreground" aria-hidden>
          <circle cx="14" cy="16" r="2.4" fill="currentColor" />
          <circle cx="26" cy="16" r="2.4" fill="currentColor" />
          <path d="M13 24c3.5 4 10.5 4 14 0" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

type Picker = null | "edit" | "theme" | "lang";

function Profile() {
  const { state, actions } = useAppStore();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<Picker>(null);
  const [name, setName] = useState(state.userName);

  const progress = [
    { icon: "🎓", label: "Nível atual", value: levelFromXp(state.xp), cls: "text-warning" },
    { icon: "📅", label: "Dias seguidos", value: state.streak, cls: "text-flame" },
    { icon: "📝", label: "Lições concluídas", value: state.lessonsCompleted, cls: "text-link" },
    { icon: "🧠", label: "Itens em revisão", value: state.reviewItems, cls: "text-primary" },
  ];

  return (
    <div className="px-5 pt-8 pb-8">
      <div className="flex flex-col items-center text-center">
        <Avatar />
        <h1 className="mt-4 font-display text-3xl tracking-display">{state.userName}</h1>
        <p className="font-display text-sm tracking-wide text-muted-foreground">Estudante de japonês</p>
        <Button
          variant="soft"
          size="pill"
          className="mt-4 font-display font-normal tracking-wide text-foreground"
          onClick={() => {
            setName(state.userName);
            setSheet("edit");
          }}
        >
          Editar perfil
        </Button>
      </div>

      <p className="mt-8 mb-3 font-display text-base tracking-wide">Meu progresso:</p>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {progress.map((p) => (
          <li key={p.label} className="flex items-center gap-3 px-4 py-3">
            <span className="text-xl">{p.icon}</span>
            <span className="flex-1 font-display text-sm tracking-wide">{p.label}</span>
            <span className={cn("font-display text-lg font-semibold", p.cls)}>{p.value}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 mb-3 font-display text-base tracking-wide">Configurações:</p>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        <li className="flex items-center gap-3 px-4 py-3">
          <Bell className="size-5 text-muted-foreground" />
          <span className="flex-1 font-display text-sm tracking-wide">Notificações</span>
          <Switch
            checked={state.notifications}
            onCheckedChange={(on) => {
              actions.setNotifications(on);
              toast(on ? "Vamos te lembrar da ofensiva 🔔" : "Lembretes desligados");
            }}
            aria-label="Notificações"
          />
        </li>
        <li>
          <button onClick={() => setSheet("theme")} className="flex w-full items-center gap-3 px-4 py-3 text-left">
            <Palette className="size-5 text-muted-foreground" />
            <span className="flex-1 font-display text-sm tracking-wide">Tema</span>
            <span className="text-sm text-muted-foreground">Claro</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </li>
        <li>
          <button onClick={() => setSheet("lang")} className="flex w-full items-center gap-3 px-4 py-3 text-left">
            <Globe className="size-5 text-muted-foreground" />
            <span className="flex-1 font-display text-sm tracking-wide">Idioma do app</span>
            <span className="text-sm text-muted-foreground">Português (BR)</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </li>
      </ul>

      <div className="mt-6 flex flex-col gap-2">
        <Button variant="ghost" className="h-11 rounded-xl text-destructive" onClick={() => navigate({ to: "/" })}>
          <LogOut /> Sair da conta
        </Button>
        <Button
          variant="ghost"
          className="h-11 rounded-xl text-muted-foreground"
          onClick={() => {
            actions.resetDemo();
            toast("Demonstração reiniciada");
          }}
        >
          <RotateCcw /> Reiniciar demonstração
        </Button>
      </div>

      <Sheet open={sheet === "edit"} onClose={() => setSheet(null)} title="Editar perfil">
        <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
        <Button
          variant="hero"
          size="xl"
          className="mt-6"
          disabled={name.trim().length < 2}
          onClick={() => {
            actions.setName(name.trim());
            setSheet(null);
            toast.success("Perfil atualizado");
          }}
        >
          Salvar
        </Button>
      </Sheet>

      <Sheet
        open={sheet === "theme" || sheet === "lang"}
        onClose={() => setSheet(null)}
        title={sheet === "theme" ? "Tema" : "Idioma do app"}
      >
        <ul className="space-y-2">
          {(sheet === "theme"
            ? [
                { label: "Claro", active: true },
                { label: "Escuro", active: false },
              ]
            : [
                { label: "Português (BR)", active: true },
                { label: "English", active: false },
                { label: "Español", active: false },
              ]
          ).map((o) => (
            <li
              key={o.label}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3",
                o.active ? "border-primary bg-primary-soft" : "border-border text-muted-foreground",
              )}
            >
              <span className="font-display text-sm tracking-wide">{o.label}</span>
              {o.active ? <Check className="size-4 text-primary" /> : <span className="text-xs">Em breve</span>}
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}
