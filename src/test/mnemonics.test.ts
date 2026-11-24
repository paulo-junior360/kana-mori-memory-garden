import { describe, expect, it } from "vitest";

import { allItems, getItem } from "@/data/kana";

// Words rejected by the user: mnemonics must be in Portuguese, not English.
const ENGLISH = ["key", "keg", "kebab", "noodle", "nu-dles", "wafer", "rapper", "yak", "ketchup", "neko", "no!", "hi!"];

describe("mnemônicos em português", () => {
  it("き uses kiwi, not key", () => {
    expect(getItem("h-ki").mnemonic.toLowerCase()).toContain("kiwi");
  });

  it("no mnemonic uses the rejected English words", () => {
    const offenders = allItems.filter((i) => {
      const text = i.mnemonic.toLowerCase();
      return ENGLISH.some((w) => new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, "u").test(text));
    });
    expect(offenders.map((o) => `${o.char}: ${o.mnemonic}`)).toEqual([]);
  });
});
