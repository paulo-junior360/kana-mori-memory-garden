import { describe, expect, it } from "vitest";

import {
  applyEquip,
  applyLessonComplete,
  applyPurchase,
  averageAccuracy,
  canBuy,
  initialState,
  learnedCharCount,
  levelFromXp,
  MAX_STREAK_FREEZES,
  xpBalance,
} from "@/lib/progress";
import { intervalLabel, nextBox } from "@/lib/srs";

const result = { correct: 6, total: 6, maxCombo: 6, seconds: 70 };

describe("ofensiva", () => {
  it("first lesson of the day adds one day to the streak", () => {
    const s = applyLessonComplete({ ...initialState, streak: 15, savedToday: false }, result);
    expect(s.streak).toBe(16);
    expect(s.savedToday).toBe(true);
  });

  it("a second lesson the same day does not add another streak day", () => {
    const once = applyLessonComplete({ ...initialState, streak: 15, savedToday: false }, result);
    const twice = applyLessonComplete(once, result);
    expect(twice.streak).toBe(16);
    expect(twice.lessonsCompleted).toBe(once.lessonsCompleted + 1);
  });

  it("lesson gives 50 XP, plus 10 for each 5X combo cycle completed", () => {
    expect(applyLessonComplete({ ...initialState, xp: 0 }, { ...result, maxCombo: 4 }).xp).toBe(50);
    expect(applyLessonComplete({ ...initialState, xp: 0 }, { ...result, maxCombo: 5 }).xp).toBe(60);

    const multi = applyLessonComplete(
      { ...initialState, xp: 0, today: { lessons: 0, review: 0, combo: 0 } },
      { correct: 18, total: 20, maxCombo: 7, combosCompleted: 3, seconds: 150 },
    );
    expect(multi.xp).toBe(80);
    expect(multi.today).toEqual({ lessons: 50, review: 0, combo: 30 });
    expect(multi.lastLesson?.xpEarned).toBe(80);
  });

  it("level goes up every 500 XP", () => {
    expect(levelFromXp(1180)).toBe(3);
    expect(levelFromXp(1500)).toBe(4);
  });

  it("perfect and fast medals stay unlocked after a slower or imperfect lesson", () => {
    const first = applyLessonComplete(initialState, { correct: 6, total: 6, maxCombo: 6, seconds: 42 });
    expect(first.perfectMedal).toBe(true);
    expect(first.fastMedal).toBe(true);
    const second = applyLessonComplete(first, { correct: 4, total: 6, maxCombo: 2, seconds: 90 });
    expect(second.perfectMedal).toBe(true);
    expect(second.fastMedal).toBe(true);
  });

  it("completing a unit unlocks it in completedUnits and updates learned characters and accuracy", () => {
    expect(learnedCharCount(initialState, "katakana")).toBe(0);
    const s = applyLessonComplete(initialState, {
      correct: 6,
      total: 6,
      maxCombo: 6,
      seconds: 55,
      script: "katakana",
      unitId: "k-u1",
    });
    expect(s.completedUnits.katakana).toContain("k-u1");
    expect(learnedCharCount(s, "katakana")).toBe(5);
    expect(averageAccuracy(s)).toBe(Math.round((93 / 106) * 100));
  });
});

describe("repetição espaçada", () => {
  it("a miss sends the card back to 10 minutes", () => {
    expect(intervalLabel(nextBox(3, "errei"))).toBe("10 min");
  });
  it("easy jumps further than good", () => {
    expect(nextBox(1, "bom")).toBe(2);
    expect(nextBox(1, "facil")).toBe(3);
    expect(intervalLabel(nextBox(1, "facil"))).toBe("7 dias");
  });
  it("hard keeps the card in place", () => {
    expect(nextBox(2, "dificil")).toBe(2);
  });
});

describe("loja", () => {
  const rich = { ...initialState, xp: 1000, xpSpent: 0 };

  it("buying spends XP from the balance but never lowers the level", () => {
    const s = applyPurchase(rich, "tema-sakura");
    expect(xpBalance(s)).toBe(700);
    expect(levelFromXp(s.xp)).toBe(levelFromXp(1000));
  });

  it("a purchased cosmetic is owned and equipped right away", () => {
    const s = applyPurchase(rich, "avatar-neko");
    expect(s.owned).toContain("avatar-neko");
    expect(s.equipped.avatar).toBe("avatar-neko");
  });

  it("cannot buy without enough XP", () => {
    const poor = { ...initialState, xp: 100, xpSpent: 0 };
    expect(canBuy(poor, "bloqueio")).toBe("sem-xp");
    expect(applyPurchase(poor, "bloqueio")).toBe(poor);
  });

  it("streak freezes stack up to 3", () => {
    let s = { ...initialState, xp: 5000, xpSpent: 0 };
    for (let i = 0; i < 4; i++) s = applyPurchase(s, "bloqueio");
    expect(s.streakFreezes).toBe(MAX_STREAK_FREEZES);
    expect(canBuy(s, "bloqueio")).toBe("limite");
  });

  it("an owned cosmetic cannot be bought twice", () => {
    const s = applyPurchase(rich, "moldura-ouro");
    expect(canBuy(s, "moldura-ouro")).toBe("ja-tem");
  });

  it("cannot equip an item not owned", () => {
    expect(applyEquip(rich, "tema-yoru").equipped.tema).toBe("tema-mori");
  });
});
