"use client";
/**
 * Movimenti dei lottatori e degli effetti con le Web Animations (element.animate),
 * con valori già calcolati in pixel: funzionano anche su iPhone e iPad (Safari),
 * dove le variabili CSS dentro i @keyframes non sono affidabili.
 * Regole: ogni animazione dura al massimo 1,5 secondi, niente lampeggi, niente animazioni infinite.
 * Con "riduci movimento" attivo nel dispositivo restano solo dissolvenze.
 */
import { useEffect, useRef } from "react";

export type SceltaMovimenti = "telefono" | "completi" | "ridotti";

export function telefonoChiedeMenoMovimento(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Applica la scelta: mette o toglie la classe "ridotto" su <html>. */
export function applicaMovimenti(scelta: SceltaMovimenti) {
  if (typeof document === "undefined") return;
  const ridotto = scelta === "ridotti" || (scelta === "telefono" && telefonoChiedeMenoMovimento());
  document.documentElement.classList.toggle("ridotto", ridotto);
}

export function riduciMovimento(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains("ridotto");
}

export interface Animazione { kf: Keyframe[]; durata: number; ritardo?: number; easing?: string }

/** Con i movimenti ridotti i lottatori restano fermi e sempre visibili; gli effetti compaiono con una dissolvenza. */
export function anima(el: Element | null | undefined, a: Animazione | null, effetto = false): Animation | null {
  if (!el || !a || typeof (el as HTMLElement).animate !== "function") return null;
  if (riduciMovimento()) {
    if (!effetto) return null;
    return (el as HTMLElement).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: "forwards" });
  }
  return (el as HTMLElement).animate(a.kf, { duration: a.durata, delay: a.ritardo ?? 0, easing: a.easing ?? "ease-in-out", fill: "both" });
}

/** Trasformazione sempre con le stesse funzioni, così le rotazioni da 360° si interpolano bene. */
export const T = (x = 0, yPct = 0, r = 0, sx = 1, sy = 1, sk = 0) =>
  `translate(${x}px, ${yPct}%) rotate(${r}deg) skewX(${sk}deg) scale(${sx}, ${sy})`;

const k = (offset: number, transform: string, extra: Keyframe = {}): Keyframe => ({ offset, transform, ...extra });

export type NomeMossa =
  | "salto" | "capriola" | "carica" | "lancio" | "speciale" | "manca" | "subisce" | "subisce-forte" | "ko" | "stretta"
  | "festa-salto" | "festa-capriola" | "festa-saltello" | "festa-gira" | "festa-siede" | "festa-seduto" | "festa-rialza"
  | "festa-vicini" | "festa-inchino";

