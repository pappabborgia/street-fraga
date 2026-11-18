/**
 * Rapporto sulle domande: quantità per materia e livello, fatti usati, domande da rivedere.
 * Uso: npx tsx scripts/rapporto.ts  (scrive docs/rapporto-domande.md)
 */
import fs from "node:fs";
import path from "node:path";
import obiettivi from "../content/obiettivi.json";
import fatti from "../content/fatti.json";
import type { Domanda, Fatto } from "../src/gioco/tipi";

const radice = path.resolve(import.meta.dirname, "..");
const F = fatti as Fatto[];
const materie = Object.keys(obiettivi.materie) as (keyof typeof obiettivi.materie)[];
const tutte: Domanda[] = materie.flatMap((m) => JSON.parse(fs.readFileSync(path.join(radice, `content/domande/${m}.json`), "utf8")));

const r: string[] = ["# Rapporto sulle domande", "", `Generato da \`scripts/rapporto.ts\`.`, ""];
r.push("## Quantità", "", "| Materia | Obiettivo iniziale | Domande | Facili | Medie | Difficili | Attive | Da rivedere |", "|---|---|---|---|---|---|---|---|");
const iniziali: Record<string, number> = { storia: 50, geografia: 50, feste: 50, matematica: 90, parole: 70, memoria: 60, logica: 60, tempo: 40, campagna: 30 };
let tot = 0;
for (const m of materie) {
  const ds = tutte.filter((d) => d.materia === m);
  tot += ds.length;
  const l = (n: number) => ds.filter((d) => d.livello === n).length;
  r.push(`| ${m} | ${iniziali[m]} | ${ds.length} | ${l(1)} | ${l(2)} | ${l(3)} | ${ds.filter((d) => d.stato === "attiva").length} | ${ds.filter((d) => d.stato === "da_rivedere").length} |`);
}
r.push(`| **Totale** | 500 | **${tot}** | | | | ${tutte.filter((d) => d.stato === "attiva").length} | ${tutte.filter((d) => d.stato === "da_rivedere").length} |`, "");
r.push("Storia, geografia e feste hanno meno domande del previsto perché i fatti verificati non bastano: la differenza è compensata con matematica, logica e memoria, come chiede il documento di progetto.", "");

const usati = new Set(tutte.map((d) => d.fatto_id).filter(Boolean));
r.push("## Fatti", "", `- Fatti nella base: ${F.length} (alta ${F.filter((f) => f.affidabilita === "alta").length}, media ${F.filter((f) => f.affidabilita === "media").length}, bassa ${F.filter((f) => f.affidabilita === "bassa").length}).`);
r.push(`- Fatti da verificare (non usati): ${F.filter((f) => f.da_verificare).map((f) => f.id).join(", ")}.`);
r.push(`- Fatti usati da almeno una domanda: ${usati.size}.`);
const nonUsati = F.filter((f) => !usati.has(f.id) && !f.da_verificare).map((f) => f.id);
r.push(`- Fatti utilizzabili ma non usati: ${nonUsati.join(", ") || "nessuno"}.`, "");

r.push("## Domande da rivedere", "", "Sono legate a fatti con affidabilità bassa: restano fuori dal gioco finché il gestore non le approva.", "");
for (const d of tutte.filter((x) => x.stato === "da_rivedere")) {
  const f = F.find((x) => x.id === d.fatto_id);
  r.push(`- **${d.id}** (${d.fatto_id}): ${d.domanda} → *${d.risposte[d.corretta]}*. Fonte: ${f?.fonti.join(", ")}`);
}
r.push("");
fs.writeFileSync(path.join(radice, "docs/rapporto-domande.md"), r.join("\n"));
console.log(`Totale ${tot} domande. Rapporto in docs/rapporto-domande.md`);
