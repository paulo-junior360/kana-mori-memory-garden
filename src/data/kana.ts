import imgA from "@/assets/mnemonic-a.webp";
import imgI from "@/assets/mnemonic-i.webp";
import imgU from "@/assets/mnemonic-u.webp";
import imgE from "@/assets/mnemonic-e.webp";
import imgO from "@/assets/mnemonic-o.webp";
import imgKu from "@/assets/mnemonic-ku.webp";

export type Tone =
  | "green"
  | "blue"
  | "red"
  | "orange"
  | "yellow"
  | "pink"
  | "teal"
  | "sky"
  | "rose"
  | "lime";

export const toneBg: Record<Tone, string> = {
  green: "bg-m-green",
  blue: "bg-m-blue",
  red: "bg-m-red",
  orange: "bg-m-orange",
  yellow: "bg-m-yellow",
  pink: "bg-m-pink",
  teal: "bg-m-teal",
  sky: "bg-m-sky",
  rose: "bg-m-rose",
  lime: "bg-m-lime",
};

const toneCycle: Tone[] = ["teal", "orange", "sky", "rose", "lime", "pink", "yellow", "blue", "green", "red"];

export type ScriptId = "hiragana" | "katakana" | "kanji";

export type CharItem = {
  id: string;
  script: ScriptId;
  char: string;
  romaji: string;
  mnemonic: string;
  emoji: string;
  tone: Tone;
  image?: string;
  /** Kanji only */
  reading?: string;
  meaning?: string;
};

export type Unit = {
  id: string;
  title: string;
  items: CharItem[];
};

type Row = [char: string, romaji: string, mnemonic: string, emoji: string];

const images: Record<string, { image: string; tone: Tone }> = {
  "h-a": { image: imgA, tone: "green" },
  "h-i": { image: imgI, tone: "blue" },
  "h-u": { image: imgU, tone: "red" },
  "h-e": { image: imgE, tone: "orange" },
  "h-o": { image: imgO, tone: "yellow" },
  "h-ku": { image: imgKu, tone: "pink" },
};

function buildUnits(script: "hiragana" | "katakana", prefix: string, groups: [string, Row[]][]): Unit[] {
  let n = 0;
  return groups.map(([title, rows], gi) => ({
    id: `${prefix}-u${gi + 1}`,
    title,
    items: rows.map(([char, romaji, mnemonic, emoji]) => {
      const id = `${prefix}-${romaji}`;
      const extra = images[id];
      const tone = extra?.tone ?? toneCycle[n % toneCycle.length]!;
      n += 1;
      return { id, script, char, romaji, mnemonic, emoji, tone, ...(extra ? { image: extra.image } : {}) };
    }),
  }));
}

export const hiraganaUnits: Unit[] = buildUnits("hiragana", "h", [
  ["Vogais", [
    ["あ", "a", "Ah! Uma cobra", "🐍"],
    ["い", "i", "Imã", "🧲"],
    ["う", "u", "Uh... pesado!", "🏋️"],
    ["え", "e", "Exercício", "🤸"],
    ["お", "o", "Ô, que golaço!", "⚽"],
  ]],
  ["Linha K", [
    ["か", "ka", "Karatê com grito: kiai!", "🥋"],
    ["き", "ki", "Uma chave (key) abrindo a porta", "🔑"],
    ["く", "ku", "Ku-ku! O bico do cuco", "🐦"],
    ["け", "ke", "Kebab no espetinho", "🥙"],
    ["こ", "ko", "Coco partido ao meio", "🥥"],
  ]],
  ["Linha S", [
    ["さ", "sa", "Saci pulando numa perna só", "🦶"],
    ["し", "shi", "Shi! Um anzol de pesca", "🎣"],
    ["す", "su", "Suco com o canudo dando um nó", "🧃"],
    ["せ", "se", "Sela de cavalo", "🐎"],
    ["そ", "so", "Sorvete derretendo em zigue-zague", "🍦"],
  ]],
  ["Linha T", [
    ["た", "ta", "Tá vendo? Um 't' e um 'a' juntos", "🔤"],
    ["ち", "chi", "Chiclete: um '5' mascando", "🍬"],
    ["つ", "tsu", "Tsunami: uma onda gigante", "🌊"],
    ["て", "te", "Tê torto que escorregou", "🛝"],
    ["と", "to", "Tô com uma farpa no dedão", "🪵"],
  ]],
  ["Linha N", [
    ["な", "na", "Nadador mergulhando", "🏊"],
    ["に", "ni", "Ninja com duas espadas", "🥷"],
    ["ぬ", "nu", "Nu-dles: macarrão no hashi", "🍜"],
    ["ね", "ne", "Neko: o gato do rabo enrolado", "🐈"],
    ["の", "no", "No! Sinal de proibido", "🚫"],
  ]],
  ["Linha H", [
    ["は", "ha", "Haha! Alguém rindo de lado", "😆"],
    ["ひ", "hi", "Hihi: um sorrisão", "😁"],
    ["ふ", "fu", "Fu! O monte Fuji", "🗻"],
    ["へ", "he", "Hé? Só uma colina", "⛰️"],
    ["ほ", "ho", "Ho-ho-ho! Papai Noel e o mastro", "🎅"],
  ]],
  ["Linha M", [
    ["ま", "ma", "Mastro com duas bandeiras", "🎏"],
    ["み", "mi", "Música: uma nota musical", "🎵"],
    ["む", "mu", "Muu! A vaca e o rabinho", "🐄"],
    ["め", "me", "Me dá esse olho! (me = olho)", "👁️"],
    ["も", "mo", "Mais iscas no anzol", "🪝"],
  ]],
  ["Linha Y", [
    ["や", "ya", "Iate com a vela aberta", "⛵"],
    ["ゆ", "yu", "Yu-hu! Um peixe nadando", "🐟"],
    ["よ", "yo", "Yo-yo pendurado", "🪀"],
  ]],
  ["Linha R", [
    ["ら", "ra", "Rapper com o microfone", "🎤"],
    ["り", "ri", "Rio entre duas margens", "🏞️"],
    ["る", "ru", "Rua que acaba na rotatória", "🛣️"],
    ["れ", "re", "Remador com o remo", "🚣"],
    ["ろ", "ro", "Rodovia sem rotatória", "🛤️"],
  ]],
  ["W e N", [
    ["わ", "wa", "Wafer mordido", "🧇"],
    ["を", "wo", "Uô! Alguém arremessando", "🤾"],
    ["ん", "n", "Hmm-n: o fim da palavra", "✍️"],
  ]],
]);

