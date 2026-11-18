export type Grandezza = "normale" | "grande" | "moltoGrande";

export interface Impostazioni {
  testo: Grandezza;
  dueTocchi: boolean;
  leggiSempre: boolean;
  suoni: boolean;
  musica: boolean;
}

export const PREDEFINITE: Impostazioni = {
  testo: "normale",
  dueTocchi: true,
  leggiSempre: false,
  suoni: true,
  musica: true,
};

export const SCALA: Record<Grandezza, string> = {
  normale: "100%",
  grande: "118.75%",
  moltoGrande: "137.5%",
};

const CHIAVE = "street-fraga-impostazioni";

export function carica(): Impostazioni {
  try {
    const s = localStorage.getItem(CHIAVE);
    if (s) return { ...PREDEFINITE, ...JSON.parse(s) };
  } catch {}
  return PREDEFINITE;
}

export function salva(i: Impostazioni) {
  try { localStorage.setItem(CHIAVE, JSON.stringify(i)); } catch {}
}
