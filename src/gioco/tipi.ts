export type Materia =
  | "storia" | "geografia" | "feste" | "matematica" | "parole"
  | "memoria" | "logica" | "tempo" | "campagna" | "dialetto";

export type TipoDomanda = "scelta" | "vero_falso" | "memoria" | "sequenza" | "intruso";
export type Livello = 1 | 2 | 3;
export type Stato = "attiva" | "da_rivedere" | "disattivata";

export interface Calcolo {
  op: "+" | "-" | "*" | "/";
  a: number;
  b: number;
  unita: string; // es. "euro", "" per numeri semplici
}

export interface Domanda {
  id: string;
  materia: Materia;
  livello: Livello;
  tipo: TipoDomanda;
  stimolo: string | null;
  domanda: string;
  risposte: string[];
  corretta: number;
  spiegazione: string;
  fatto_id: string | null;
  stato: Stato;
  /** Solo per le domande generate dal codice (matematica, tempo). */
  calcolo?: Calcolo;
  /** Domande di calendario generate dal codice: dati per ricalcolare la risposta nei test. */
  verifica?: Verifica;
}

export interface Fatto {
  id: string;
  testo: string;
  fonti: string[];
  affidabilita: "alta" | "media" | "bassa";
  consultato_il: string;
  note: string;
  da_verificare?: boolean;
}

export type Verifica =
  | { tipo: "giorno_dopo"; giorno: number; n: number }
  | { tipo: "mese_dopo"; mese: number }
  | { tipo: "giorni_mese"; mese: number }
  | { tipo: "ora"; h: number; n: number }
  | { tipo: "data_dopo"; g: number; mese: number; n: number };
