import type { Domanda, Livello, Verifica } from "./tipi";
import { type Rng, intero, mescola } from "./rng";
import { ilGiorno } from "./matematica";

/** Domande di calendario calcolate dal codice. Le risposte sono ricalcolate in modo indipendente nei test. */
export const GIORNI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
export const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const GIORNI_NEL_MESE = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // anno non bisestile

const maiuscola = (s: string) => s[0].toUpperCase() + s.slice(1);

export function risolvi(v: Verifica): string {
  switch (v.tipo) {
    case "giorno_dopo": return maiuscola(GIORNI[(((v.giorno + v.n) % 7) + 7) % 7]);
    case "mese_dopo": return maiuscola(MESI[(v.mese + 1) % 12]);
    case "giorni_mese": return `${GIORNI_NEL_MESE[v.mese]} giorni`;
    case "ora": return `Alle ${v.h + v.n}`;
    case "data_dopo": {
      let g = v.g + v.n, m = v.mese;
      while (g > GIORNI_NEL_MESE[m]) { g -= GIORNI_NEL_MESE[m]; m = (m + 1) % 12; }
      return `${g} ${MESI[m]}`;
    }
  }
}

function sbagliate(rng: Rng, v: Verifica, quante: number): string[] {
  const giusta = risolvi(v);
  const candidati = new Set<string>();
  const varia = (w: Verifica) => { const r = risolvi(w); if (r !== giusta) candidati.add(r); };
  switch (v.tipo) {
    case "giorno_dopo": for (const d of [-1, 1, 2, -2]) if (v.n + d > 0) varia({ ...v, n: v.n + d }); break;
    case "mese_dopo": for (const d of [-2, 1, 2]) varia({ ...v, mese: (v.mese + d + 12) % 12 }); break;
    case "giorni_mese": for (const x of ["28 giorni", "29 giorni", "30 giorni", "31 giorni"]) if (x !== giusta) candidati.add(x); break;
    case "ora": for (const d of [-1, 1, 2, -2]) varia({ ...v, n: v.n + d }); break;
    case "data_dopo": for (const d of [-1, 1, 2, -2]) if (v.n + d > 0) varia({ ...v, n: v.n + d }); break;
  }
  return mescola(rng, [...candidati]).slice(0, quante);
}

interface Modello { chiave: string; livello: Livello; crea: (rng: Rng) => { testo: string; v: Verifica; spiegazione: (r: string) => string } }

export const MODELLI_CALENDARIO: Modello[] = [
  {
    chiave: "domani", livello: 1,
    crea: (rng) => {
      const giorno = intero(rng, 0, 6);
      return {
        testo: `Oggi è ${GIORNI[giorno]}. Che giorno è domani?`,
        v: { tipo: "giorno_dopo", giorno, n: 1 },
        spiegazione: (r) => `Dopo ${GIORNI[giorno]} viene ${r.toLowerCase()}. La settimana gira sempre uguale!`,
      };
    },
  },
  {
    chiave: "mese", livello: 1,
    crea: (rng) => {
      const mese = intero(rng, 0, 11);
      return {
        testo: `Che mese viene dopo ${MESI[mese]}?`,
        v: { tipo: "mese_dopo", mese },
        spiegazione: (r) => `Dopo ${MESI[mese]} arriva ${r.toLowerCase()}.`,
      };
    },
  },
  {
    chiave: "tra-giorni", livello: 2,
    crea: (rng) => {
      const giorno = intero(rng, 0, 6), n = intero(rng, 2, 5);
      return {
        testo: `Oggi è ${GIORNI[giorno]}. Che giorno sarà tra ${n} giorni?`,
        v: { tipo: "giorno_dopo", giorno, n },
        spiegazione: (r) => `Contando ${n} giorni da ${GIORNI[giorno]} si arriva a ${r.toLowerCase()}.`,
      };
    },
  },
  {
    chiave: "giorni-mese", livello: 2,
    crea: (rng) => {
      const mese = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11][intero(rng, 0, 10)]; // niente febbraio
      return {
        testo: `Quanti giorni ha il mese di ${MESI[mese]}?`,
        v: { tipo: "giorni_mese", mese },
        spiegazione: (r) => `${maiuscola(MESI[mese])} ha ${r}. Si possono contare sulle nocche!`,
      };
    },
  },
  {
    chiave: "pranzo", livello: 2,
    crea: (rng) => {
      const h = intero(rng, 9, 11), n = intero(rng, 2, 4);
      return {
        testo: `Sono le ${h} del mattino. Il pranzo è tra ${n} ore. A che ora si pranza?`,
        v: { tipo: "ora", h, n },
        spiegazione: (r) => `${h} più ${n} fa ${h + n}: si pranza ${r.toLowerCase()}. Buon appetito!`,
      };
    },
  },
  {
    chiave: "data", livello: 3,
    crea: (rng) => {
      const mese = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10][intero(rng, 0, 9)];
      const g = intero(rng, 24, 28), n = intero(rng, 5, 9);
      return {
        testo: `Oggi è il ${g} ${MESI[mese]}. Che data sarà tra ${n} giorni?`,
        v: { tipo: "data_dopo", g, mese, n },
        spiegazione: (r) => `${maiuscola(MESI[mese])} finisce presto: tra ${n} giorni sarà ${ilGiorno(Number(r.split(" ")[0]))} ${r.split(" ")[1]}.`,
      };
    },
  },
  {
    chiave: "tra-tanti-giorni", livello: 3,
    crea: (rng) => {
      const giorno = intero(rng, 0, 6), n = intero(rng, 8, 13);
      return {
        testo: `Oggi è ${GIORNI[giorno]}. Che giorno sarà tra ${n} giorni?`,
        v: { tipo: "giorno_dopo", giorno, n },
        spiegazione: (r) => `Ogni 7 giorni torna lo stesso giorno: sarà ${r.toLowerCase()}.`,
      };
    },
  },
];

export function generaCalendario(rng: Rng, chiave: string): Domanda {
  const m = MODELLI_CALENDARIO.find((x) => x.chiave === chiave)!;
  const { testo, v, spiegazione } = m.crea(rng);
  const giusta = risolvi(v);
  const n = m.livello === 3 ? 3 : 2;
  return {
    id: "TEM-000", materia: "tempo", livello: m.livello, tipo: "scelta", stimolo: null,
    domanda: testo, risposte: [giusta, ...sbagliate(rng, v, n)], corretta: 0,
    spiegazione: spiegazione(giusta), fatto_id: null, stato: "attiva", verifica: v,
  };
}
