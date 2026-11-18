import { describe, expect, it } from "vitest";
import prova from "../content/domande/prova.json";
import fatti from "../content/fatti.json";
import type { Domanda, Fatto } from "@/gioco/tipi";
import { CHIAVI_MODELLI, calcola, formatta, generaDomanda } from "@/gioco/matematica";
import { creaRng } from "@/gioco/rng";

const DOMANDE = prova as Domanda[];
const FATTI = fatti as Fatto[];
const MATERIE_CON_FONTE = ["storia", "geografia", "feste"];

const parole = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const frasi = (s: string) => s.split(/(?<=[.?!])\s+/).filter((f) => f.trim().length > 0);

function controllaDomanda(d: Domanda) {
  const errori: string[] = [];
  const f = frasi(d.domanda);
  if (f.length > 3) errori.push("più di 3 frasi");
  for (const x of f) if (parole(x) > 12) errori.push(`frase troppo lunga: "${x}"`);
  if (d.stimolo) for (const x of frasi(d.stimolo)) if (parole(x) > 12) errori.push(`stimolo troppo lungo: "${x}"`);
  for (const r of d.risposte) if (parole(r) > 4) errori.push(`risposta troppo lunga: "${r}"`);
  if (parole(d.spiegazione) > 15) errori.push("spiegazione oltre 15 parole");
  if (frasi(d.spiegazione).length > 2) errori.push("spiegazione: troppe frasi");
  if (/\bNON\b/.test(d.domanda)) errori.push("domanda al negativo");
  if (/tutte le precedenti|nessuna delle/i.test(d.risposte.join(" "))) errori.push("risposta vietata");
  const n = d.risposte.length;
  if (d.tipo === "vero_falso") {
    if (n !== 2 || d.risposte[0] !== "Vero" || d.risposte[1] !== "Falso") errori.push("vero/falso malformato");
  } else if (d.livello === 3) {
    if (n !== 3 && n !== 4) errori.push("livello 3: 3 o 4 risposte");
  } else if (n !== 3) errori.push("servono 3 risposte (4 solo al livello difficile)");
  if (d.corretta < 0 || d.corretta >= n) errori.push("indice della risposta giusta fuori posto");
  if (new Set(d.risposte.map((r) => r.toLowerCase())).size !== n) errori.push("risposte doppie");
  if (d.tipo === "memoria" && !d.stimolo) errori.push("memoria senza stimolo");
  if (![1, 2, 3].includes(d.livello)) errori.push("livello non valido");
  return errori;
}

describe("domande scritte a mano", () => {
  it("hanno id unici", () => {
    const ids = DOMANDE.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("non hanno doppioni nel testo", () => {
    const testi = DOMANDE.map((d) => d.domanda.toLowerCase());
    expect(new Set(testi).size).toBe(testi.length);
  });

  it.each(DOMANDE.map((d) => [d.id, d] as const))("%s rispetta le regole di scrittura", (_id, d) => {
    expect(controllaDomanda(d)).toEqual([]);
  });

  it("le materie con fonte sono collegate a un fatto esistente con fonte", () => {
    for (const d of DOMANDE.filter((x) => MATERIE_CON_FONTE.includes(x.materia))) {
      const f = FATTI.find((x) => x.id === d.fatto_id);
      expect(f, `${d.id} → ${d.fatto_id}`).toBeDefined();
      expect(f!.fonti.length).toBeGreaterThan(0);
      if (f!.affidabilita === "bassa") expect(d.stato).toBe("da_rivedere");
    }
  });

  it("al massimo 3 domande per fatto", () => {
    const conta = new Map<string, number>();
    for (const d of DOMANDE) if (d.fatto_id) conta.set(d.fatto_id, (conta.get(d.fatto_id) ?? 0) + 1);
    for (const [id, n] of conta) expect(n, id).toBeLessThanOrEqual(3);
  });

  it("la torre del castello non ha 1587 tra le risposte", () => {
    for (const d of DOMANDE.filter((x) => x.fatto_id === "S05")) expect(d.risposte).not.toContain("1587");
  });

  it("c'è almeno una domanda facile per iniziare", () => {
    expect(DOMANDE.some((d) => d.livello === 1 && d.stato === "attiva")).toBe(true);
  });
});

describe("fatti", () => {
  it("hanno id unici, fonti web, data e affidabilità", () => {
    expect(new Set(FATTI.map((f) => f.id)).size).toBe(FATTI.length);
    for (const f of FATTI) {
      expect(f.fonti.length, f.id).toBeGreaterThan(0);
      for (const u of f.fonti) expect(u, f.id).toMatch(/^https:\/\//);
      expect(f.consultato_il).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["alta", "media", "bassa"]).toContain(f.affidabilita);
    }
  });
});

describe("matematica generata dal codice", () => {
  it("ricalcola tutte le risposte (2000 domande, tutti i modelli)", () => {
    const rng = creaRng(42);
    for (let i = 0; i < 2000; i++) {
      const chiave = CHIAVI_MODELLI[i % CHIAVI_MODELLI.length];
      const d = generaDomanda(rng, { chiave });
      const c = d.calcolo!;
      // ricalcolo indipendente
      const atteso = c.op === "+" ? c.a + c.b : c.op === "-" ? c.a - c.b : c.op === "*" ? c.a * c.b : c.a / c.b;
      expect(Number.isInteger(atteso), d.id).toBe(true);
      expect(atteso, d.id).toBeGreaterThan(0);
      expect(calcola(c)).toBe(atteso);
      expect(d.risposte[d.corretta]).toBe(formatta(atteso, c.unita));
      // il numero della risposta giusta compare nel testo della spiegazione
      expect(d.spiegazione).toContain(String(atteso));
      // una sola risposta giusta
      expect(d.risposte.filter((r) => r === formatta(atteso, c.unita)).length).toBe(1);
      expect(controllaDomanda(d), d.id).toEqual([]);
    }
  });
});
