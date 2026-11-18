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
  musica: true, // scelta del gestore: musica accesa di default, a volume basso
  movimenti: "completi", // scelta del gestore: le mosse si vedono sempre, anche con "riduci movimento" sul telefono
};

export const SCALA: Record<Grandezza, string> = {
  normale: "100%",
  grande: "118.75%",
  moltoGrande: "137.5%",
};

const CHIAVE = "street-fraga-impostazioni";
const VERSIONE = 4; // v2: movimenti "completi" di default; v4: musica accesa di default (a volume basso)

export function carica(): Impostazioni {
  try {
    const s = localStorage.getItem(CHIAVE);
    if (s) {
      const salvate = JSON.parse(s);
      // impostazioni salvate prima della versione 2: il vecchio valore predefinito dei movimenti non vale più
      if ((salvate.versione ?? 1) < 2 && salvate.movimenti === "telefono") delete salvate.movimenti;
      // prima della versione 4 il valore predefinito della musica era diverso: si torna al nuovo
      if ((salvate.versione ?? 1) < 4) delete salvate.musica;
      return { ...PREDEFINITE, ...salvate };
    }
  } catch {}
  return PREDEFINITE;
}

export function salva(i: Impostazioni) {
  try { localStorage.setItem(CHIAVE, JSON.stringify({ ...i, versione: VERSIONE })); } catch {}
}