export const katakanaUnits: Unit[] = buildUnits("katakana", "k", [
  ["Vogais", [
    ["ア", "a", "Antena torta", "📡"],
    ["イ", "i", "Inclinado: um tronco e um galho", "🌿"],
    ["ウ", "u", "Urna com tampinha", "🏺"],
    ["エ", "e", "Elevador: chão e teto", "🛗"],
    ["オ", "o", "Ombros largos de um homem forte", "💪"],
  ]],
  ["Linha K", [
    ["カ", "ka", "Karatê sem o grito", "🥋"],
    ["キ", "ki", "Key: a chave reta", "🗝️"],
    ["ク", "ku", "Cuco de bico fechado", "🐤"],
    ["ケ", "ke", "Ketchup derramando", "🍅"],
    ["コ", "ko", "Canto de uma caixa", "📦"],
  ]],
  ["Linha S", [
    ["サ", "sa", "Sacola de feira", "🛍️"],
    ["シ", "shi", "Shi! Olhos olhando pra cima", "😊"],
    ["ス", "su", "Surfista deslizando", "🏄"],
    ["セ", "se", "Seta que virou", "↪️"],
    ["ソ", "so", "Sopro de vento", "💨"],
  ]],
  ["Linha T", [
    ["タ", "ta", "Tá cheio: o cuco comeu", "🍽️"],
    ["チ", "chi", "Chi: mão segurando um bastão", "🏑"],
    ["ツ", "tsu", "Tsunami: gotas e uma onda", "🌊"],
    ["テ", "te", "Telescópio no tripé", "🔭"],
    ["ト", "to", "Totem com um galho", "🪧"],
  ]],
  ["Linha N", [
    ["ナ", "na", "Navalha cruzada", "✂️"],
    ["ニ", "ni", "Ni = dois risquinhos", "2️⃣"],
    ["ヌ", "nu", "Nunchaku cruzado", "🥢"],
    ["ネ", "ne", "Neko: gato sentado", "🐈"],
    ["ノ", "no", "No: uma só pincelada", "🖌️"],
  ]],
  ["Linha H", [
    ["ハ", "ha", "Haha: um bigodão", "🥸"],
    ["ヒ", "hi", "Hi! Uma cadeira de lado", "🪑"],
    ["フ", "fu", "Fu: o gancho do cabide", "🧥"],
    ["ヘ", "he", "Hé? Igual ao へ!", "⛰️"],
    ["ホ", "ho", "Hospital: cruz com braços", "🏥"],
  ]],
  ["Linha M", [
    ["マ", "ma", "Mamadeira de ponta-cabeça", "🍼"],
    ["ミ", "mi", "Missão tripla: três riscos", "3️⃣"],
    ["ム", "mu", "Muu! O focinho da vaca", "🐮"],
    ["メ", "me", "Me marca com um X", "❌"],
    ["モ", "mo", "Mola esticada", "🌀"],
  ]],
  ["Linha Y", [
    ["ヤ", "ya", "Yak com um chifre", "🐃"],
    ["ユ", "yu", "Yu: um U deitado", "🛁"],
    ["ヨ", "yo", "Yo: um E ao contrário", "🪜"],
  ]],
  ["Linha R", [
    ["ラ", "ra", "Rampa com teto", "🛹"],
    ["リ", "ri", "Rio: duas margens", "🏞️"],
    ["ル", "ru", "Rua com bifurcação", "🔀"],
    ["レ", "re", "Régua dobrada", "📐"],
    ["ロ", "ro", "Roda quadrada", "⬜"],
  ]],
  ["W e N", [
    ["ワ", "wa", "Uau: uma xícara", "☕"],
    ["ヲ", "wo", "Uô: gancho com prato", "🍳"],
    ["ン", "n", "Nnn: uma piscadela", "😉"],
  ]],
]);

