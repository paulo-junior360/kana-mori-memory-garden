import type { ScriptId } from "@/data/kana";
import { DEFAULT_EQUIPPED, getShopItem, STREAK_FREEZE_ID } from "@/data/shop";

export type LessonResult = {
  correct: number;
  total: number;
  maxCombo: number;
  seconds: number;
};

/** Knowledge level chosen at sign-up; decides which scripts the user studies and reviews. */
export type ProfileLevel = "iniciante" | "avancado";

export const PROFILE_LABEL: Record<ProfileLevel, string> = {
  iniciante: "Iniciante",
  avancado: "Intermediário/Avançado",
};

export type TodayXp = { lessons: number; review: number; combo: number };

export type AppState = {
  userName: string;
  email: string;
  profileLevel: ProfileLevel;
  streak: number;
  /** Days of the current week with a completed activity (0–7). */
  weekDone: number;
  savedToday: boolean;
  xp: number;
  /** XP earned today, split by source (for the weekly stats). */
  today: TodayXp;
  lessonsCompleted: number;
  reviewItems: number;
  notifications: boolean;
  reviewDone: boolean;
  /** Spaced-repetition box per item id. */
  srs: Record<string, number>;
  /** Kana the user added to their review deck manually. */
  myReview: string[];
  /** Unlocked after 5 correct answers in a row inside a lesson. */
  comboMedal: boolean;
  lastLesson: (LessonResult & { xpEarned: number; savedStreak: boolean }) | null;
  /** XP spent in the shop. Level always uses total earned `xp`, so spending never lowers it. */
  xpSpent: number;
  streakFreezes: number;
  /** Cosmetic shop items owned (free defaults are implicit). */
  owned: string[];
  equipped: { tema: string; moldura: string; avatar: string };
};

export const LESSON_XP = 50;
export const COMBO_BONUS_XP = 10;
export const COMBO_BONUS_AT = 5;
export const REVIEW_XP = 30;
export const XP_PER_LEVEL = 500;
export const DAILY_GOAL_XP = 50;

export const initialState: AppState = {
  userName: "Lucas",
  email: "lucas@email.com",
  profileLevel: "iniciante",
  streak: 15,
  weekDone: 1,
  savedToday: false,
  xp: 1180,
  today: { lessons: 0, review: 0, combo: 0 },
  lessonsCompleted: 17,
  reviewItems: 24,
  notifications: true,
  reviewDone: false,
  srs: {
    "h-nu": 1,
    "h-me": 1,
    "h-ne": 2,
    "h-re": 2,
    "k-shi": 1,
    "k-tsu": 1,
    "k-so": 2,
    "k-n": 2,
    "j-議": 1,
    "j-難": 1,
    "j-識": 2,
    "j-際": 2,
  },
  myReview: [],
  comboMedal: false,
  lastLesson: null,
  xpSpent: 0,
  streakFreezes: 0,
  owned: [],
  equipped: { ...DEFAULT_EQUIPPED },
};

export function scriptsForLevel(level: ProfileLevel): ScriptId[] {
  return level === "avancado" ? ["hiragana", "katakana", "kanji"] : ["hiragana", "katakana"];
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function lessonXp(result: LessonResult): number {
  return LESSON_XP + (result.maxCombo >= COMBO_BONUS_AT ? COMBO_BONUS_XP : 0);
}

export function todayTotal(t: TodayXp): number {
  return t.lessons + t.review + t.combo;
}

/** Completing a lesson saves today's streak once (+1 day) and always grants XP and +1 lesson. */
export function applyLessonComplete(state: AppState, result: LessonResult): AppState {
  const xpEarned = lessonXp(result);
  const savedStreak = !state.savedToday;
  return {
    ...state,
    streak: savedStreak ? state.streak + 1 : state.streak,
    weekDone: savedStreak ? Math.min(7, state.weekDone + 1) : state.weekDone,
    savedToday: true,
    xp: state.xp + xpEarned,
    today: {
      ...state.today,
      lessons: state.today.lessons + LESSON_XP,
      combo: state.today.combo + (xpEarned - LESSON_XP),
    },
    lessonsCompleted: state.lessonsCompleted + 1,
    lastLesson: { ...result, xpEarned, savedStreak },
  };
}

export function applyReviewComplete(state: AppState, srs: Record<string, number>): AppState {
  return {
    ...state,
    srs,
    reviewDone: true,
    xp: state.xp + REVIEW_XP,
    today: { ...state.today, review: state.today.review + REVIEW_XP },
  };
}

export const MAX_STREAK_FREEZES = 3;

export function xpBalance(state: AppState): number {
  return Math.max(0, state.xp - state.xpSpent);
}

export function ownsItem(state: AppState, id: string): boolean {
  const item = getShopItem(id);
  return !!item && (item.price === 0 || state.owned.includes(id));
}

export type BuyCheck = "ok" | "sem-xp" | "ja-tem" | "limite" | "invalido";

export function canBuy(state: AppState, id: string): BuyCheck {
  const item = getShopItem(id);
  if (!item) return "invalido";
  if (id === STREAK_FREEZE_ID) {
    if (state.streakFreezes >= MAX_STREAK_FREEZES) return "limite";
  } else if (ownsItem(state, id)) return "ja-tem";
  if (xpBalance(state) < item.price) return "sem-xp";
  return "ok";
}

/** Buying spends XP (never total XP or level); cosmetics are equipped right away. */
export function applyPurchase(state: AppState, id: string): AppState {
  if (canBuy(state, id) !== "ok") return state;
  const item = getShopItem(id)!;
  const next = { ...state, xpSpent: state.xpSpent + item.price };
  if (id === STREAK_FREEZE_ID) return { ...next, streakFreezes: next.streakFreezes + 1 };
  return { ...next, owned: [...next.owned, id], equipped: { ...next.equipped, [item.category]: id } };
}

export function applyEquip(state: AppState, id: string): AppState {
  const item = getShopItem(id);
  if (!item || item.category === "bloqueio" || !ownsItem(state, id)) return state;
  return { ...state, equipped: { ...state.equipped, [item.category]: id } };
}
