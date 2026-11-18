export type Grandezza = "normale" | "grande" | "moltoGrande";

export interface Impostazioni {
  testo: Grandezza;
  dueTocchi: boolean;
  leggiSempre: boolean;
  suoni: boolean;
  musica: boolean;
  movimenti: "telefono" | "completi" | "ridotti";
}

export const PREDEFINITE: Impostazioni = {
  testo: "normale",
  dueTocchi: true,
  leggiSempre: false,
  suoni: true,
  musica: true,
  movimenti: "completi", // scelta del gestore: le mosse si vedono sempre, anche con "riduci movimento" sul telefono
};

export const SCALA: Record<Grandezza, string> = {
  normale: "100%",
  grande: "118.75%",
  moltoGrande: "137.5%",
};

const CHIAVE = "street-fraga-impostazioni";
const VERSIONE = 2; // dalla versione 2 i movimenti sono "completi" di default

export function carica(): Impostazioni {
  try {
    const s = localStorage.getItem(CHIAVE);
    if (s) {
      const salvate = JSON.parse(s);
      // impostazioni salvate prima della versione 2: il vecchio valore predefinito dei movimenti non vale più
      if (salvate.versione !== VERSIONE && salvate.movimenti === "telefono") delete salvate.movimenti;
      return { ...PREDEFINITE, ...salvate };
    }
  } catch {}
  return PREDEFINITE;
}

export function salva(i: Impostazioni) {
  try { localStorage.setItem(CHIAVE, JSON.stringify({ ...i, versione: VERSIONE })); } catch {}
}
