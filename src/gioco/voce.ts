/** Lettura ad alta voce con la voce italiana del dispositivo. */
export function voceItaliana(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voci = window.speechSynthesis.getVoices();
  return voci.find((v) => v.lang.toLowerCase().startsWith("it")) ?? null;
}

export function leggi(testo: string) {
  const voce = voceItaliana();
  if (!voce) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(testo);
  u.voice = voce;
  u.lang = voce.lang;
  u.rate = 0.9; // un po' più lento del normale
  window.speechSynthesis.speak(u);
}

export function zitto() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
