import type { Domanda, Fatto } from "./tipi";
import fatti from "../../content/fatti.json";
import storia from "../../content/domande/storia.json";
import geografia from "../../content/domande/geografia.json";
import feste from "../../content/domande/feste.json";
import matematica from "../../content/domande/matematica.json";
import parole from "../../content/domande/parole.json";
import memoria from "../../content/domande/memoria.json";
import logica from "../../content/domande/logica.json";
import tempo from "../../content/domande/tempo.json";
import campagna from "../../content/domande/campagna.json";
import dialetto from "../../content/domande/dialetto.json";

export const FATTI = fatti as Fatto[];
export const TUTTE: Domanda[] = [
  storia, geografia, feste, matematica, parole, memoria, logica, tempo, campagna, dialetto,
].flat() as Domanda[];

const affidabili = new Set(
  FATTI.filter((f) => f.affidabilita !== "bassa" && !f.da_verificare).map((f) => f.id),
);

/** Domande in gioco: solo attive e, se legate a un fatto, solo a fatti con affidabilità alta o media. */
export const MAZZO: Domanda[] = TUTTE.filter(
  (d) => d.stato === "attiva" && (d.fatto_id === null || affidabili.has(d.fatto_id)),
);
