/**
 * Genera le domande di matematica e di calendario con il codice, mai a mente.
 * Uso: npx tsx scripts/genera-calcoli.ts
 */
import fs from "node:fs";
import path from "node:path";
import { creaRng, mescola } from "../src/gioco/rng";
import { generaDomanda } from "../src/gioco/matematica";
import { generaCalendario } from "../src/gioco/calendario";
import type { Domanda, Livello } from "../src/gioco/tipi";

const rng = creaRng(20261118);
const cartella = path.resolve(import.meta.dirname, "../content/domande");

function unica(visti: Set<string>, crea: () => Domanda): Domanda {
  for (let i = 0; i < 500; i++) {
    const d = crea();
    if (!visti.has(d.domanda)) { visti.add(d.domanda); return d; }
  }
  throw new Error("Troppi doppioni: servono più modelli");
}

/** La risposta giusta non sta sempre al primo posto (il gioco mescola comunque). */
function sposta(d: Domanda): Domanda {
  if (d.tipo === "vero_falso") return d;
  const ordine = mescola(rng, d.risposte.map((_, i) => i));
  return { ...d, risposte: ordine.map((i) => d.risposte[i]), corretta: ordine.indexOf(d.corretta) };
}

// ---- Matematica: 90 domande (36 facili, 36 medie, 18 difficili) ----
const visti = new Set<string>();
const mat: Domanda[] = [];
for (const [livello, quante] of [[1, 36], [2, 36], [3, 18]] as [Livello, number][]) {
  for (let i = 0; i < quante; i++) mat.push(unica(visti, () => generaDomanda(rng, { livello })));
}
const matematica = mat.filter((d) => d.materia === "matematica");
if (matematica.length !== 90) throw new Error("Modelli di livello 1 producono domande di tempo: separare");
matematica.forEach((d, i) => { d.id = `MAT-${String(i + 1).padStart(3, "0")}`; });

// ---- Tempo: 40 domande (16 facili, 16 medie, 8 difficili) ----
const piano: [string, number][] = [
  ["santantonio", 1], ["natale", 5], ["domani", 5], ["mese", 5],
  ["tra-giorni", 6], ["giorni-mese", 5], ["pranzo", 5],
  ["data", 4], ["tra-tanti-giorni", 4],
];
const tem: Domanda[] = [];
for (const [chiave, quante] of piano) {
  for (let i = 0; i < quante; i++) {
    tem.push(unica(visti, () => (chiave === "santantonio" || chiave === "natale" ? generaDomanda(rng, { chiave }) : generaCalendario(rng, chiave))));
  }
}
tem.forEach((d, i) => { d.id = `TEM-${String(i + 1).padStart(3, "0")}`; });

fs.writeFileSync(path.join(cartella, "matematica.json"), JSON.stringify(matematica.map(sposta), null, 2) + "\n");
fs.writeFileSync(path.join(cartella, "tempo.json"), JSON.stringify(tem.map(sposta), null, 2) + "\n");
console.log(`matematica: ${matematica.length}, tempo: ${tem.length}`);
