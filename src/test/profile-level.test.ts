import { describe, expect, it } from "vitest";

import { buildUnitQuestions, getItem, getUnit, reviewQueue } from "@/data/kana";
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

describe("fila de revisão manual e lições por unidade", () => {
  it("includes manually saved items only when their script matches the profile level", () => {
    const beginner = reviewQueue(scriptsForLevel("iniciante"), ["h-a", "j-山"]);
    expect(beginner.some((e) => e.id === "h-a" && e.manual)).toBe(true);
    expect(beginner.some((e) => e.id === "j-山")).toBe(false);

    const advanced = reviewQueue(scriptsForLevel("avancado"), ["h-a", "j-山"]);
    expect(advanced.some((e) => e.id === "j-山" && e.manual)).toBe(true);
  });

  it("does not duplicate items already in the automatic review pool", () => {
    const queue = reviewQueue(scriptsForLevel("iniciante"), ["h-nu", "h-a"]);
    expect(queue.filter((e) => e.id === "h-nu")).toHaveLength(1);
  });

  it("covers every character in a unit across all 4 exercise variations with unique options", () => {
    const cases = [
      ["hiragana", "h-u1"],
      ["katakana", "k-u1"],
      ["kanji", "j-u3"],
    ] as const;

    for (const [script, unitId] of cases) {
      const unit = getUnit(script, unitId)!;
      const questions = buildUnitQuestions(script, unit);
      expect(questions).toHaveLength(unit.items.length * 4);

      for (const item of unit.items) {
        const forItem = questions.filter((q) => q.itemId === item.id);
        const kinds = forItem.map((q) => (q.kind === "write" ? "write" : q.prompt)).sort();
        expect(kinds).toEqual(["image", "kana", "romaji", "write"]);
      }

      for (const q of questions) {
        if (q.kind === "choice") {
          expect(new Set(q.options).size).toBe(4);
          expect(q.options).toContain(q.answer);
        }
      }
    }
  });
});
