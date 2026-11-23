import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { applyLessonComplete, initialState, type AppState, type LessonResult } from "./progress";
import { nextBox, type Rating } from "./srs";

const STORAGE_KEY = "kanamori-state-v1";

type Actions = {
  signIn: (name: string, email: string) => void;
  completeLesson: (result: LessonResult) => void;
  completeKanjiReview: (ratings: Record<string, Rating>) => void;
  setName: (name: string) => void;
  setNotifications: (on: boolean) => void;
  toggleMyReview: (id: string) => void;
  unlockComboMedal: () => void;
  resetDemo: () => void;
};

const Ctx = createContext<{ state: AppState; actions: Actions } | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as Partial<AppState>) });
    } catch {
      // ignore corrupted storage
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const signIn = useCallback((name: string, email: string) => {
    setState((s) => ({ ...s, userName: name.trim() || s.userName, email: email.trim() || s.email }));
  }, []);
  const completeLesson = useCallback((result: LessonResult) => {
    setState((s) => applyLessonComplete(s, result));
  }, []);
  const completeKanjiReview = useCallback((ratings: Record<string, Rating>) => {
    setState((s) => {
      const srs = { ...s.srs };
      for (const [id, r] of Object.entries(ratings)) srs[id] = nextBox(srs[id] ?? 0, r);
      return { ...s, srs, kanjiReviewDone: true, xp: s.xp + 30 };
    });
  }, []);
  const setName = useCallback((name: string) => setState((s) => ({ ...s, userName: name })), []);
  const setNotifications = useCallback((on: boolean) => setState((s) => ({ ...s, notifications: on })), []);
  const toggleMyReview = useCallback((id: string) => {
    setState((s) => {
      const has = s.myReview.includes(id);
      return {
        ...s,
        myReview: has ? s.myReview.filter((x) => x !== id) : [...s.myReview, id],
        reviewItems: s.reviewItems + (has ? -1 : 1),
      };
    });
  }, []);
  const unlockComboMedal = useCallback(() => setState((s) => ({ ...s, comboMedal: true })), []);
  const resetDemo = useCallback(() => setState(initialState), []);

  const value = useMemo(
    () => ({
      state,
      actions: {
        signIn,
        completeLesson,
        completeKanjiReview,
        setName,
        setNotifications,
        toggleMyReview,
        unlockComboMedal,
        resetDemo,
      },
    }),
    [state, signIn, completeLesson, completeKanjiReview, setName, setNotifications, toggleMyReview, unlockComboMedal, resetDemo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
