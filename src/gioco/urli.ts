/**
 * Urli dei lottatori: a ogni mossa la parola gridata da chi attacca compare in un fumetto
 * (solo scritta: le voci fatte al computer sono state tolte per scelta del gestore).
 * Solo esclamazioni italiane di tutti i giorni o versi: nessuna parola di dialetto inventata.
 * "Hajde!" è albanese ("dai!"), adatto ad Arben.
 */
export interface Voce {
  urli: [string, string];
  urloSpeciale: string;
}

const VOCI: Record<string, Voce> = {
  nonna: { urli: ["Tiè!", "Oplà!"], urloSpeciale: "Mo' vedi!" },
  contadino: { urli: ["Oh-issa!", "Hop!"], urloSpeciale: "Ooooh-issa!" },
  tamarro: { urli: ["Iaaa!", "Uè!"], urloSpeciale: "Iaaaaah!" },
  ricco: { urli: ["Ohohoh!", "Prego!"], urloSpeciale: "Permesso!" },
  arrangiato: { urli: ["Hoplà!", "Eccomi!"], urloSpeciale: "Ci penso io!" },
  svizzero: { urli: ["Iuhuu!", "Puntuale!"], urloSpeciale: "Iu-huuu!" },
  vignaiolo: { urli: ["Alè!", "Ooooh!"], urloSpeciale: "Alè alè!" },
  banda: { urli: ["Pa-pà!", "Attacca!"], urloSpeciale: "Pa-pa-pààà!" },
  parroco: { urli: ["Forza!", "Oplà!"], urloSpeciale: "Coraggio!" },
  albanese: { urli: ["Hajde!", "Iaaa!"], urloSpeciale: "Hajde hajde!" },
};

const NORMALE: Voce = { urli: ["Iaaa!", "Hop!"], urloSpeciale: "Iaaaaah!" };

export const voceDi = (id: string): Voce => VOCI[id] ?? NORMALE;

/** Che cosa grida il lottatore: alterna i due urli, e ne ha uno suo per il colpo speciale. */
export function urloDi(id: string, numero: number, speciale: boolean): string {
  const v = voceDi(id);
  return speciale ? v.urloSpeciale : v.urli[numero % 2];
}
