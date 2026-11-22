export type Rating = "errei" | "dificil" | "bom" | "facil";

export const MAX_BOX = 5;

/** Days until the next review for each box. Box 0 = relearn in 10 minutes. */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;

export function nextBox(box: number, rating: Rating): number {
  switch (rating) {
    case "errei":
      return 0;
    case "dificil":
      return Math.max(1, box);
    case "bom":
      return Math.min(MAX_BOX, box + 1);
    case "facil":
      return Math.min(MAX_BOX, box + 2);
  }
}

export function intervalLabel(box: number): string {
  const days = BOX_INTERVAL_DAYS[Math.max(0, Math.min(MAX_BOX, box))] ?? 0;
  if (days === 0) return "10 min";
  if (days === 1) return "1 dia";
  return `${days} dias`;
}
