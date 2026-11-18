import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import fatti from "../content/fatti.json";
import obiettivi from "../content/obiettivi.json";
import type { Domanda, Fatto } from "@/gioco/tipi";
import { MATERIE, controllaDomanda, controllaInsieme } from "@/gioco/controllo";
import { calcola, formatta } from "@/gioco/matematica";

const FATTI = fatti as Fatto[];
const cartella = path.resolve(import.meta.dirname, "../content/domande");
const PER_MATERIA: Record<string, Domanda[]> = {};
for (const m of Object.keys(MATERIE)) {
  PER_MATERIA[m] = JSON.parse(fs.readFileSync(path.join(cartella, `${m}.json`), "utf8"));
}
const TUTTE = Object.values(PER_MATERIA).flat();

// Ogni materia ha il suo gruppo di test: `npx vitest run -t parole` controlla solo quella.
for (const [materia, domande] of Object.entries(PER_MATERIA)) {
  describe(`materia ${materia}`, () => {
    it("ogni domanda rispetta le regole di scrittura", () => {
      const errori = domande.flatMap((d) => controllaDomanda(d, FATTI).map((x) => `${d.id}: ${x}`));
      const fuoriMateria = domande.filter((d) => d.materia !== materia).map((d) => `${d.id}: materia ${d.materia} nel file ${materia}`);
      expect([...errori, ...fuoriMateria]).toEqual([]);
    });
    it("id unici, nessun doppione, massimo 3 domande per fatto", () => {
      expect(controllaInsieme(domande)).toEqual([]);
    });
  });
}

describe("tutte le domande insieme", () => {
  it("id unici, nessun doppione tra materie, massimo 3 domande per fatto", () => {
    expect(controllaInsieme(TUTTE)).toEqual([]);
  });

  it("matematica: ogni risposta giusta è ricalcolata", () => {
    for (const d of PER_MATERIA.matematica.concat(PER_MATERIA.tempo)) {
      if (!d.calcolo) continue;
      const c = d.calcolo;
      const atteso = c.op === "+" ? c.a + c.b : c.op === "-" ? c.a - c.b : c.op === "*" ? c.a * c.b : c.a / c.b;
      expect(Number.isInteger(atteso), d.id).toBe(true);
      expect(calcola(c), d.id).toBe(atteso);
      expect(d.risposte[d.corretta], d.id).toBe(formatta(atteso, c.unita));
    }
  });

  it("calendario: ogni risposta giusta è ricalcolata con il calendario vero", () => {
    const giorni = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
    const mesi = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
    const cap = (x: string) => x[0].toUpperCase() + x.slice(1);
    for (const d of PER_MATERIA.tempo) {
      const v = d.verifica;
      if (!v) continue;
      let atteso: string;
      if (v.tipo === "giorno_dopo") atteso = cap(giorni[(v.giorno + v.n) % 7]);
      else if (v.tipo === "mese_dopo") atteso = cap(mesi[(v.mese + 1) % 12]);
      else if (v.tipo === "giorni_mese") atteso = `${new Date(Date.UTC(2025, v.mese + 1, 0)).getUTCDate()} giorni`;
      else if (v.tipo === "ora") atteso = `Alle ${v.h + v.n}`;
      else {
        const x = new Date(Date.UTC(2025, v.mese, v.g + v.n));
        atteso = `${x.getUTCDate()} ${mesi[x.getUTCMonth()]}`;
      }
      // il giorno nel testo della domanda deve essere quello usato per il calcolo
      if (v.tipo === "giorno_dopo") expect(d.domanda, d.id).toContain(`Oggi è ${giorni[v.giorno]}`);
      expect(d.risposte[d.corretta], d.id).toBe(atteso);
    }
  });

  it("i fatti hanno id unici, fonti web, data e affidabilità", () => {
    expect(new Set(FATTI.map((f) => f.id)).size).toBe(FATTI.length);
    for (const f of FATTI) {
      expect(f.fonti.length, f.id).toBeGreaterThan(0);
      for (const u of f.fonti) expect(u, f.id).toMatch(/^https:\/\//);
      expect(f.consultato_il).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["alta", "media", "bassa"]).toContain(f.affidabilita);
    }
  });

  it("la torre del castello non ha 1587 tra le risposte", () => {
    for (const d of TUTTE.filter((x) => x.fatto_id === "S05")) expect(d.risposte).not.toContain("1587");
  });

  it("quantità per materia e per livello (40% facili, 40% medie, 20% difficili, con tolleranza)", () => {
    const problemi: string[] = [];
    let totale = 0;
    for (const [m, info] of Object.entries(MATERIE)) {
      const ds = PER_MATERIA[m].filter((d) => d.stato !== "disattivata");
      totale += ds.length;
      if (info.con_fonte ? ds.length > info.obiettivo : ds.length !== info.obiettivo)
        problemi.push(`${m}: ${ds.length} domande, obiettivo ${info.obiettivo}`);
      if (ds.length >= 10) {
        const q = (l: number) => ds.filter((d) => d.livello === l).length / ds.length;
        if (q(1) < 0.3 || q(1) > 0.5) problemi.push(`${m}: facili ${(q(1) * 100).toFixed(0)}%`);
        if (q(2) < 0.3 || q(2) > 0.5) problemi.push(`${m}: medie ${(q(2) * 100).toFixed(0)}%`);
        if (q(3) < 0.1 || q(3) > 0.3) problemi.push(`${m}: difficili ${(q(3) * 100).toFixed(0)}%`);
      }
    }
    if (totale !== obiettivi.totale) problemi.push(`totale ${totale}, obiettivo ${obiettivi.totale}`);
    expect(problemi).toEqual([]);
  });
});
