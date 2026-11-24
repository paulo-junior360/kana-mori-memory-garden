import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppleIcon, Divider, Field, GoogleIcon } from "@/components/kana/auth-bits";
import { BackLink } from "@/components/kana/back-button";
import { LevelPicker } from "@/components/kana/level-picker";
import { Sheet } from "@/components/kana/sheet";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import type { ProfileLevel } from "@/lib/progress";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — KanaMori" },
      { name: "description", content: "Crie sua conta no KanaMori e comece sua trilha de japonês hoje." },
      { property: "og:title", content: "Criar conta — KanaMori" },
      { property: "og:description", content: "Crie sua conta no KanaMori e comece sua trilha de japonês hoje." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const { actions } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [level, setLevel] = useState<ProfileLevel | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | "level", string>>>({});
  const [legal, setLegal] = useState<null | "termos" | "privacidade">(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = "Digite seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Digite um e-mail válido.";
    if (form.password.length < 6) next.password = "A senha precisa ter pelo menos 6 caracteres.";
    if (!level) next.level = "Escolha seu nível de conhecimento.";
    setErrors(next);
    if (Object.keys(next).length) return;
    actions.signIn(form.name, form.email, level ?? "iniciante");
    toast.success(`Bem-vindo(a), ${form.name.trim().split(" ")[0]}! ようこそ`);
    navigate({ to: "/inicio" });
  }

  function social(provider: string) {
    if (!level) {
      setErrors({ level: "Escolha seu nível antes de continuar." });
      return;
    }
    actions.signIn("", "", level);
    toast.success(`Conectado com ${provider}`);
    navigate({ to: "/inicio" });
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-6 pb-8">
      <BackLink to="/" />
      <div className="mt-6 text-center">
        <h1 className="font-display text-3xl tracking-display">Criar sua conta</h1>
        <p className="mt-2 font-display text-sm tracking-wide text-muted-foreground">
          Comece sua jornada no japonês hoje
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Field
          label="Nome"
          placeholder="Digite seu nome"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <Field
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Field
          label="Senha"
          type="password"
          placeholder="Crie uma senha"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        <LevelPicker value={level} onChange={setLevel} error={errors.level} />
        <p className="-mt-2 text-xs text-muted-foreground">Você pode mudar isso depois em Perfil → Editar perfil.</p>
        <Button type="submit" variant="hero" size="xl" className="mt-2">
          Criar conta
        </Button>
      </form>

      <div className="mt-6 space-y-4">
        <Divider label="ou continue com" />
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 rounded-xl" onClick={() => social("Google")}>
            <GoogleIcon /> Google
          </Button>
          <Button variant="outline" className="h-12 rounded-xl" onClick={() => social("Apple")}>
            <AppleIcon /> Apple
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        Ao criar uma conta, você concorda com os{" "}
        <button className="text-primary underline-offset-2 hover:underline" onClick={() => setLegal("termos")}>
          Termos de Uso
        </button>{" "}
        e a{" "}
        <button className="text-primary underline-offset-2 hover:underline" onClick={() => setLegal("privacidade")}>
          Política de Privacidade
        </button>
        .
      </p>
      <p className="mt-auto pt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link to="/entrar" className="font-bold text-primary">
          Entrar
        </Link>
      </p>

      <Sheet
        open={legal !== null}
        onClose={() => setLegal(null)}
        title={legal === "termos" ? "Termos de Uso" : "Política de Privacidade"}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {legal === "termos"
            ? "O KanaMori é um app de estudos. Use-o para aprender, praticar e revisar japonês no seu ritmo. Respeite os outros estudantes e não compartilhe sua conta."
            : "Guardamos apenas o necessário para salvar seu progresso: nome, e-mail e o histórico das suas lições. Você pode apagar seus dados quando quiser."}
        </p>
        <Button variant="hero" size="xl" className="mt-6" onClick={() => setLegal(null)}>
          Entendi
        </Button>
      </Sheet>
    </div>
  );
}
