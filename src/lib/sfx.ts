/** Synthesized Web Audio sound effects (no external audio files) for lesson feedback. */
let ctx: AudioContext | null = null;
let listenersBound = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    if (!ctx || ctx.state === "closed") {
      ctx = new Ctor();
    }
    return ctx;
  } catch {
    return null;
  }
}

/** Unlock the AudioContext on the first user interaction so browser autoplay rules never mute SFX. */
export function unlockAudio() {
  const a = getAudioContext();
  if (a && a.state === "suspended") {
    void a.resume().catch(() => {});
  }
}

if (typeof window !== "undefined" && !listenersBound) {
  listenersBound = true;
  const prime = () => {
    unlockAudio();
  };
  window.addEventListener("pointerdown", prime, { passive: true });
  window.addEventListener("keydown", prime, { passive: true });
}

type Note = { freq: number; start: number; dur: number; type?: OscillatorType; vol?: number };

function playNotes(notes: Note[]) {
  const a = getAudioContext();
  if (!a) return;

  const schedule = () => {
    const base = a.currentTime + 0.01;
    for (const { freq, start, dur, type = "triangle", vol = 0.28 } of notes) {
      try {
        const t = base + start;
        const osc = a.createOscillator();
        const gain = a.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(a.destination);
        osc.start(t);
        osc.stop(t + dur + 0.04);
      } catch {
        // ignore audio scheduling errors in restricted environments
      }
    }
  };

  if (a.state === "running") {
    schedule();
  } else {
    void a
      .resume()
      .then(schedule)
      .catch(() => {});
  }
}

export function playCorrect() {
  playNotes([
    { freq: 587.33, start: 0, dur: 0.13, type: "triangle", vol: 0.28 },
    { freq: 880, start: 0.08, dur: 0.22, type: "triangle", vol: 0.3 },
  ]);
}

export function playWrong() {
  playNotes([
    { freq: 240, start: 0, dur: 0.18, type: "sawtooth", vol: 0.16 },
    { freq: 175, start: 0.12, dur: 0.26, type: "sawtooth", vol: 0.16 },
  ]);
}

export function playCombo() {
  playNotes([
    { freq: 523.25, start: 0, dur: 0.18, type: "triangle", vol: 0.26 },
    { freq: 659.25, start: 0.07, dur: 0.18, type: "triangle", vol: 0.26 },
    { freq: 783.99, start: 0.14, dur: 0.2, type: "triangle", vol: 0.28 },
    { freq: 1046.5, start: 0.21, dur: 0.32, type: "triangle", vol: 0.3 },
    { freq: 1318.5, start: 0.28, dur: 0.35, type: "sine", vol: 0.22 },
  ]);
}

export function playFanfare() {
  playNotes([
    { freq: 392, start: 0, dur: 0.2, type: "triangle", vol: 0.24 },
    { freq: 523.25, start: 0.09, dur: 0.2, type: "triangle", vol: 0.25 },
    { freq: 659.25, start: 0.18, dur: 0.2, type: "triangle", vol: 0.26 },
    { freq: 783.99, start: 0.27, dur: 0.22, type: "triangle", vol: 0.28 },
    { freq: 659.25, start: 0.38, dur: 0.16, type: "triangle", vol: 0.24 },
    { freq: 1046.5, start: 0.48, dur: 0.42, type: "triangle", vol: 0.3 },
  ]);
}
