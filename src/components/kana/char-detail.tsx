import { Check, Plus, Volume2 } from "lucide-react";

import { CharCircle, MnemonicArt } from "@/components/kana/mnemonic-art";
import { Sheet } from "@/components/kana/sheet";
import { Button } from "@/components/ui/button";
import type { CharItem } from "@/data/kana";
import { useAppStore } from "@/lib/app-store";
import { speakJapanese } from "@/lib/speak";

export function CharDetailSheet({ item, onClose }: { item: CharItem | null; onClose: () => void }) {
  const { state, actions } = useAppStore();
  if (!item) return null;
  const inReview = state.myReview.includes(item.id);
  const isKanji = item.script === "kanji";
  return (
    <Sheet open onClose={onClose}>
      <div className="flex items-center justify-center gap-5">
        <MnemonicArt item={item} className="size-28 text-4xl shadow-card" />
        <CharCircle char={item.char} className="size-28 text-6xl" />
      </div>
      <div className="mt-5 text-center">
        <p className="font-display text-3xl tracking-display">
          {isKanji ? item.meaning : item.romaji}
        </p>
        {isKanji ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Leitura: {item.reading} ({item.romaji})
          </p>
        ) : null}
      </div>
      <div className="mt-5 rounded-2xl bg-muted p-4">
        <p className="font-display text-xs tracking-display text-muted-foreground">MEMÓRIA</p>
        <p className="mt-1 font-display text-lg tracking-wide">“{item.mnemonic}”</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Imagine a cena enquanto olha para o {item.char}. O formato lembra essa imagem — e ela puxa o som “
          {item.romaji}”.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
        <Button
          variant="soft"
          className="h-13 rounded-xl px-5"
          onClick={() => speakJapanese(item.reading ?? item.char)}
          aria-label="Ouvir pronúncia"
        >
          <Volume2 className="size-5" />
        </Button>
        <Button variant={inReview ? "soft" : "hero"} className="h-13 rounded-xl text-base" onClick={() => actions.toggleMyReview(item.id)}>
          {inReview ? (
            <>
              <Check /> Na sua revisão
            </>
          ) : (
            <>
              <Plus /> Adicionar à revisão
            </>
          )}
        </Button>
      </div>
    </Sheet>
  );
}