type KanjiRow = [char: string, reading: string, romaji: string, meaning: string, mnemonic: string, emoji: string];

function buildKanji(groups: [string, KanjiRow[]][]): Unit[] {
  let n = 0;
  return groups.map(([title, rows], gi) => ({
    id: `j-u${gi + 1}`,
    title,
    items: rows.map(([char, reading, romaji, meaning, mnemonic, emoji]) => {
      const tone = toneCycle[n % toneCycle.length]!;
      n += 1;
      return { id: `j-${char}`, script: "kanji" as const, char, romaji, reading, meaning, mnemonic, emoji, tone };
    }),
  }));
}

export const kanjiUnits: Unit[] = buildKanji([
  ["Números", [
    ["一", "いち", "ichi", "um", "Um único risco: um", "1️⃣"],
    ["二", "に", "ni", "dois", "Dois riscos: dois", "2️⃣"],
    ["三", "さん", "san", "três", "Três riscos: três", "3️⃣"],
  ]],
  ["Natureza", [
    ["日", "にち", "nichi", "sol / dia", "Uma janela por onde o sol entra", "☀️"],
    ["月", "つき", "tsuki", "lua / mês", "A lua crescente com duas nuvens", "🌙"],
    ["山", "やま", "yama", "montanha", "Três picos de montanha", "🏔️"],
    ["川", "かわ", "kawa", "rio", "Três linhas de água correndo", "🏞️"],
    ["木", "き", "ki", "árvore", "Tronco, galhos e raízes", "🌳"],
    ["水", "みず", "mizu", "água", "Respingos saindo de um jato", "💧"],
    ["火", "ひ", "hi", "fogo", "Uma fogueira soltando faíscas", "🔥"],
  ]],
  ["Pessoas", [
    ["人", "ひと", "hito", "pessoa", "Uma pessoa caminhando", "🚶"],
    ["口", "くち", "kuchi", "boca", "Uma boca bem aberta", "👄"],
  ]],
  ["Escola", [
    ["学", "がく", "gaku", "estudo", "Criança com chapéu de formatura", "🎓"],
    ["校", "こう", "kō", "escola", "Árvore no pátio da escola", "🏫"],
    ["語", "ご", "go", "idioma", "Palavras saindo de cinco bocas", "🗣️"],
  ]],
  ["Cotidiano", [
    ["食", "しょく", "shoku", "comer", "Telhado sobre uma tigela boa", "🍚"],
    ["話", "わ", "wa", "conversa", "Palavras e uma língua: conversar", "💬"],
    ["時", "じ", "ji", "tempo / hora", "O sol marcando o templo: hora", "⏰"],
  ]],
  ["Avançado I", [
    ["議", "ぎ", "gi", "discussão / deliberação", "Palavras justas debatidas na mesa", "⚖️"],
    ["難", "なん", "nan", "dificuldade / problema", "Um pássaro preso no espinho", "🪶"],
    ["識", "しき", "shiki", "conhecimento / discernimento", "Palavras que viram sons e armas", "🧠"],
    ["際", "さい", "sai", "ocasião / limite", "A colina na fronteira do festival", "🚧"],
    ["憲", "けん", "ken", "constituição", "Um coração sob o teto da lei", "📜"],
    ["歴", "れき", "reki", "história", "Passos sob o penhasco do tempo", "🏛️"],
  ]],
]);

export const scripts: Record<ScriptId, { name: string; glyph: string; units: Unit[] }> = {
  hiragana: { name: "Hiragana", glyph: "あ", units: hiraganaUnits },
  katakana: { name: "Katakana", glyph: "ア", units: katakanaUnits },
  kanji: { name: "Kanji", glyph: "字", units: kanjiUnits },
};

export const allItems: CharItem[] = Object.values(scripts).flatMap((s) => s.units.flatMap((u) => u.items));

export function getItem(id: string): CharItem {
  const item = allItems.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown item ${id}`);
  return item;
}

export function isScriptId(v: string): v is ScriptId {
  return v === "hiragana" || v === "katakana" || v === "kanji";
}

/** Kanji chosen automatically for today's review (the user's hardest from last week). */
export const todaysKanjiReview: { id: string; difficulty: "Difícil" | "Médio" | "Fácil" }[] = [
  { id: "j-議", difficulty: "Difícil" },
  { id: "j-難", difficulty: "Difícil" },
  { id: "j-識", difficulty: "Médio" },
  { id: "j-際", difficulty: "Médio" },
  { id: "j-憲", difficulty: "Médio" },
  { id: "j-歴", difficulty: "Fácil" },
];
