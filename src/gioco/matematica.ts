import type { Calcolo, Domanda, Livello, Materia } from "./tipi";
import { type Rng, intero, scegli } from "./rng";

/** Calcola il risultato di un'operazione. Usato sia dal generatore sia dal test di ricalcolo. */
export function calcola(c: Pick<Calcolo, "op" | "a" | "b">): number {
  switch (c.op) {
    case "+": return c.a + c.b;
    case "-": return c.a - c.b;
    case "*": return c.a * c.b;
    case "/": return c.a / c.b;
  }
}

export function formatta(n: number, unita: string): string {
  return unita ? `${n} ${unita}` : `${n}`;
}

interface Modello {
  chiave: string;
  materia: Materia;
  livello: Livello;
  fatto_id: string | null;
  crea: (rng: Rng) => { testo: string; calcolo: Calcolo; spiegazione: (r: number) => string };
}

// Scene inventate: solo luoghi presenti nella base di fatti, prezzi presentati come ipotesi.
const MODELLI: Modello[] = [
  {
    chiave: "olive", materia: "matematica", livello: 1, fatto_id: null,
    crea: (rng) => {
      const a = intero(rng, 2, 4), b = intero(rng, 2, 3);
      return {
        testo: `Compri ${a} chili di olive. Un chilo costa ${b} euro. Quanto paghi?`,
        calcolo: { op: "*", a, b, unita: "euro" },
        spiegazione: (r) => `${a} volte ${b} fa ${r}. Conto giusto, spesa fatta!`,
      };
    },
  },
  {
    chiave: "taralli", materia: "matematica", livello: 1, fatto_id: null,
    crea: (rng) => {
      const a = intero(rng, 8, 15), b = intero(rng, 2, 6);
      return {
        testo: `Hai ${a} taralli. Ne regali ${b} alla vicina. Quanti te ne restano?`,
        calcolo: { op: "-", a, b, unita: "" },
        spiegazione: (r) => `${a} meno ${b} fa ${r}. E la vicina è contenta!`,
      };
    },
  },
  {
    chiave: "arance", materia: "matematica", livello: 1, fatto_id: null,
    crea: (rng) => {
      const a = intero(rng, 5, 12), b = intero(rng, 3, 8);
      return {
        testo: `In un cesto ci sono ${a} arance. Ne aggiungi ${b}. Quante sono ora?`,
        calcolo: { op: "+", a, b, unita: "" },
        spiegazione: (r) => `${a} più ${b} fa ${r}. Che bel cesto pieno!`,
      };
    },
  },
  {
    chiave: "passeggiata", materia: "matematica", livello: 2, fatto_id: null,
    crea: (rng) => {
      const a = intero(rng, 2, 5) * 5, b = intero(rng, 2, 4) * 5;
      return {
        testo: `Cammini ${a} minuti fino a piazza Regina Elena. Poi altri ${b} minuti in corso Vittorio Emanuele. Quanti minuti in tutto?`,
        calcolo: { op: "+", a, b, unita: "minuti" },
        spiegazione: (r) => `${a} più ${b} fa ${r} minuti. Bella passeggiata!`,
      };
    },
  },
  {
    chiave: "resto", materia: "matematica", livello: 2, fatto_id: null,
    crea: (rng) => {
      const a = scegli(rng, [10, 20]), b = intero(rng, 3, a - 2);
      return {
        testo: `Paghi con ${a} euro. La spesa costa ${b} euro. Quanto ti danno di resto?`,
        calcolo: { op: "-", a, b, unita: "euro" },
        spiegazione: (r) => `${a} meno ${b} fa ${r}. Controlla sempre il resto!`,
      };
    },
  },
  {
    chiave: "bottiglie", materia: "matematica", livello: 2, fatto_id: null,
    crea: (rng) => {
      const a = 6, b = intero(rng, 2, 5);
      return {
        testo: `Una cassa contiene ${a} bottiglie di Primitivo. Compri ${b} casse. Quante bottiglie hai?`,
        calcolo: { op: "*", a, b, unita: "bottiglie" },
        spiegazione: (r) => `${b} casse da ${a} fanno ${r} bottiglie. Salute!`,
      };
    },
  },
  {
    chiave: "nipoti", materia: "matematica", livello: 3, fatto_id: null,
    crea: (rng) => {
      const b = intero(rng, 3, 6), k = intero(rng, 3, 8);
      const a = b * k;
      return {
        testo: `Hai ${a} taralli. Li dividi tra ${b} nipoti in parti uguali. Quanti ne riceve ciascuno?`,
        calcolo: { op: "/", a, b, unita: "" },
        spiegazione: (r) => `${a} diviso ${b} fa ${r}. Nessun nipote resta senza!`,
      };
    },
  },
  {
    chiave: "raccolta", materia: "matematica", livello: 3, fatto_id: null,
    crea: (rng) => {
      const a = intero(rng, 3, 8) * 5, b = intero(rng, 3, 6);
      return {
        testo: `Raccogli ${a} chili di olive al giorno. Lavori per ${b} giorni. Quanti chili raccogli?`,
        calcolo: { op: "*", a, b, unita: "chili" },
        spiegazione: (r) => `${a} per ${b} fa ${r} chili. Che raccolta!`,
      };
    },
  },
  {
    chiave: "santantonio", materia: "tempo", livello: 1, fatto_id: "T01",
    crea: (rng) => {
      const b = intero(rng, 6, 11);
      return {
        testo: `La festa di Sant'Antonio è il 13 giugno. Oggi è il ${b} giugno. Quanti giorni mancano?`,
        calcolo: { op: "-", a: 13, b, unita: "" },
        spiegazione: (r) => `Mancano ${r} giorni. Sant'Antonio è il patrono del paese!`,
      };
    },
  },
  {
    chiave: "festagrande", materia: "tempo", livello: 2, fatto_id: "T02",
    crea: (rng) => {
      const b = intero(rng, 1, 7);
      return {
        testo: `La festa grande comincia l'11 agosto. Oggi è il ${b} agosto. Quanti giorni mancano?`,
        calcolo: { op: "-", a: 11, b, unita: "" },
        spiegazione: (r) => `Mancano ${r} giorni. La festa grande dura 3 giorni!`,
      };
    },
  },
];

