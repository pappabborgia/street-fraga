/**
 * Urli dei lottatori: a ogni mossa chi attacca grida (suono fatto con Web Audio, nessuna registrazione)
 * e la stessa parola compare in un fumetto, perché tutto quello che si sente deve anche vedersi.
 * Solo esclamazioni italiane di tutti i giorni o versi: nessuna parola di dialetto inventata.
 * "Hajde!" è albanese ("dai!"), adatto ad Arben.
 */
export type Vocale = "a" | "o" | "e" | "u";

export interface Voce {
  /** frequenza di partenza della voce in Hz: più bassa per i signori, più alta per la nonna */
  altezza: number;
  vocale: Vocale;
  /** 1 = sale alla fine (domanda allegra), -1 = scende (grido di sforzo) */
  andamento: 1 | -1;
  urli: [string, string];
  urloSpeciale: string;
}

const VOCI: Record<string, Voce> = {
  nonna: { altezza: 330, vocale: "e", andamento: 1, urli: ["Tiè!", "Oplà!"], urloSpeciale: "Mo' vedi!" },
  contadino: { altezza: 140, vocale: "o", andamento: -1, urli: ["Oh-issa!", "Hop!"], urloSpeciale: "Ooooh-issa!" },
  tamarro: { altezza: 185, vocale: "a", andamento: 1, urli: ["Iaaa!", "Uè!"], urloSpeciale: "Iaaaaah!" },
  ricco: { altezza: 125, vocale: "o", andamento: -1, urli: ["Ohohoh!", "Prego!"], urloSpeciale: "Permesso!" },
  arrangiato: { altezza: 200, vocale: "a", andamento: 1, urli: ["Hoplà!", "Eccomi!"], urloSpeciale: "Ci penso io!" },
  svizzero: { altezza: 165, vocale: "u", andamento: 1, urli: ["Iuhuu!", "Puntuale!"], urloSpeciale: "Iu-huuu!" },
  vignaiolo: { altezza: 155, vocale: "a", andamento: -1, urli: ["Alè!", "Ooooh!"], urloSpeciale: "Alè alè!" },
  banda: { altezza: 175, vocale: "a", andamento: 1, urli: ["Pa-pà!", "Attacca!"], urloSpeciale: "Pa-pa-pààà!" },
  parroco: { altezza: 135, vocale: "o", andamento: -1, urli: ["Forza!", "Oplà!"], urloSpeciale: "Coraggio!" },
  albanese: { altezza: 170, vocale: "e", andamento: -1, urli: ["Hajde!", "Iaaa!"], urloSpeciale: "Hajde hajde!" },
};

const NORMALE: Voce = { altezza: 170, vocale: "a", andamento: -1, urli: ["Iaaa!", "Hop!"], urloSpeciale: "Iaaaaah!" };

export const voceDi = (id: string): Voce => VOCI[id] ?? NORMALE;

/** Che cosa grida il lottatore: alterna i due urli, e ne ha uno suo per il colpo speciale. */
export function urloDi(id: string, numero: number, speciale: boolean): string {
  const v = voceDi(id);
  return speciale ? v.urloSpeciale : v.urli[numero % 2];
}
