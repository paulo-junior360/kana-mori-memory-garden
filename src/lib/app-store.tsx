import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  applyEquip,
  applyLessonComplete,
  applyPurchase,
  applyReviewComplete,
  initialState,
  type AppState,
  type LessonResult,
  type ProfileLevel,
} from "./progress";
import { nextBox, type Rating } from "./srs";

const STORAGE_KEY = "kanamori-state-v2";

type Actions = {
  signIn: (name: string, email: string, level?: ProfileLevel) => void;
  completeLesson: (result: LessonResult) => void;
  completeReview: (ratings: Record<string, Rating>) => void;
  updateProfile: (name: string, level: ProfileLevel) => void;
  setNotifications: (on: boolean) => void;
  toggleMyReview: (id: string) => void;
  unlockComboMedal: () => void;
  resetDemo: () => void;
  buyItem: (id: string) => void;
  equipItem: (id: string) => void;
};

const Ctx = createContext<{ state: AppState; actions: Actions } | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppState>;
        setState({ ...initialState, ...saved, equipped: { ...initialState.equipped, ...saved.equipped } });
      }
    } catch {
      // ignore corrupted storage
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const signIn = useCallback((name: string, email: string, level?: ProfileLevel) => {
    setState((s) => ({
      ...s,
      userName: name.trim() || s.userName,
      email: email.trim() || s.email,
      profileLevel: level ?? s.profileLevel,
    }));
  }, []);
  const completeLesson = useCallback((result: LessonResult) => {
    setState((s) => applyLessonComplete(s, result));
  }, []);
  const completeReview = useCallback((ratings: Record<string, Rating>) => {
    setState((s) => {
      const srs = { ...s.srs };
      for (const [id, r] of Object.entries(ratings)) srs[id] = nextBox(srs[id] ?? 0, r);
      return applyReviewComplete(s, srs);
    });
  }, []);
  const updateProfile = useCallback((name: string, level: ProfileLevel) => {
    setState((s) => ({ ...s, userName: name, profileLevel: level, reviewDone: level === s.profileLevel && s.reviewDone }));
  }, []);
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
  const buyItem = useCallback((id: string) => setState((s) => applyPurchase(s, id)), []);
  const equipItem = useCallback((id: string) => setState((s) => applyEquip(s, id)), []);

  useEffect(() => {
    document.documentElement.dataset["theme"] = state.equipped.tema;
  }, [state.equipped.tema]);

  const value = useMemo(
    () => ({
      state,
      actions: {
        signIn,
        completeLesson,
        completeReview,
        updateProfile,
        setNotifications,
        toggleMyReview,
        unlockComboMedal,
        resetDemo,
        buyItem,
        equipItem,
      },
    }),
    [state, signIn, completeLesson, completeReview, updateProfile, setNotifications, toggleMyReview, unlockComboMedal, resetDemo, buyItem, equipItem],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
