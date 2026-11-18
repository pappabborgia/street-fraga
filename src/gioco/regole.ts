import type { Domanda, Livello, Materia } from "./tipi";
import { type Rng, mescola } from "./rng";
import { generaDomanda } from "./matematica";

/*
 * Numeri del combattimento, regolati per una partita di 5-8 minuti:
 * 10 domande a testa. Con 6-7 risposte giuste su 10 non si va KO:
 * si va a energia. Con 9-10 giuste si può mandare l'altro a zero.
 */
export const ENERGIA_INIZIALE = 100;
export const DOMANDE_PER_GIOCATORE = 10;
export const DANNO_COLPO = 12;
export const DANNO_SPECIALE = 20;
export const PUNTI_GIUSTA = 10;
export const PUNTI_SPECIALE = 5;

/** Il livello scelto cambia le domande e i punti per ogni risposta giusta. */
export const PUNTI_PER_LIVELLO: Record<Livello, { giusta: number; speciale: number }> = {
  1: { giusta: 10, speciale: 5 },
  2: { giusta: 15, speciale: 7 },
  3: { giusta: 20, speciale: 10 },
};
/** Livelli di domanda ammessi per ogni livello scelto, e da quale si parte dopo la prima domanda (sempre facile). */
export const DOMANDE_PER_LIVELLO: Record<Livello, { min: Livello; max: Livello; partenza: Livello }> = {
  1: { min: 1, max: 2, partenza: 1 },
  2: { min: 1, max: 3, partenza: 2 },
  3: { min: 2, max: 3, partenza: 3 },
};
export const SERIE_PER_SPECIALE = 3;
/** Solo nella modalità facoltativa "Con il tempo". */
export const SECONDI_PER_RISPOSTA = 45;

/** Probabilità che il computer risponda giusto, per livello scelto. */
export const BRAVURA_COMPUTER: Record<Livello, number> = { 1: 0.45, 2: 0.6, 3: 0.75 };

export interface Combattente {
  energia: number;
  punti: number;
  serie: number; // risposte giuste di fila
  giuste: number;
  risposte: number; // domande affrontate
}

export const nuovoCombattente = (): Combattente => ({
  energia: ENERGIA_INIZIALE, punti: 0, serie: 0, giuste: 0, risposte: 0,
});

export interface EsitoColpo {
  giusta: boolean;
  speciale: boolean;
  danno: number;
  punti: number;
  /** Bonus velocità già compreso in "punti". */
  bonus?: Bonus | null;
}

/**
 * Bonus velocità: più in fretta si risponde giusto, più punti in più.
 * È solo un regalo: chi risponde con calma prende comunque tutti i punti della risposta giusta.
 */
export const FASCE_VELOCITA = [
  { entro: 10, quota: 0.5, nome: "Fulmine" },
  { entro: 20, quota: 0.3, nome: "Svelto" },
  { entro: 30, quota: 0.1, nome: "Pronto" },
] as const;
export interface Bonus { punti: number; nome: string }

export function bonusVelocita(secondi: number, livelloScelto: Livello): Bonus | null {
  const f = FASCE_VELOCITA.find((x) => secondi <= x.entro);
  if (!f) return null;
  return { punti: Math.max(1, Math.round(PUNTI_PER_LIVELLO[livelloScelto].giusta * f.quota)), nome: f.nome };
}

/** Applica una risposta: chi risponde è `attaccante`, chi subisce è `difensore`. */
export function applicaRisposta(
  attaccante: Combattente,
  difensore: Combattente,
  giusta: boolean,
  livelloScelto: Livello = 1,
  bonus: Bonus | null = null,
): { attaccante: Combattente; difensore: Combattente; esito: EsitoColpo } {
  if (!giusta) {
    return {
      attaccante: { ...attaccante, serie: 0, risposte: attaccante.risposte + 1 },
      difensore,
      esito: { giusta: false, speciale: false, danno: 0, punti: 0 },
    };
  }
  const serie = attaccante.serie + 1;
  const speciale = serie % SERIE_PER_SPECIALE === 0;
  const danno = speciale ? DANNO_SPECIALE : DANNO_COLPO;
  const { giusta: pg, speciale: ps } = PUNTI_PER_LIVELLO[livelloScelto];
  const punti = pg + (speciale ? ps : 0) + (bonus?.punti ?? 0);
  return {
    attaccante: {
      ...attaccante,
      serie,
      punti: attaccante.punti + punti,
      giuste: attaccante.giuste + 1,
      risposte: attaccante.risposte + 1,
    },
    difensore: { ...difensore, energia: Math.max(0, difensore.energia - danno) },
    esito: { giusta: true, speciale, danno, punti, bonus },
  };
}

