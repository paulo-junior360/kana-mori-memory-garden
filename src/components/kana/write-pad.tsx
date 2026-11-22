import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/** Finger/mouse drawing area over a faded guide character. */
export function WritePad({
  char,
  revealed,
  clearSignal,
  onStroke,
}: {
  char: string;
  revealed: boolean;
  clearSignal: number;
  onStroke: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(8, rect.width / 26);
    ctx.strokeStyle = getComputedStyle(canvas).color;
  }, [clearSignal]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] rounded-2xl border-2 border-foreground/80 bg-card">
      <span aria-hidden className="absolute inset-y-3 left-1/2 border-l-2 border-dashed border-border" />
      <span aria-hidden className="absolute inset-x-3 top-1/2 border-t-2 border-dashed border-border" />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center font-display text-[180px] leading-none transition-all duration-500 select-none",
          revealed ? "scale-100 text-foreground" : "text-foreground/15",
        )}
      >
        {char}
      </span>
      <canvas
        key={clearSignal}
        ref={canvasRef}
        aria-label={`Área para escrever ${char}`}
        className={cn(
          "absolute inset-0 size-full touch-none text-link transition-opacity duration-300",
          revealed && "pointer-events-none opacity-0",
        )}
        onPointerDown={(e) => {
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          const p = point(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 0.1, p.y + 0.1);
          ctx.stroke();
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          const p = point(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          if (!drawing.current) return;
          drawing.current = false;
          onStroke();
        }}
        onPointerLeave={() => {
          if (drawing.current) {
            drawing.current = false;
            onStroke();
          }
        }}
      />
    </div>
  );
}
