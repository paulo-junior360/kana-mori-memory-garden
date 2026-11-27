import { describe, expect, it } from "vitest";

import { evaluateDrawingMasks } from "@/lib/write-eval";

const SIZE = 64;

function makeMask(draw: (set: (x: number, y: number) => void) => void): Uint8Array {
  const m = new Uint8Array(SIZE * SIZE);
  draw((x, y) => {
    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) m[y * SIZE + x] = 1;
  });
  return m;
}

/** Simple cross-shaped guide character centered at (32, 32). */
function crossGuide(): Uint8Array {
  return makeMask((set) => {
    for (let i = 16; i <= 48; i++) {
      set(i, 32);
      set(i, 33);
      set(32, i);
      set(33, i);
    }
  });
}

describe("validação de desenho de caracteres", () => {
  const guide = crossGuide();

  it("rejects an empty canvas or a single tiny dot", () => {
    const dot = makeMask((set) => {
      set(32, 32);
      set(33, 32);
    });
    const res = evaluateDrawingMasks(dot, guide, SIZE);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("empty");
  });

  it("rejects an incomplete trace that only draws one small part of the character", () => {
    const partial = makeMask((set) => {
      for (let i = 16; i <= 28; i++) {
        set(i, 32);
        set(i, 33);
      }
    });
    const res = evaluateDrawingMasks(partial, guide, SIZE);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("incomplete");
  });

  it("rejects scribbling over the entire canvas to cheat", () => {
    const scribble = new Uint8Array(SIZE * SIZE).fill(1);
    const res = evaluateDrawingMasks(scribble, guide, SIZE);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("off-target");
  });

  it("rejects drawing in the wrong region of the pad", () => {
    const wrongBox = makeMask((set) => {
      for (let y = 4; y <= 14; y++) {
        for (let x = 4; x <= 14; x++) set(x, y);
      }
    });
    const res = evaluateDrawingMasks(wrongBox, guide, SIZE);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("off-target");
  });

  it("accepts a reasonably accurate human trace with slight offset", () => {
    const trace = makeMask((set) => {
      for (let i = 17; i <= 47; i++) {
        set(i, 34);
        set(31, i);
      }
    });
    const res = evaluateDrawingMasks(trace, guide, SIZE);
    expect(res.ok).toBe(true);
    expect(res.coverage).toBeGreaterThan(0.8);
    expect(res.precision).toBeGreaterThan(0.8);
  });
});
