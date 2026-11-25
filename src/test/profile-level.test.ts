import { describe, expect, it } from "vitest";

import { getItem, reviewQueue } from "@/data/kana";
import { applyLessonComplete, applyReviewComplete, initialState, scriptsForLevel } from "@/lib/progress";

const scriptsIn = (ids: { id: string }[]) => new Set(ids.map((e) => getItem(e.id).script));

describe("perfil iniciante", () => {
  it("Aprender has only hiragana and katakana", () => {
    expect(scriptsForLevel("iniciante")).toEqual(["hiragana", "katakana"]);
  });
  it("review contains only hiragana and katakana", () => {
    expect([...scriptsIn(reviewQueue(scriptsForLevel("iniciante")))].sort()).toEqual(["hiragana", "katakana"]);
  });
});

describe("perfil intermediário/avançado", () => {
  it("Aprender adds the kanji tab", () => {
    expect(scriptsForLevel("avancado")).toEqual(["hiragana", "katakana", "kanji"]);
  });
  it("review mixes hiragana, katakana and kanji", () => {
    expect([...scriptsIn(reviewQueue(scriptsForLevel("avancado")))].sort()).toEqual(["hiragana", "kanji", "katakana"]);
  });
});

describe("XP de hoje", () => {
  it("splits today's XP into lessons, review and combo bonus", () => {
    let s = applyLessonComplete(initialState, { correct: 6, total: 6, maxCombo: 6, seconds: 60 });
    s = applyReviewComplete(s, s.srs);
    expect(s.today).toEqual({ lessons: 50, review: 30, combo: 10 });
  });
});