/** Tempo scaduto: l'avversario ne approfitta con un colpo normale (senza punti per lui). */
export function colpoPerTempo(difensore: Combattente): Combattente {
  return { ...difensore, energia: Math.max(0, difensore.energia - DANNO_COLPO) };
}

export type Vincitore = "giocatore" | "computer" | "pari";

export function vincitore(g: Combattente, c: Combattente): Vincitore {
  if (g.energia === 0 && c.energia > 0) return "computer";
  if (c.energia === 0 && g.energia > 0) return "giocatore";
  if (g.energia > c.energia) return "giocatore";
  if (c.energia > g.energia) return "computer";
  return "pari";
}

export function partitaFinita(g: Combattente, c: Combattente, spareggio: boolean): boolean {
  if (g.energia === 0 || c.energia === 0) return true;
  const limite = DOMANDE_PER_GIOCATORE + (spareggio ? 1 : 0);
  return g.risposte >= limite && c.risposte >= limite;
}

/** Difficoltà che si adatta con dolcezza: sale dopo 3 giuste di fila, scende dopo 2 sbagliate di fila. */
export function adattaLivello(livello: Livello, giusteDiFila: number, sbagliateDiFila: number, min: Livello = 1, max: Livello = 3): Livello {
  if (giusteDiFila > 0 && giusteDiFila % 3 === 0 && livello < max) return (livello + 1) as Livello;
  if (sbagliateDiFila > 0 && sbagliateDiFila % 2 === 0 && livello > min) return (livello - 1) as Livello;
  return livello;
}

/** Mescola le risposte mantenendo traccia di quella giusta. */
export function mescolaRisposte(rng: Rng, d: Domanda): Domanda {
  if (d.tipo === "vero_falso") return d; // "Vero" resta sempre prima di "Falso"
  const indici = mescola(rng, d.risposte.map((_, i) => i));
  return {
    ...d,
    risposte: indici.map((i) => d.risposte[i]),
    corretta: indici.indexOf(d.corretta),
  };
}

/**
 * Sceglie la prossima domanda. La prima della partita è sempre facile.
 * Prende dal mazzo una domanda del livello giusto non ancora usata;
 * se non ce ne sono, genera una domanda di calcolo dello stesso livello.
 */
export function prossimaDomanda(
  rng: Rng,
  mazzo: Domanda[],
  usate: Set<string>,
  livello: Livello,
  primaDellaPartita: boolean,
  materia?: Materia,
): Domanda {
  // Una materia richiesta (es. la domanda di dialetto) va bene a qualunque livello, preferendo quello giusto
  if (materia) {
    const della = mazzo.filter((d) => d.stato === "attiva" && d.materia === materia && !usate.has(d.id));
    const stesso = della.filter((d) => d.livello === livello);
    const scelta = (stesso.length ? stesso : della);
    if (scelta.length) return mescolaRisposte(rng, scelta[Math.floor(rng() * scelta.length)]);
  }
  const liv: Livello = primaDellaPartita ? 1 : livello;
  const disponibili = mazzo.filter((d) => d.stato === "attiva" && d.livello === liv && !usate.has(d.id) && d.materia !== "dialetto");
  const usaCalcolo = disponibili.length === 0;
  let d: Domanda;
  if (usaCalcolo) {
    let tentativi = 0;
    do {
      d = generaDomanda(rng, { livello: liv });
      tentativi++;
    } while (usate.has(d.id) && tentativi < 20);
  } else {
    d = disponibili[Math.floor(rng() * disponibili.length)];
  }
  return mescolaRisposte(rng, d);
}
