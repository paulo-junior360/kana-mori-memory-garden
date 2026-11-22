import { describe, expect, it } from "vitest";

import { applyLessonComplete, initialState, levelFromXp } from "@/lib/progress";
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

  it("lesson gives 50 XP, plus 10 with a 5X combo", () => {
    expect(applyLessonComplete({ ...initialState, xp: 0 }, { ...result, maxCombo: 4 }).xp).toBe(50);
    expect(applyLessonComplete({ ...initialState, xp: 0 }, { ...result, maxCombo: 5 }).xp).toBe(60);
  });

  it("level goes up every 500 XP", () => {
    expect(levelFromXp(1180)).toBe(3);
    expect(levelFromXp(1500)).toBe(4);
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
