/** Generatore pseudo-casuale con seme (mulberry32): stesse partite riproducibili nei test. */
export type Rng = () => number;

export function creaRng(seme: number): Rng {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function intero(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function scegli<T>(rng: Rng, elenco: readonly T[]): T {
  return elenco[Math.floor(rng() * elenco.length)];
}

export function mescola<T>(rng: Rng, elenco: readonly T[]): T[] {
  const a = [...elenco];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