export const CHIAVI_MODELLI = MODELLI.map((m) => m.chiave);

function sbagliate(rng: Rng, giusta: number, quante: number, passo: number): number[] {
  const candidati = new Set<number>();
  const scarti = [1, 2, -1, -2, passo, -passo, 3, -3, 2 * passo, 4];
  for (const s of scarti) {
    const v = giusta + s;
    if (v > 0 && v !== giusta) candidati.add(v);
  }
  const elenco = [...candidati];
  const scelte: number[] = [];
  while (scelte.length < quante && elenco.length) {
    const i = Math.floor(rng() * elenco.length);
    scelte.push(elenco.splice(i, 1)[0]);
  }
  return scelte;
}

/** Genera una domanda calcolata dal codice. La risposta giusta è sempre in posizione 0 (poi il gioco mescola). */
export function generaDomanda(rng: Rng, filtro: { livello?: Livello; chiave?: string } = {}): Domanda {
  let candidati = MODELLI;
  if (filtro.chiave) candidati = MODELLI.filter((m) => m.chiave === filtro.chiave);
  else if (filtro.livello) candidati = MODELLI.filter((m) => m.livello === filtro.livello);
  const m = scegli(rng, candidati);
  const { testo, calcolo, spiegazione } = m.crea(rng);
  const r = calcola(calcolo);
  const passo = calcolo.unita === "minuti" ? 5 : r >= 20 ? 5 : 1;
  const nSbagliate = m.livello === 3 ? 3 : 2;
  const risposte = [r, ...sbagliate(rng, r, nSbagliate, passo)].map((n) => formatta(n, calcolo.unita));
  const codice = `${calcolo.a}${calcolo.op === "*" ? "x" : calcolo.op === "/" ? "d" : calcolo.op === "+" ? "p" : "m"}${calcolo.b}`;
  return {
    id: `${m.materia === "tempo" ? "TEM" : "MAT"}-${m.chiave}-${codice}`,
    materia: m.materia,
    livello: m.livello,
    tipo: "scelta",
    stimolo: null,
    domanda: testo,
    risposte,
    corretta: 0,
    spiegazione: spiegazione(r),
    fatto_id: m.fatto_id,
    stato: "attiva",
    calcolo,
  };
}
