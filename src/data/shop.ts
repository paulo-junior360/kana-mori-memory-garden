export type ShopCategory = "bloqueio" | "tema" | "moldura" | "avatar";

export type ShopItem = {
  id: string;
  category: ShopCategory;
  name: string;
  desc: string;
  price: number;
  /** Emoji shown on the card (and the avatar itself for avatars). */
  icon: string;
  /** Swatch colors for themes / CSS classes for frames. */
  swatch?: string[];
  frameClass?: string;
};

export const STREAK_FREEZE_ID = "bloqueio";

export const shopItems: ShopItem[] = [
  { id: STREAK_FREEZE_ID, category: "bloqueio", name: "Bloqueio de ofensiva", desc: "Protege sua sequência por 1 dia sem estudar", price: 200, icon: "🧊" },

  { id: "tema-mori", category: "tema", name: "Mori", desc: "O verde clássico da floresta", price: 0, icon: "🌲", swatch: ["#2f9d7e", "#e8f6f0"] },
  { id: "tema-sakura", category: "tema", name: "Sakura", desc: "Rosa das cerejeiras na primavera", price: 300, icon: "🌸", swatch: ["#d9668f", "#fcecf2"] },
  { id: "tema-fuji", category: "tema", name: "Fuji", desc: "Azul do céu sobre o monte", price: 300, icon: "🗻", swatch: ["#3d7fc4", "#eaf2fb"] },
  { id: "tema-momiji", category: "tema", name: "Momiji", desc: "Laranja das folhas de outono", price: 400, icon: "🍁", swatch: ["#d4692e", "#fcefe6"] },
  { id: "tema-yoru", category: "tema", name: "Yoru", desc: "Roxo de uma noite estrelada", price: 500, icon: "🌙", swatch: ["#7b5cc9", "#f1ecfb"] },

  { id: "moldura-padrao", category: "moldura", name: "Lavanda", desc: "A moldura de todo estudante", price: 0, icon: "⭕", frameClass: "bg-lavender" },
  { id: "moldura-ouro", category: "moldura", name: "Ouro imperial", desc: "Brilho dourado para quem se dedica", price: 400, icon: "👑", frameClass: "bg-[linear-gradient(135deg,#f6d365,#d4a017,#f6d365)]" },
  { id: "moldura-sakura", category: "moldura", name: "Pétalas", desc: "Um degradê suave de cerejeira", price: 300, icon: "🌸", frameClass: "bg-[linear-gradient(135deg,#ffd1dc,#f78fb3,#ffd1dc)]" },
  { id: "moldura-onda", category: "moldura", name: "Grande onda", desc: "Inspirada na onda de Kanagawa", price: 350, icon: "🌊", frameClass: "bg-[linear-gradient(135deg,#a1c4fd,#1e5fa8,#c2e9fb)]" },
  { id: "moldura-fogo", category: "moldura", name: "Chama viva", desc: "Para quem nunca perde a ofensiva", price: 500, icon: "🔥", frameClass: "bg-[conic-gradient(#ff9a3c,#ff3d3d,#ffd23c,#ff9a3c)]" },

  { id: "avatar-padrao", category: "avatar", name: "Sorriso", desc: "O avatar de sempre", price: 0, icon: "🙂" },
  { id: "avatar-neko", category: "avatar", name: "Neko", desc: "O gatinho da rua Miyuki", price: 150, icon: "🐱" },
  { id: "avatar-kitsune", category: "avatar", name: "Kitsune", desc: "A raposa esperta", price: 250, icon: "🦊" },
  { id: "avatar-tanuki", category: "avatar", name: "Tanuki", desc: "O guaxinim brincalhão", price: 250, icon: "🦝" },
  { id: "avatar-panda", category: "avatar", name: "Panda", desc: "Calmo como um jardim zen", price: 200, icon: "🐼" },
  { id: "avatar-ninja", category: "avatar", name: "Ninja", desc: "Silencioso e focado", price: 400, icon: "🥷" },
  { id: "avatar-daruma", category: "avatar", name: "Daruma", desc: "Persistência que não cai", price: 450, icon: "🎎" },
];

export const DEFAULT_EQUIPPED = { tema: "tema-mori", moldura: "moldura-padrao", avatar: "avatar-padrao" } as const;

export function getShopItem(id: string): ShopItem | undefined {
  return shopItems.find((i) => i.id === id);
}
