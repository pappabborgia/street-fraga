import type { Domanda, Fatto } from "./tipi";
import prova from "../../content/domande/prova.json";
import fatti from "../../content/fatti.json";

export const FATTI = fatti as Fatto[];
const affidabili = new Set(
  FATTI.filter((f) => f.affidabilita !== "bassa" && !f.da_verificare).map((f) => f.id),
);

/** Domande in gioco: solo attive e, se legate a un fatto, solo a fatti con affidabilità alta o media. */
export const MAZZO: Domanda[] = (prova as Domanda[]).filter(
  (d) => d.stato === "attiva" && (d.fatto_id === null || affidabili.has(d.fatto_id)),
);
