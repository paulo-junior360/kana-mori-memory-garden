export type WriteEvalResult = {
  ok: boolean;
  coverage: number;
  precision: number;
  reason?: "empty" | "incomplete" | "off-target";
};

const MIN_USER_PIXELS = 8;
const MIN_COVERAGE = 0.55;
const MIN_PRECISION = 0.55;

function dilate(mask: Uint8Array, size: number, radius: number): Uint8Array {
  const out = new Uint8Array(size * size);
  const r2 = radius * radius;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!mask[y * size + x]) continue;
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(size - 1, y + radius);
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(size - 1, x + radius);
      for (let ny = y0; ny <= y1; ny++) {
        const dy = ny - y;
        for (let nx = x0; nx <= x1; nx++) {
          const dx = nx - x;
          if (dx * dx + dy * dy <= r2) {
            out[ny * size + nx] = 1;
          }
        }
      }
    }
  }
  return out;
}

/**
 * Evaluate a user's drawn stroke mask against the reference character mask.
 * Both masks are flattened size×size binary arrays (0 or 1).
 */
export function evaluateDrawingMasks(
  userMask: Uint8Array,
  guideMask: Uint8Array,
  size: number,
  radius = 4,
): WriteEvalResult {
  let userCount = 0;
  let guideCount = 0;
  for (let i = 0; i < size * size; i++) {
    if (userMask[i]) userCount++;
    if (guideMask[i]) guideCount++;
  }

  if (userCount < MIN_USER_PIXELS) {
    return { ok: false, coverage: 0, precision: 0, reason: "empty" };
  }
  if (guideCount === 0) {
    return { ok: true, coverage: 1, precision: 1 };
  }

  const guideHalo = dilate(guideMask, size, radius);
  const userHalo = dilate(userMask, size, radius);

  let covered = 0;
  let onTarget = 0;
  for (let i = 0; i < size * size; i++) {
    if (guideMask[i] && userHalo[i]) covered++;
    if (userMask[i] && guideHalo[i]) onTarget++;
  }

  const coverage = covered / guideCount;
  const precision = onTarget / userCount;

  if (precision < MIN_PRECISION) {
    return { ok: false, coverage, precision, reason: "off-target" };
  }
  if (coverage < MIN_COVERAGE) {
    return { ok: false, coverage, precision, reason: "incomplete" };
  }
  return { ok: true, coverage, precision };
}

function alphaMaskFromCanvas(canvas: HTMLCanvasElement, size: number): Uint8Array {
  const small = document.createElement("canvas");
  small.width = size;
  small.height = size;
  const ctx = small.getContext("2d");
  const mask = new Uint8Array(size * size);
  if (!ctx) return mask;
  ctx.drawImage(canvas, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  for (let i = 0; i < size * size; i++) {
    if ((data[i * 4 + 3] ?? 0) > 24) mask[i] = 1;
  }
  return mask;
}

/**
 * Compare the user's canvas drawing against the target character rendered with the same guide font.
 */
export function evaluateCanvasCharacter(
  userCanvas: HTMLCanvasElement,
  char: string,
  guideElement: HTMLElement | null,
): WriteEvalResult {
  const SIZE = 64;
  const rect = userCanvas.getBoundingClientRect();
  const baseWidth = rect.width || 300;
  const userMask = alphaMaskFromCanvas(userCanvas, SIZE);

  const guideCanvas = document.createElement("canvas");
  guideCanvas.width = SIZE;
  guideCanvas.height = SIZE;
  const gCtx = guideCanvas.getContext("2d");
  if (!gCtx) return { ok: true, coverage: 1, precision: 1 };

  const cs = guideElement ? getComputedStyle(guideElement) : null;
  const rawSize = cs ? parseFloat(cs.fontSize) || 180 : 180;
  const fontSize = (rawSize / baseWidth) * SIZE;
  const fontWeight = cs?.fontWeight || "400";
  const fontFamily = cs?.fontFamily || "serif";

  gCtx.fillStyle = "#000000";
  gCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  gCtx.textAlign = "center";
  gCtx.textBaseline = "alphabetic";

  const metrics = gCtx.measureText(char);
  const ascent = metrics.actualBoundingBoxAscent || 0;
  const descent = metrics.actualBoundingBoxDescent || 0;
  if (ascent > 0 || descent > 0) {
    const x = SIZE / 2 + ((metrics.actualBoundingBoxLeft || 0) - (metrics.actualBoundingBoxRight || 0)) / 2;
    const y = SIZE / 2 + (ascent - descent) / 2;
    gCtx.fillText(char, x, y);
  } else {
    gCtx.textBaseline = "middle";
    gCtx.fillText(char, SIZE / 2, SIZE / 2);
  }

  const guideMask = alphaMaskFromCanvas(guideCanvas, SIZE);
  return evaluateDrawingMasks(userMask, guideMask, SIZE, 4);
}
