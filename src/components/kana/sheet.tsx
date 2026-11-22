import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** Bottom sheet that stays inside the phone frame. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById("app-overlay")), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !target) return null;
  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Fechar" className="absolute inset-0 animate-fade bg-overlay" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[88%] animate-sheet-up overflow-y-auto rounded-t-[2rem] bg-card px-6 pt-3 pb-8 shadow-float"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
        {title ? (
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-display">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>,
    target,
  );
}
