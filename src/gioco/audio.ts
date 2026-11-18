/**
 * Musica e suoni, tutti generati dal browser con Web Audio (nessun file esterno).
 * Musica: arrangiamenti elettronici originali di brani di Mozart (pubblico dominio).
 */

type Nota = [string, number]; // [nome nota o "R" per pausa, durata in sedicesimi]

const SEMITONI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function frequenza(nome: string): number {
  const m = /^([A-G])(#|b)?(\d)$/.exec(nome);
  if (!m) throw new Error(`Nota sconosciuta: ${nome}`);
  let s = SEMITONI[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  s += (Number(m[3]) + 1) * 12; // numero MIDI
  return 440 * Math.pow(2, (s - 69) / 12);
}

// ---------- Rondò alla turca (K. 331), riduzione per il combattimento ----------
const TURCA_A: Nota[] = [
  ["B4", 1], ["A4", 1], ["G#4", 1], ["A4", 1],
  ["C5", 2], ["R", 2], ["D5", 1], ["C5", 1], ["B4", 1], ["C5", 1],
  ["E5", 2], ["R", 2], ["F5", 1], ["E5", 1], ["D#5", 1], ["E5", 1],
  ["B5", 1], ["A5", 1], ["G#5", 1], ["A5", 1], ["B5", 1], ["A5", 1], ["G#5", 1], ["A5", 1],
  ["C6", 4], ["A5", 2], ["C6", 2],
  ["B5", 2], ["A5", 2], ["G5", 2], ["A5", 2],
  ["B5", 2], ["A5", 2], ["G5", 2], ["A5", 2],
  ["B5", 2], ["A5", 2], ["G5", 2], ["F#5", 2],
  ["E5", 4],
];
const TURCA_B: Nota[] = [
  ["E5", 1], ["F5", 1],
  ["G5", 2], ["G5", 2], ["A5", 1], ["G5", 1], ["F5", 1], ["E5", 1],
  ["D5", 4], ["E5", 1], ["F5", 1],
  ["G5", 2], ["G5", 2], ["A5", 1], ["G5", 1], ["F5", 1], ["E5", 1],
  ["D5", 4], ["C5", 1], ["D5", 1],
  ["E5", 2], ["E5", 2], ["F5", 1], ["E5", 1], ["D5", 1], ["C5", 1],
  ["B4", 4], ["C5", 1], ["D5", 1],
  ["E5", 2], ["E5", 2], ["F5", 1], ["E5", 1], ["D5", 1], ["C5", 1],
  ["B4", 2], ["R", 2],
];
// Basso: una fondamentale per battuta (2/4 = 8 sedicesimi), suonata "um-pa".
const TURCA_BASSO_A = ["A2", "A2", "A2", "A2", "E2", "E2", "E2", "A2"];
const TURCA_BASSO_B = ["C3", "G2", "C3", "G2", "A2", "E2", "A2", "E2"];

// ---------- Piccola serenata notturna (K. 525), per i menu ----------
const SERENATA: Nota[] = [
  ["G4", 4], ["R", 2], ["D4", 2], ["G4", 4], ["R", 2], ["D4", 2],
  ["G4", 2], ["D4", 2], ["G4", 2], ["B4", 2], ["D5", 8],
  ["C5", 4], ["R", 2], ["A4", 2], ["C5", 4], ["R", 2], ["A4", 2],
  ["C5", 2], ["A4", 2], ["F#4", 2], ["A4", 2], ["D4", 8],
  ["G4", 2], ["G4", 2], ["B4", 2], ["A4", 2], ["G4", 2], ["G4", 2], ["F#4", 2], ["F#4", 2],
  ["A4", 2], ["C5", 2], ["F#4", 2], ["A4", 2], ["G4", 4], ["R", 4],
];
const SERENATA_BASSO = ["G2", "G2", "D2", "D2", "G2", "D2"]; // 4/4 = 16 sedicesimi

interface Evento { t: number; f: number; d: number; voce: "melodia" | "basso" | "colpo" }

function componi(melodia: Nota[], basso: string[], battuta: number, attacco: number): { eventi: Evento[]; durata: number } {
  const eventi: Evento[] = [];
  let t = 0;
  for (const [n, d] of melodia) {
    if (n !== "R") eventi.push({ t, f: frequenza(n), d, voce: "melodia" });
    t += d;
  }
  const durata = t;
  // basso a ottavi alterni fondamentale / quinta sopra
  for (let b = 0; b < basso.length; b++) {
    const inizio = attacco + b * battuta;
    const radice = frequenza(basso[b]);
    for (let k = 0; k < battuta; k += 2) {
      if (inizio + k >= durata) break;
      const f = k % 4 === 0 ? radice : radice * 1.5;
      eventi.push({ t: inizio + k, f, d: 1.5, voce: "basso" });
      if (k % 4 === 0) eventi.push({ t: inizio + k, f: 0, d: 1, voce: "colpo" });
    }
  }
  return { eventi, durata };
}

const BRANI = {
  lotta: (() => {
    const a = componi([...TURCA_A, ...TURCA_A], [...TURCA_BASSO_A, ...TURCA_BASSO_A], 8, 4);
    const b = componi(TURCA_B, TURCA_BASSO_B, 8, 2);
    const eventi = [...a.eventi, ...b.eventi.map((e) => ({ ...e, t: e.t + a.durata }))];
    return { eventi, durata: a.durata + b.durata, sedicesimo: 0.115 };
  })(),
  menu: (() => {
    const s = componi(SERENATA, SERENATA_BASSO, 16, 0);
    return { ...s, sedicesimo: 0.13 };
  })(),
};

export type Brano = keyof typeof BRANI;

class Suonatore {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private busMusica: GainNode | null = null;
  private busEffetti: GainNode | null = null;
  private rumore: AudioBuffer | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private brano: Brano | null = null;
  private inizio = 0;
  private prossimo = 0; // indice del giro
  private programmatiFinoA = 0;
  musicaAttiva = true;
  suoniAttivi = true;

  /** Va chiamato dopo un tocco del giocatore (i browser lo richiedono). */
  sblocca() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.busMusica = this.ctx.createGain();
      this.busMusica.gain.value = 0.5; // volume medio
      this.busMusica.connect(this.master);
      this.busEffetti = this.ctx.createGain();
      this.busEffetti.gain.value = 0.7;
      this.busEffetti.connect(this.master);
      const len = this.ctx.sampleRate * 0.5;
      this.rumore = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.rumore.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  get pronto() { return !!this.ctx; }

  suona(brano: Brano) {
    if (this.brano === brano && this.timer) return;
    this.ferma();
    this.brano = brano;
    if (!this.musicaAttiva || !this.ctx) return;
    this.inizio = this.ctx.currentTime + 0.1;
    this.prossimo = 0;
    this.programmatiFinoA = 0;
    this.timer = setInterval(() => this.programma(), 100);
    this.programma();
  }

  /** Brano richiesto, anche se la musica è spenta (serve per riprenderlo). */
  get branoCorrente() { return this.brano; }

  ferma() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.busMusica && this.ctx) {
      // sfuma via le note già programmate
      const g = this.busMusica.gain;
      g.cancelScheduledValues(this.ctx.currentTime);
      g.setValueAtTime(g.value, this.ctx.currentTime);
      g.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
      const nuovo = this.ctx.createGain();
      nuovo.gain.value = 0.5;
      nuovo.connect(this.master!);
      const vecchio = this.busMusica;
      setTimeout(() => vecchio.disconnect(), 300);
      this.busMusica = nuovo;
    }
  }

  impostaMusica(attiva: boolean) {
    this.musicaAttiva = attiva;
    const b = this.brano;
    if (!attiva) { this.ferma(); this.brano = b; }
    else if (b) { this.brano = null; this.suona(b); }
  }

  private programma() {
    if (!this.ctx || !this.brano) return;
    const { eventi, durata, sedicesimo } = BRANI[this.brano];
    const giro = durata * sedicesimo;
    const orizzonte = this.ctx.currentTime + 0.4;
    while (this.inizio + this.prossimo * giro < orizzonte) {
      const base = this.inizio + this.prossimo * giro;
      for (const e of eventi) {
        const quando = base + e.t * sedicesimo;
        if (quando < this.ctx.currentTime - 0.01) continue;
        this.nota(e, quando, e.d * sedicesimo);
      }
      this.prossimo++;
    }
  }

  private nota(e: Evento, quando: number, dur: number) {
    const ctx = this.ctx!;
    const bus = this.busMusica!;
    if (e.voce === "colpo") {
      const src = ctx.createBufferSource();
      src.buffer = this.rumore;
      const filtro = ctx.createBiquadFilter();
      filtro.type = "highpass";
      filtro.frequency.value = 6000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.05, quando);
      g.gain.exponentialRampToValueAtTime(0.001, quando + 0.05);
      src.connect(filtro).connect(g).connect(bus);
      src.start(quando);
      src.stop(quando + 0.06);
      return;
    }
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = e.voce === "melodia" ? "square" : "triangle";
    osc.frequency.value = e.f;
    const vol = e.voce === "melodia" ? 0.07 : 0.16;
    g.gain.setValueAtTime(0, quando);
    g.gain.linearRampToValueAtTime(vol, quando + 0.01);
    g.gain.setValueAtTime(vol, quando + dur * 0.7);
    g.gain.linearRampToValueAtTime(0, quando + dur * 0.95);
    osc.connect(g).connect(bus);
    osc.start(quando);
    osc.stop(quando + dur);
  }

  // ---------- Effetti ----------
  private tono(f1: number, f2: number, durata: number, tipo: OscillatorType, vol: number, ritardo = 0) {
    if (!this.ctx || !this.suoniAttivi) return;
    const t = this.ctx.currentTime + ritardo;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + durata);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + durata);
    osc.connect(g).connect(this.busEffetti!);
    osc.start(t);
    osc.stop(t + durata + 0.02);
  }

  private botta(ritardo = 0, vol = 0.5) {
    if (!this.ctx || !this.suoniAttivi) return;
    const t = this.ctx.currentTime + ritardo;
    const src = this.ctx.createBufferSource();
    src.buffer = this.rumore;
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 1200;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    src.connect(filtro).connect(g).connect(this.busEffetti!);
    src.start(t);
    src.stop(t + 0.2);
    this.tono(160, 50, 0.2, "sine", vol, ritardo);
  }

  /** Fruscio d'aria (salti, lanci). */
  fruscio(ritardo = 0, durata = 0.35) {
    if (!this.ctx || !this.suoniAttivi) return;
    const t = this.ctx.currentTime + ritardo;
    const src = this.ctx.createBufferSource();
    src.buffer = this.rumore;
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.Q.value = 2;
    filtro.frequency.setValueAtTime(400, t);
    filtro.frequency.exponentialRampToValueAtTime(2400, t + durata);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + durata * 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, t + durata);
    src.connect(filtro).connect(g).connect(this.busEffetti!);
    src.start(t);
    src.stop(t + durata + 0.05);
  }
  /** Colpo normale: fruscio e botta al momento dell'impatto. */
  colpo(momento = 0.55) {
    this.fruscio(Math.max(0, momento - 0.4));
    this.botta(momento);
  }
  speciale(momento = 0.95) {
    [523, 659, 784, 1047].forEach((f, i) => this.tono(f, f, 0.12, "square", 0.12, i * 0.08));
    this.fruscio(0.2, 0.6);
    this.botta(momento, 0.8);
    this.botta(momento + 0.18, 0.5);
  }
  manca() { this.tono(500, 110, 0.6, "sine", 0.3, 0.5); }
  giusto() { this.tono(784, 784, 0.12, "square", 0.1); this.tono(1047, 1047, 0.2, "square", 0.1, 0.12); }
  sbagliato() { this.tono(392, 392, 0.15, "triangle", 0.2); this.tono(330, 330, 0.25, "triangle", 0.2, 0.15); }
  /** Trombone comico: tre note che scendono, per chi perde (con affetto). */
  trombone() {
    [392, 370, 349].forEach((f, i) => this.tono(f, f * 0.98, 0.4, "sawtooth", 0.08, i * 0.45));
    this.tono(330, 220, 1.2, "sawtooth", 0.08, 1.35);
  }
  /** Fuochi d'artificio: tre botti morbidi. */
  fuochi() {
    [0, 0.25, 0.5].forEach((r) => { this.tono(900, 300, 0.3, "sine", 0.1, r); this.botta(r + 0.25, 0.25); });
  }
  vittoria() { [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tono(f, f, 0.18, "square", 0.1, i * 0.16)); }
}

export const audio = new Suonatore();
