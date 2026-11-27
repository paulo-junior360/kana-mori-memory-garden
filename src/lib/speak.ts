/** Pronounce Japanese text with the device voice, when available. */
let cachedJaVoice: SpeechSynthesisVoice | null = null;

function findJapaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return cachedJaVoice;
  cachedJaVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ja")) ?? null;
  return cachedJaVoice;
}

export function speakJapanese(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;

  const run = () => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.85;
      u.volume = 1;
      const voice = findJapaneseVoice();
      if (voice) u.voice = voice;
      synth.speak(u);
    } catch {
      // ignore speech synthesis failures on unsupported platforms
    }
  };

  if (synth.speaking || synth.pending) {
    synth.cancel();
    window.setTimeout(run, 30);
  } else {
    run();
  }
}
