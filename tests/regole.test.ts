import { describe, expect, it } from "vitest";
import {
  DANNO_COLPO, DANNO_SPECIALE, ENERGIA_INIZIALE, PUNTI_GIUSTA, PUNTI_SPECIALE,
  adattaLivello, applicaRisposta, mescolaRisposte, nuovoCombattente, partitaFinita, prossimaDomanda, vincitore,
} from "@/gioco/regole";
import { MAZZO } from "@/gioco/domande";
import { creaRng } from "@/gioco/rng";

describe("punteggio e colpi", () => {
  it("risposta giusta: 10 punti e l'avversario perde energia", () => {
    const r = applicaRisposta(nuovoCombattente(), nuovoCombattente(), true);
    expect(r.attaccante.punti).toBe(PUNTI_GIUSTA);
    expect(r.difensore.energia).toBe(ENERGIA_INIZIALE - DANNO_COLPO);
  });

  it("risposta sbagliata: nessun punto tolto, nessun danno", () => {
    let a = nuovoCombattente();
    a = applicaRisposta(a, nuovoCombattente(), true).attaccante;
    const r = applicaRisposta(a, nuovoCombattente(), false);
    expect(r.attaccante.punti).toBe(PUNTI_GIUSTA);
    expect(r.difensore.energia).toBe(ENERGIA_INIZIALE);
    expect(r.attaccante.serie).toBe(0);
  });

  it("3 giuste di fila: colpo speciale e 5 punti in più", () => {
    let a = nuovoCombattente(), d = nuovoCombattente();
    for (let i = 0; i < 2; i++) ({ attaccante: a, difensore: d } = applicaRisposta(a, d, true));
    const r = applicaRisposta(a, d, true);
    expect(r.esito.speciale).toBe(true);
    expect(r.attaccante.punti).toBe(3 * PUNTI_GIUSTA + PUNTI_SPECIALE);
    expect(r.difensore.energia).toBe(ENERGIA_INIZIALE - 2 * DANNO_COLPO - DANNO_SPECIALE);
  });

  it("l'energia non scende sotto zero", () => {
    let a = nuovoCombattente(), d = nuovoCombattente();
    for (let i = 0; i < 20; i++) ({ attaccante: a, difensore: d } = applicaRisposta(a, d, true));
    expect(d.energia).toBe(0);
  });

  it("6 giuste su 10 non bastano per il KO: si decide a energia", () => {
    let a = nuovoCombattente(), d = nuovoCombattente();
    const seq = [true, false, true, false, true, true, false, true, false, true];
    for (const g of seq) ({ attaccante: a, difensore: d } = applicaRisposta(a, d, g));
    expect(d.energia).toBeGreaterThan(0);
  });

  it("vince chi ha più energia; pari se uguale", () => {
    const g = { ...nuovoCombattente(), energia: 40 };
    const c = { ...nuovoCombattente(), energia: 30 };
    expect(vincitore(g, c)).toBe("giocatore");
    expect(vincitore(c, g)).toBe("computer");
    expect(vincitore(g, { ...c, energia: 40 })).toBe("pari");
  });

  it("la partita finisce dopo 10 domande a testa, 11 con lo spareggio, o al KO", () => {
    const g = { ...nuovoCombattente(), risposte: 10 };
    const c = { ...nuovoCombattente(), risposte: 10 };
    expect(partitaFinita(g, c, false)).toBe(true);
    expect(partitaFinita(g, c, true)).toBe(false);
    expect(partitaFinita({ ...g, risposte: 2 }, { ...c, energia: 0, risposte: 2 }, false)).toBe(true);
  });
});

describe("difficoltà che si adatta", () => {
  it("sale dopo 3 giuste di fila e scende dopo 2 sbagliate", () => {
    expect(adattaLivello(1, 3, 0)).toBe(2);
    expect(adattaLivello(2, 2, 0)).toBe(2);
    expect(adattaLivello(3, 3, 0)).toBe(3);
    expect(adattaLivello(2, 0, 2)).toBe(1);
    expect(adattaLivello(1, 0, 2)).toBe(1);
  });
});