/** Movimento del corpo. d = direzione (1 verso destra, -1 verso sinistra), S = distanza del balzo in pixel. */
export function corpo(nome: NomeMossa, d: number, S: number, ritardo = 0): Animazione {
  switch (nome) {
    case "salto": return { durata: 1300, kf: [k(0, T()), k(0.15, T(0, 4, 0, 1.06, 0.86)), k(0.48, T(d * S * 0.55, -42, d * 200)), k(0.66, T(d * S, -3, d * 360)), k(0.76, T(d * S * 0.95, 0, d * 360, 1.05, 0.93)), k(1, T(0, 0, d * 360))] };
    case "capriola": return { durata: 1200, kf: [k(0, T()), k(0.15, T(0, 6, 0, 1, 0.85)), k(0.58, T(d * S, 14, d * 360, 0.82, 0.82)), k(0.7, T(d * S * 0.97, 0, d * 360)), k(1, T(0, 0, d * 360))] };
    case "carica": return { durata: 1100, kf: [k(0, T()), k(0.2, T(-18 * d, 0, 0, 1, 1, 8 * d)), k(0.45, T(d * S, 0, 0, 1, 1, -14 * d)), k(0.62, T(d * S * 0.94)), k(1, T())] };
    case "lancio": return { durata: 1100, kf: [k(0, T()), k(0.28, T(-16 * d, 0, -8 * d)), k(0.42, T(22 * d, 0, 6 * d)), k(1, T())] };
    case "speciale": return { durata: 1500, kf: [k(0, T()), k(0.12, T(0, 5, 0, 1.06, 0.84)), k(0.4, T(d * S * 0.3, -48, d * 360, 1.1, 1.1)), k(0.57, T(d * S * 0.85, -28, d * 720, 1.1, 1.1)), k(0.65, T(d * S, 0, d * 720, 1.06, 0.92)), k(0.76, T(d * S * 0.96, 0, d * 720)), k(1, T(0, 0, d * 720))] };
    case "manca": return { durata: 1400, kf: [k(0, T()), k(0.4, T(d * S * 1.1)), k(0.58, T(d * S * 1.3, 0, 16 * d)), k(0.78, T(d * S * 0.9, 0, -6 * d)), k(1, T())] };
    case "subisce": return { durata: 600, ritardo, easing: "ease-out", kf: [k(0, T()), k(0.35, T(-28 * d, 0, -12 * d)), k(1, T())] };
    case "subisce-forte": return { durata: 550, ritardo, easing: "ease-out", kf: [k(0, T()), k(0.4, T(-50 * d, -16, -28 * d)), k(1, T())] };
    case "ko": return { durata: 1200, ritardo: 500, easing: "ease-in", kf: [k(0, T()), k(1, T(0, 12, -78 * d))] };
    case "stretta": return { durata: 1400, kf: [k(0, T()), k(1, T(d * S * 0.45))] };
    // Festa di fine partita
    case "festa-salto": return { durata: 1400, kf: [k(0, T()), k(0.2, T(0, 5, 0, 1.05, 0.88)), k(0.55, T(0, -40, d * 360)), k(0.8, T(0, 0, d * 360, 1.05, 0.92)), k(1, T(0, 0, d * 360))] };
    case "festa-capriola": return { durata: 1400, kf: [k(0, T()), k(0.5, T(0, 10, -360 * d, 0.85, 0.85)), k(1, T(0, 0, -360 * d))] };
    case "festa-saltello": return { durata: 1400, kf: [k(0, T()), k(0.25, T(0, -8)), k(0.5, T()), k(0.75, T(0, -8)), k(1, T())] };
    case "festa-gira": return { durata: 1400, kf: [k(0, T()), k(0.25, T(0, 0, -12)), k(0.5, T(0, 0, 10)), k(0.75, T(0, 0, -6)), k(1, T())] };
    case "festa-siede": return { durata: 1000, easing: "ease-in", kf: [k(0, T()), k(1, T(0, 14, 0, 1, 0.82))] };
    case "festa-seduto": return { durata: 1, kf: [k(0, T(0, 14, 0, 1, 0.82)), k(1, T(0, 14, 0, 1, 0.82))] };
    case "festa-rialza": return { durata: 1200, easing: "ease-out", kf: [k(0, T(0, 14, 0, 1, 0.82)), k(1, T())] };
    case "festa-vicini": return { durata: 1, kf: [k(0, T(d * S * 0.45)), k(1, T(d * S * 0.45))] };
    case "festa-inchino": return { durata: 1400, kf: [k(0, T(d * S * 0.45)), k(0.45, T(d * S * 0.45, 0, 22 * d)), k(0.6, T(d * S * 0.45, 0, 22 * d)), k(1, T(d * S * 0.45))] };
  }
}

/** Movimento del braccio davanti (gruppo SVG .braccio-av). */
export function braccio(nome: "pugno" | "tiro" | "porgi" | "alza", durata: number): Animazione {
  const B = (x: number, y: number, r: number) => `translate(${x}px, ${y}px) rotate(${r}deg)`;
  switch (nome) {
    case "pugno": return { durata, kf: [k(0, B(0, 0, 0)), k(0.35, B(0, 0, 0)), k(0.5, B(14, -8, -38)), k(0.7, B(14, -8, -38)), k(1, B(0, 0, 0))] };
    case "tiro": return { durata, kf: [k(0, B(0, 0, 0)), k(0.28, B(0, 0, 55)), k(0.42, B(0, 0, -70)), k(1, B(0, 0, 0))] };
    case "porgi": return { durata, kf: [k(0, B(0, 0, 0)), k(1, B(8, 10, -12))] };
    case "alza": return { durata, kf: [k(0, B(0, 0, 0)), k(0.3, B(0, 0, -120)), k(1, B(0, 0, -120))] };
  }
}

/** Contenitore che parte con un'animazione appena compare (gli effetti dei colpi). */
export function Animato({ a, className = "", style, children }: {
  a: Animazione; className?: string; style?: React.CSSProperties; children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const x = anima(ref.current, a, true);
    return () => x?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}
