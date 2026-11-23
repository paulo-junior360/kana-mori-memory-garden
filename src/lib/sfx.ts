/** Tiny synthesized sound effects (no audio files) for lesson feedback. */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function playCorrect() {
  tone(660, 0, 0.12, "triangle");
  tone(990, 0.08, 0.18, "triangle");
}

export function playWrong() {
  tone(220, 0, 0.18, "sawtooth", 0.08);
  tone(165, 0.12, 0.25, "sawtooth", 0.08);
}

export function playCombo() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.22, "triangle", 0.16));
}

export function playFanfare() {
  [392, 523, 659, 784, 659, 1047].forEach((f, i) => tone(f, i * 0.1, 0.28, "triangle", 0.14));
}
