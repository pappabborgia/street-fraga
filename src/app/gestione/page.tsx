"use client";
import { useState } from "react";
import { G } from "@/testi";
import { type Pannello, type Riga, SenzaRete, pannelloGestione } from "@/gioco/conto";
import { trovaPersonaggio } from "@/gioco/personaggi";

const data = (v: unknown) => (v ? new Date(String(v)).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) : "—");
const giorno = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" }) : "—");
const nomeLottatore = (id: unknown) => (id ? trovaPersonaggio(String(id)).nome : "—");

function Tabella({ titolo, righe, colonne }: { titolo: string; righe: Riga[] | undefined; colonne: [string, string, (v: Riga[string], r: Riga) => React.ReactNode][] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[1.75rem] font-bold">{titolo}</h2>
      {!righe || righe.length === 0 ? <p className="testo-piccolo">{G.nessunDato}</p> : (
        <div className="overflow-x-auto rounded-[var(--raggio)] border-[3px] border-[var(--notte-chiara)]">
          <table className="w-full text-left text-[1.25rem]">
            <thead className="bg-[var(--notte-chiara)]">
              <tr>{colonne.map(([k, t]) => <th key={k} className="px-3 py-2 whitespace-nowrap">{t}</th>)}</tr>
            </thead>
            <tbody>
              {righe.map((r, i) => (
                <tr key={i} className="border-t border-[var(--notte-chiara)]">
                  {colonne.map(([k, , f]) => <td key={k} className="px-3 py-2 whitespace-nowrap">{f(r[k], r)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const v = (x: Riga[string]) => (x === null || x === undefined ? "—" : String(x));

export default function PaginaGestione() {
  const [password, setPassword] = useState("");
  const [dati, setDati] = useState<Pannello | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [attesa, setAttesa] = useState(false);

  const carica = async (pw = password) => {
    setAttesa(true); setErrore(null);
    try {
      const r = await pannelloGestione(pw);
      if (r.errore === "pausa") setErrore(G.pausa(r.minuti ?? 15));
      else if (r.errore) setErrore(G.sbagliata);
      else setDati(r);
    } catch (e) {
      setErrore(e instanceof SenzaRete ? G.senzaRete : G.senzaRete);
    } finally { setAttesa(false); }
  };

  if (!dati) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-4">
        <form className="w-full max-w-md flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void carica(); }}>
          <h1 className="testo-titolo">{G.titolo}</h1>
          <label className="flex flex-col gap-2">
            <span className="font-bold">{G.password}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
              className="w-full min-h-[4.5rem] rounded-[var(--raggio)] border-[3px] border-black bg-white text-[var(--inchiostro)] px-4 text-[1.5rem]" />
          </label>
          {errore && <p className="pannello p-3 font-bold" role="alert">⚠ {errore}</p>}
          <button type="submit" className="pulsante pulsante-giallo w-full" disabled={attesa || !password}>{attesa ? "…" : G.entra}</button>
        </form>
      </main>
    );
  }

  const r = dati.riepilogo ?? {};
  const riquadri: [string, number | undefined][] = [
    [G.giocatori, r.giocatori], [G.partite, r.partite], [G.partiteOggi, r.partite_oggi], [G.partiteSettimana, r.partite_settimana],
    [G.coppe, r.coppe], [G.parole, r.parole], [G.paroleConfermate, r.parole_confermate], [G.votiParole, r.voti_parole],
  ];
  const colClassifica: [string, string, (x: Riga[string], r: Riga) => React.ReactNode][] = [
    ["nome", G.colonne.nome, v], ["punti", G.colonne.punti, v], ["vittorie", G.colonne.vittorie, v], ["partite", G.colonne.partite, v], ["coppe", G.colonne.coppe, v],
  ];

  return (
    <main className="mx-auto max-w-6xl p-4 flex flex-col gap-8 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="testo-titolo">{G.titolo}</h1>
        <div className="flex gap-3">
          <button type="button" className="pulsante pulsante-giallo" onClick={() => void carica()} disabled={attesa}>⟳ {G.aggiorna}</button>
          <button type="button" className="pulsante pulsante-scuro" onClick={() => { setDati(null); setPassword(""); }}>{G.esci}</button>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-[1.75rem] font-bold">{G.riepilogo}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {riquadri.map(([t, n]) => (
            <div key={t} className="rounded-[var(--raggio)] bg-[var(--notte-chiara)] p-4">
              <p className="testo-piccolo">{t}</p>
              <p className="fumetto text-[2.25rem] text-[var(--giallo)]">{n ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Tabella titolo={G.classificaSettimana} righe={dati.classifica_settimana} colonne={colClassifica} />
        <Tabella titolo={G.classifica} righe={dati.classifica} colonne={colClassifica} />
      </div>

      <Tabella titolo={G.chiGioca} righe={dati.giocatori} colonne={[
        ["nome", G.colonne.nome, v], ["partite", G.colonne.partite, v], ["vittorie", G.colonne.vittorie, v], ["punti", G.colonne.punti, v],
        ["coppe", G.colonne.coppe, v], ["giorni_di_gioco", G.colonne.giorni, v], ["ultima_partita", G.colonne.ultima, data], ["registrato_il", G.colonne.registrato, data],
      ]} />

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <Tabella titolo={G.perGiorno} righe={dati.per_giorno} colonne={[
          ["giorno", G.colonne.giorno, giorno], ["partite", G.colonne.partite, v], ["giocatori", G.giocatori, v],
        ]} />
        <Tabella titolo={G.ultimePartite} righe={dati.ultime_partite} colonne={[
          ["giocata_il", G.colonne.quando, data], ["nome", G.colonne.nome, v], ["personaggio", G.colonne.personaggio, nomeLottatore],
          ["avversario", G.colonne.avversario, nomeLottatore], ["livello", G.colonne.livello, v], ["punti", G.colonne.punti, v],
          ["vinta", G.colonne.vinta, (x) => (x ? "✓" : "—")],
        ]} />
      </div>

      <Tabella titolo={G.dialetto} righe={dati.parole} colonne={[
        ["italiano", G.colonne.italiano, v],
        ["dialetto", G.colonne.dialetto, (x, riga) => <>{v(x)} {riga.proposta_da_fonte ? <span className="testo-piccolo opacity-80">{G.daFonte}</span> : null}</>],
        ["si", G.colonne.si, v], ["no", G.colonne.no, v],
        ["confermata", G.colonne.stato, (x) => (x ? <strong className="text-[var(--giallo)]">★ {G.confermata}</strong> : G.daConfermare)],
      ]} />
    </main>
  );
}