describe("scelta e mescolamento delle domande", () => {
  it("la prima domanda della partita è sempre facile", () => {
    for (let s = 0; s < 200; s++) {
      const d = prossimaDomanda(creaRng(s), MAZZO, new Set(), 3, true);
      expect(d.livello).toBe(1);
    }
  });

  it("mescolare non perde la risposta giusta", () => {
    const rng = creaRng(7);
    for (const d of MAZZO) {
      const m = mescolaRisposte(rng, d);
      expect(m.risposte[m.corretta]).toBe(d.risposte[d.corretta]);
      expect([...m.risposte].sort()).toEqual([...d.risposte].sort());
    }
  });

  it("non ripete domande nella stessa partita", () => {
    const rng = creaRng(3);
    const usate = new Set<string>();
    for (let i = 0; i < 22; i++) {
      const d = prossimaDomanda(rng, MAZZO, usate, ((i % 3) + 1) as 1 | 2 | 3, i === 0);
      expect(usate.has(d.id)).toBe(false);
      usate.add(d.id);
    }
  });
});

describe("modalità con il tempo", () => {
  it("se il tempo finisce l'avversario toglie un colpo normale, senza scendere sotto zero", async () => {
    const { colpoPerTempo, DANNO_COLPO, ENERGIA_INIZIALE, nuovoCombattente } = await import("@/gioco/regole");
    expect(colpoPerTempo(nuovoCombattente()).energia).toBe(ENERGIA_INIZIALE - DANNO_COLPO);
    expect(colpoPerTempo({ ...nuovoCombattente(), energia: 5 }).energia).toBe(0);
  });
});

describe("livelli scelti", () => {
  it("più punti con i livelli più difficili: 10, 15, 20 (e bonus 5, 7, 10)", async () => {
    const { PUNTI_PER_LIVELLO } = await import("@/gioco/regole");
    for (const l of [1, 2, 3] as const) {
      let a = nuovoCombattente(), d = nuovoCombattente();
      ({ attaccante: a, difensore: d } = applicaRisposta(a, d, true, l));
      expect(a.punti).toBe(PUNTI_PER_LIVELLO[l].giusta);
      ({ attaccante: a, difensore: d } = applicaRisposta(a, d, true, l));
      ({ attaccante: a, difensore: d } = applicaRisposta(a, d, true, l));
      expect(a.punti).toBe(3 * PUNTI_PER_LIVELLO[l].giusta + PUNTI_PER_LIVELLO[l].speciale);
    }
    expect([1, 2, 3].map((l) => PUNTI_PER_LIVELLO[l as 1 | 2 | 3].giusta)).toEqual([10, 15, 20]);
  });

  it("la difficoltà resta nei limiti del livello scelto", async () => {
    const { DOMANDE_PER_LIVELLO } = await import("@/gioco/regole");
    const f = DOMANDE_PER_LIVELLO[1], d = DOMANDE_PER_LIVELLO[3];
    expect(adattaLivello(2, 3, 0, f.min, f.max)).toBe(2); // facile: mai domande difficili
    expect(adattaLivello(2, 0, 2, d.min, d.max)).toBe(2); // difficile: mai domande facili
    expect(adattaLivello(2, 3, 0, d.min, d.max)).toBe(3);
  });

  it("il punteggio massimo di una partita entra nei limiti del database (500)", async () => {
    const { PUNTI_PER_LIVELLO, bonusVelocita } = await import("@/gioco/regole");
    const max = 11 * (PUNTI_PER_LIVELLO[3].giusta + bonusVelocita(0, 3)!.punti) + 3 * PUNTI_PER_LIVELLO[3].speciale;
    expect(max).toBeLessThanOrEqual(500);
  });
});

describe("bonus velocità", () => {
  it("più veloce = più punti; con calma nessun bonus ma nessun punto tolto", async () => {
    const { bonusVelocita, PUNTI_PER_LIVELLO } = await import("@/gioco/regole");
    expect(bonusVelocita(5, 1)).toEqual({ punti: 5, nome: "Fulmine" });
    expect(bonusVelocita(15, 1)).toEqual({ punti: 3, nome: "Svelto" });
    expect(bonusVelocita(25, 1)).toEqual({ punti: 1, nome: "Pronto" });
    expect(bonusVelocita(45, 1)).toBeNull();
    expect(bonusVelocita(5, 3)!.punti).toBe(10);
    const lento = applicaRisposta(nuovoCombattente(), nuovoCombattente(), true, 2, bonusVelocita(60, 2));
    expect(lento.attaccante.punti).toBe(PUNTI_PER_LIVELLO[2].giusta);
    const veloce = applicaRisposta(nuovoCombattente(), nuovoCombattente(), true, 2, bonusVelocita(3, 2));
    expect(veloce.attaccante.punti).toBeGreaterThan(lento.attaccante.punti);
  });
});
