export type LessonResult = {
  correct: number;
  total: number;
  maxCombo: number;
  seconds: number;
};

export type AppState = {
  userName: string;
  email: string;
  streak: number;
  /** Days of the current week with a completed activity (0–7). */
  weekDone: number;
  savedToday: boolean;
  xp: number;
  lessonsCompleted: number;
  reviewItems: number;
  notifications: boolean;
  kanjiReviewDone: boolean;
  /** Spaced-repetition box per item id. */
  srs: Record<string, number>;
  /** Kana the user added to their review deck manually. */
  myReview: string[];
  /** Unlocked after 5 correct answers in a row inside a lesson. */
  comboMedal: boolean;
  lastLesson: (LessonResult & { xpEarned: number; savedStreak: boolean }) | null;
};

export const LESSON_XP = 50;
export const COMBO_BONUS_XP = 10;
export const COMBO_BONUS_AT = 5;
export const XP_PER_LEVEL = 500;

export const initialState: AppState = {
  userName: "Lucas",
  email: "lucas@email.com",
  streak: 15,
  weekDone: 1,
  savedToday: false,
  xp: 1180,
  lessonsCompleted: 17,
  reviewItems: 24,
  notifications: true,
  kanjiReviewDone: false,
  srs: { "j-議": 1, "j-難": 1, "j-識": 2, "j-際": 2, "j-憲": 2, "j-歴": 3 },
  myReview: [],
  comboMedal: false,
  lastLesson: null,
};

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function lessonXp(result: LessonResult): number {
  return LESSON_XP + (result.maxCombo >= COMBO_BONUS_AT ? COMBO_BONUS_XP : 0);
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
    lessonsCompleted: state.lessonsCompleted + 1,
    lastLesson: { ...result, xpEarned, savedStreak },
  };
}
