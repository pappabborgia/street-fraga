/**
 * Controllo automatico delle domande: le regole di scrittura della sezione 7.
 * Usato dai test e, più avanti, dalla pagina di gestione.
 */
import type { Domanda, Fatto } from "./tipi";
import obiettivi from "../../content/obiettivi.json";

export const MATERIE = obiettivi.materie as Record<string, { prefisso: string; obiettivo: number; con_fonte: boolean }>;

export const parole = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
export const frasi = (s: string) => s.split(/(?<=[.?!])\s+/).filter((f) => f.trim().length > 0);
export const normalizza = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Numeri da scrivere in cifre ("sei" escluso: è anche il verbo essere)
const NUMERI_IN_LETTERE = /\b(due|tre|quattro|cinque|sette|otto|nove|dieci|undici|dodici|tredici|quindici|venti|trenta|quaranta|cinquanta|cento|mille)\b/i;

export function controllaDomanda(d: Domanda, fatti: Fatto[]): string[] {
  const e: string[] = [];
  const m = MATERIE[d.materia];
  if (!m) return [`materia sconosciuta: ${d.materia}`];
  if (!new RegExp(`^${m.prefisso}-\\d{3}$`).test(d.id)) e.push(`id non valido (atteso ${m.prefisso}-001)`);
  if (![1, 2, 3].includes(d.livello)) e.push("livello non valido");
  if (!["scelta", "vero_falso", "memoria", "sequenza", "intruso"].includes(d.tipo)) e.push("tipo non valido");
  if (!["attiva", "da_rivedere", "disattivata"].includes(d.stato)) e.push("stato non valido");

  // Frasi corte
  const f = frasi(d.domanda);
  if (f.length > 3) e.push("più di 3 frasi nella domanda");
  for (const x of f) if (parole(x) > 12) e.push(`frase oltre 12 parole: "${x}"`);
  if (d.stimolo) {
    const fs = frasi(d.stimolo);
    if (fs.length > 3) e.push("stimolo con più di 3 frasi");
    for (const x of fs) if (parole(x) > 12) e.push(`stimolo: frase oltre 12 parole: "${x}"`);
  }
  if (d.tipo === "memoria" && !d.stimolo) e.push("memoria senza stimolo");
  if (d.tipo !== "memoria" && d.stimolo) e.push("stimolo presente in una domanda non di memoria");

  // Risposte
  const n = d.risposte.length;
  if (d.tipo === "vero_falso") {
    if (n !== 2 || d.risposte[0] !== "Vero" || d.risposte[1] !== "Falso") e.push('vero/falso: risposte ["Vero","Falso"]');
  } else if (d.livello === 3) {
    if (n !== 3 && n !== 4) e.push("livello 3: 3 o 4 risposte");
  } else if (n !== 3) e.push("servono 3 risposte (4 solo al livello 3)");
  if (!Number.isInteger(d.corretta) || d.corretta < 0 || d.corretta >= n) e.push("indice della risposta giusta fuori posto");
  for (const r of d.risposte) {
    if (!r.trim()) e.push("risposta vuota");
    if (parole(r) > 4) e.push(`risposta oltre 4 parole: "${r}"`);
  }
  if (new Set(d.risposte.map(normalizza)).size !== n) e.push("risposte doppie");
  if (d.tipo !== "vero_falso" && n > 0) {
    const lung = d.risposte.map(parole);
    if (Math.max(...lung) - Math.min(...lung) > 2) e.push("risposte di lunghezza troppo diversa");
  }
  if (/tutte le precedenti|nessuna delle|nessuna di queste/i.test(d.risposte.join(" "))) e.push("risposta vietata (tutte/nessuna)");

  // Niente domande al negativo (ammesso solo "non c'entra" per il tipo intruso)
  const senzaIntruso = d.domanda.replace(/non c['’]entra/gi, "");
  if (/\bnon\b/i.test(senzaIntruso)) e.push("domanda al negativo");
  // Numeri in cifre
  for (const t of [d.domanda, ...d.risposte]) if (NUMERI_IN_LETTERE.test(t)) e.push(`numero scritto in lettere: "${t}"`);

  // Spiegazione
  if (!d.spiegazione.trim()) e.push("spiegazione mancante");
  if (parole(d.spiegazione) > 15) e.push("spiegazione oltre 15 parole");
  if (frasi(d.spiegazione).length > 2) e.push("spiegazione troppo lunga (massimo 2 frasi brevi)");

  // Collegamento ai fatti
  if (m.con_fonte && !d.fatto_id) e.push("manca fatto_id (materia con fonte)");
  if (d.fatto_id) {
    const fatto = fatti.find((x) => x.id === d.fatto_id);
    if (!fatto) e.push(`fatto inesistente: ${d.fatto_id}`);
    else {
      if (fatto.da_verificare) e.push(`fatto ${fatto.id} da verificare: non usarlo`);
      if (fatto.affidabilita === "bassa" && d.stato === "attiva") e.push(`fatto ${fatto.id} con affidabilità bassa: stato deve essere da_rivedere`);
    }
  }
  return e;
}

/** Controlli sull'insieme: id unici, niente doppioni, massimo 3 domande per fatto. */
export function controllaInsieme(tutte: Domanda[]): string[] {
  const e: string[] = [];
  const ids = new Map<string, number>();
  const testi = new Map<string, string>();
  const perFatto = new Map<string, number>();
  for (const d of tutte) {
    ids.set(d.id, (ids.get(d.id) ?? 0) + 1);
    const chiave = normalizza(`${d.stimolo ?? ""} ${d.domanda} ${[...d.risposte].sort().join(" ")}`);
    if (testi.has(chiave)) e.push(`doppione: ${d.id} e ${testi.get(chiave)}`);
    else testi.set(chiave, d.id);
    if (d.fatto_id) perFatto.set(d.fatto_id, (perFatto.get(d.fatto_id) ?? 0) + 1);
  }
  for (const [id, k] of ids) if (k > 1) e.push(`id ripetuto: ${id}`);
  for (const [id, k] of perFatto) if (k > 3) e.push(`fatto ${id} usato ${k} volte (massimo 3)`);
  return e;
}
