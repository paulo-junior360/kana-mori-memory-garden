import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppleIcon, Divider, Field, GoogleIcon } from "@/components/kana/auth-bits";
import { BackLink } from "@/components/kana/back-button";
import { Sheet } from "@/components/kana/sheet";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — KanaMori" },
      { name: "description", content: "Entre na sua conta KanaMori e continue sua ofensiva de estudos." },
      { property: "og:title", content: "Entrar — KanaMori" },
      { property: "og:description", content: "Entre na sua conta KanaMori e continue sua ofensiva de estudos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const { state, actions } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [forgot, setForgot] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
      setError("Confira seu e-mail e senha (mínimo de 6 caracteres).");
      return;
    }
    actions.signIn(state.userName, email);
    toast.success(`Que bom te ver de novo, ${state.userName}! おかえり`);
    navigate({ to: "/inicio" });
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-6 pb-8">
      <BackLink to="/" />
      <div className="mt-6 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary-soft font-display text-3xl text-primary">
          森
        </div>
        <h1 className="font-display text-3xl tracking-display">Bem-vindo de volta</h1>
        <p className="mt-2 font-display text-sm tracking-wide text-muted-foreground">
          Sua ofensiva está esperando por você
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Field
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
        <button type="button" onClick={() => setForgot(true)} className="text-sm text-primary">
          Esqueci minha senha
        </button>
        <Button type="submit" variant="hero" size="xl">
          Entrar
        </Button>
      </form>

      <div className="mt-6 space-y-4">
        <Divider label="ou entre com" />
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl"
            onClick={() => {
              toast.success("Conectado com Google");
              navigate({ to: "/inicio" });
            }}
          >
            <GoogleIcon /> Google
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl"
            onClick={() => {
              toast.success("Conectado com Apple");
              navigate({ to: "/inicio" });
            }}
          >
            <AppleIcon /> Apple
          </Button>
        </div>
      </div>

      <p className="mt-auto pt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-bold text-primary">
          Criar conta
        </Link>
      </p>

      <Sheet open={forgot} onClose={() => setForgot(false)} title="Recuperar senha">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Digite seu e-mail e enviaremos um link para você criar uma nova senha.
        </p>
        <div className="mt-4">
          <Field label="E-mail" type="email" placeholder="Digite seu e-mail" defaultValue={email} />
        </div>
        <Button
          variant="hero"
          size="xl"
          className="mt-6"
          onClick={() => {
            setForgot(false);
            toast.success("Link enviado! Confira sua caixa de entrada.");
          }}
        >
          Enviar link
        </Button>
      </Sheet>
    </div>
  );
}
