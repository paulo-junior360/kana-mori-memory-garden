import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/kana/avatar";
import { BackLink } from "@/components/kana/back-button";
import { shopItems, STREAK_FREEZE_ID, type ShopCategory, type ShopItem } from "@/data/shop";
import { useAppStore } from "@/lib/app-store";
import { canBuy, MAX_STREAK_FREEZES, ownsItem, xpBalance } from "@/lib/progress";
import { cn } from "@/lib/utils";

const TABS: { id: ShopCategory; label: string }[] = [
  { id: "bloqueio", label: "Ofensiva" },
  { id: "tema", label: "Temas" },
  { id: "moldura", label: "Molduras" },
  { id: "avatar", label: "Avatares" },
];

export const Route = createFileRoute("/loja")({
  validateSearch: (search: Record<string, unknown>): { aba?: string } => ({
    aba: typeof search["aba"] === "string" ? search["aba"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Loja — KanaMori" },
      { name: "description", content: "Troque seu XP por bloqueios de ofensiva, temas, molduras e avatares." },
      { property: "og:title", content: "Loja — KanaMori" },
      { property: "og:description", content: "Troque seu XP por bloqueios de ofensiva, temas, molduras e avatares." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { state, actions } = useAppStore();
  const { aba } = Route.useSearch();
  const tab = (TABS.find((t) => t.id === aba)?.id ?? "bloqueio") as ShopCategory;
  const balance = xpBalance(state);
  const items = shopItems.filter((i) => i.category === tab);

  function buy(item: ShopItem) {
    const check = canBuy(state, item.id);
    if (check === "sem-xp") {
      toast.error("XP insuficiente", { description: `Faltam ${item.price - balance} XP. Que tal uma lição?` });
      return;
    }
    if (check === "limite") {
      toast.error(`Você já tem ${MAX_STREAK_FREEZES} bloqueios`, { description: "Esse é o máximo guardado de uma vez." });
      return;
    }
    if (check !== "ok") return;
    actions.buyItem(item.id);
    toast.success(item.id === STREAK_FREEZE_ID ? "🧊 Bloqueio guardado!" : `${item.icon} ${item.name} é seu!`, {
      description: item.id === STREAK_FREEZE_ID ? "Sua ofensiva está protegida por mais um dia." : "Já aplicado no seu perfil.",
    });
  }

  return (
    <div className="flex flex-1 flex-col pb-8">
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 pt-6 pb-3 backdrop-blur">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <BackLink to="/perfil" />
          <h1 className="truncate text-center font-display text-2xl tracking-display">Loja</h1>
          <span className="rounded-full bg-flame-soft px-3 py-1 font-display text-sm tabular-nums">⭐ {balance} XP</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-1 rounded-full bg-muted p-1">
          {TABS.map((t) => (
            <Link
              key={t.id}
              to="/loja"
              search={{ aba: t.id }}
              replace
              className={cn(
                "rounded-full py-1.5 text-center font-display text-xs tracking-wide text-muted-foreground",
                tab === t.id && "bg-card text-foreground shadow-card",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-5">
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Gastar XP não diminui seu nível — itens são só personalização.
        </p>

        {tab === "bloqueio" ? (
          <FreezeSection onBuy={buy} />
        ) : (
          <>
            {tab !== "tema" ? (
              <div className="mt-5 flex justify-center">
                <UserAvatar />
              </div>
            ) : null}
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {items.map((item) => {
                const owned = ownsItem(state, item.id);
                const equipped = state.equipped[item.category as "tema"] === item.id;
                const affordable = balance >= item.price;
                return (
                  <li key={item.id} className={cn("flex flex-col rounded-2xl border bg-card p-3 shadow-card", equipped ? "border-primary ring-2 ring-primary/30" : "border-border")}>
                    <Preview item={item} />
                    <p className="mt-2 font-display text-sm tracking-wide">{item.name}</p>
                    <p className="mb-3 flex-1 text-[11px] leading-snug text-muted-foreground">{item.desc}</p>
                    {equipped ? (
                      <span className="flex items-center justify-center gap-1 rounded-full bg-primary-soft py-1.5 font-display text-xs text-accent-foreground">
                        <Check className="size-3.5" /> Em uso
                      </span>
                    ) : owned ? (
                      <button onClick={() => actions.equipItem(item.id)} className="rounded-full border border-primary py-1.5 font-display text-xs text-primary active:scale-95">
                        Usar
                      </button>
                    ) : (
                      <button
                        onClick={() => buy(item)}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-full py-1.5 font-display text-xs active:scale-95",
                          affordable ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {!affordable ? <Lock className="size-3" /> : null}⭐ {item.price}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Preview({ item }: { item: ShopItem }) {
  if (item.category === "tema" && item.swatch) {
    return (
      <div className="relative h-20 overflow-hidden rounded-xl" style={{ background: item.swatch[1] }}>
        <div className="absolute inset-x-3 top-3 h-2 rounded-full bg-white/80" />
        <div className="absolute inset-x-3 top-7 h-2 w-1/2 rounded-full bg-white/80" />
        <div className="absolute inset-x-3 bottom-3 h-5 rounded-full" style={{ background: item.swatch[0] }} />
        <span className="absolute top-2 right-2 text-lg">{item.icon}</span>
      </div>
    );
  }
  if (item.category === "moldura") {
    return (
      <div className="grid h-20 place-items-center">
        <UserAvatar frameId={item.id} className="size-[4.5rem] p-2 text-[10px]" />
      </div>
    );
  }
  return (
    <div className="grid h-20 place-items-center">
      <UserAvatar avatarId={item.id} className="size-[4.5rem] p-2 text-[10px]" />
    </div>
  );
}

function FreezeSection({ onBuy }: { onBuy: (item: ShopItem) => void }) {
  const { state } = useAppStore();
  const item = shopItems.find((i) => i.id === STREAK_FREEZE_ID)!;
  const full = state.streakFreezes >= MAX_STREAK_FREEZES;
  const affordable = xpBalance(state) >= item.price;
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-3xl border border-border bg-[linear-gradient(160deg,#e6f4ff,#ffffff)] p-5 text-center shadow-card">
        <div className="text-6xl">🧊</div>
        <h2 className="mt-2 font-display text-xl tracking-display">{item.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Esqueceu de estudar? Um bloqueio é usado automaticamente e sua ofensiva de {state.streak} dias continua viva.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: MAX_STREAK_FREEZES }, (_, i) => (
            <span
              key={i}
              className={cn(
                "grid size-12 place-items-center rounded-2xl border-2 text-2xl",
                i < state.streakFreezes ? "border-sky-300 bg-sky-50" : "border-dashed border-border text-muted-foreground opacity-50",
              )}
            >
              {i < state.streakFreezes ? "🧊" : ""}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {state.streakFreezes} de {MAX_STREAK_FREEZES} guardados
        </p>
        <button
          onClick={() => onBuy(item)}
          disabled={full}
          className={cn(
            "mt-4 w-full rounded-full py-3 font-display text-base tracking-wide active:scale-[0.98]",
            full ? "bg-muted text-muted-foreground" : affordable ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {full ? "Estoque cheio" : `Comprar por ⭐ ${item.price} XP`}
        </button>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-primary-soft px-4 py-3 text-accent-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">Cada bloqueio cobre um dia perdido. Você pode guardar até {MAX_STREAK_FREEZES} de uma vez.</p>
      </div>
    </div>
  );
}
