"use client";
import { useRef } from "react";
import { T } from "@/testi";
import { audio } from "@/gioco/audio";
import { Pulsante } from "./ui";

type RefTitolo = React.RefObject<HTMLHeadingElement | null>;

/** Messaggio gentile: icona + parole, mai il colore da solo. */
export function Avviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="pannello p-4 flex gap-3 items-start" role="alert">
      <span aria-hidden="true" className="text-[1.75rem] leading-none">⚠</span>
      <div className="flex flex-col gap-1 font-bold">{children}</div>
    </div>
  );
}

let ultimoNumero = 0;
/** Ignora i doppi tocchi involontari sul tastierino (più veloce dei pulsanti normali). */
function toccoNumeroValido(): boolean {
  const ora = Date.now();
  if (ora - ultimoNumero < 250) return false;
  ultimoNumero = ora;
  return true;
}

/** Tastierino numerico grande, disegnato da noi (non la tastiera del telefono). */
export function Tastierino({ valore, onCambia }: { valore: string; onCambia: (v: string) => void }) {
  const tocca = (f: () => void) => {
    if (!toccoNumeroValido()) return;
    audio.sblocca();
    f();
  };
  const tasto = (n: string) => (
    <button key={n} type="button" className="pulsante !text-[2rem] !min-h-[5rem]" onClick={() => tocca(() => valore.length < 4 && onCambia(valore + n))}>
      {n}
    </button>
  );
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="flex justify-center gap-4" aria-label={`${valore.length} numeri su 4`} role="status">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-14 h-16 rounded-xl border-[3px] border-black bg-white text-[var(--inchiostro)] flex items-center justify-center text-[2rem] font-bold" aria-hidden="true">
            {i < valore.length ? "●" : ""}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(tasto)}
        <span />
        {tasto("0")}
        <span />
      </div>
      <button type="button" className="pulsante w-full" onClick={() => tocca(() => onCambia(valore.slice(0, -1)))}>
        <span aria-hidden="true">⌫</span> {T.cancella}
      </button>
    </div>
  );
}

export function SchermataChiGioca({ titoloRef, nomi, onNome, onAltro, onRegistro, onHoNome, onProva }: {
  titoloRef: RefTitolo; nomi: string[]; onNome: (n: string) => void; onAltro: () => void;
  onRegistro: () => void; onHoNome: () => void; onProva: () => void;
}) {
  return (
    <section className="pt-6 flex flex-col gap-4">
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.chiGioca}</h1>
      {nomi.length > 0 ? (
        <>
          <p>{T.toccaIlTuoNome}</p>
          {nomi.map((n) => (
            <Pulsante key={n} variante="giallo" className="w-full !text-[1.75rem]" onClick={() => onNome(n)}>{n}</Pulsante>
          ))}
          <Pulsante className="w-full" onClick={onAltro}>{T.altroGiocatore}</Pulsante>
        </>
      ) : (
        <>
          <Pulsante variante="giallo" className="w-full" onClick={onRegistro}>{T.miRegistro}</Pulsante>
          <Pulsante className="w-full" onClick={onHoNome}>{T.hoGiaUnNome}</Pulsante>
        </>
      )}
      <Pulsante className="w-full flex-col" onClick={onProva}>
        <span>{T.provaSenza}</span>
        <span className="testo-piccolo font-normal">{T.provaSenzaSpiegazione}</span>
      </Pulsante>
    </section>
  );
}

export function SchermataHaiNome({ titoloRef, onSi, onNo }: { titoloRef: RefTitolo; onSi: () => void; onNo: () => void }) {
  return (
    <section className="pt-6 flex flex-col gap-5">
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.haiGiaUnNome}</h1>
      <Pulsante variante="giallo" className="w-full" onClick={onSi}>{T.siEntro}</Pulsante>
      <Pulsante className="w-full" onClick={onNo}>{T.noRegistro}</Pulsante>
    </section>
  );
}

export function SchermataNome({ titoloRef, nome, onCambia, errore, onAvanti, nuovo }: {
  titoloRef: RefTitolo; nome: string; onCambia: (n: string) => void; errore: string | null; onAvanti: () => void; nuovo: boolean;
}) {
  const campo = useRef<HTMLInputElement>(null);
  return (
    <section className="pt-6 flex flex-col gap-5">
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.comeTiChiami}</h1>
      {nuovo && <p>💡 {T.consiglioSoprannome}</p>}
      <label className="flex flex-col gap-2">
        <span className="testo-piccolo font-bold">{T.scriviNome}</span>
        <input ref={campo} value={nome} onChange={(e) => onCambia(e.target.value)} maxLength={30} autoComplete="off" autoCapitalize="words"
          className="w-full min-h-[4.5rem] rounded-2xl border-[3px] border-black bg-white text-[var(--inchiostro)] px-4 text-[1.75rem] font-bold"
          onKeyDown={(e) => { if (e.key === "Enter") onAvanti(); }} />
      </label>
      {errore && <Avviso>{errore}</Avviso>}
      <Pulsante variante="giallo" className="w-full" onClick={onAvanti}>{T.avanti} <span aria-hidden="true">→</span></Pulsante>
    </section>
  );
}

export function SchermataCodice({ titoloRef, titolo, consiglio, codice, onCambia, errore, pulsante, onAvanti, attesa, restaCollegato, onRestaCollegato, dimenticato }: {
  titoloRef: RefTitolo; titolo: string; consiglio?: string; codice: string; onCambia: (c: string) => void; errore: React.ReactNode;
  pulsante: string; onAvanti: () => void; attesa: boolean;
  restaCollegato?: boolean; onRestaCollegato?: (v: boolean) => void; dimenticato?: boolean;
}) {
  return (
    <section className="pt-6 flex flex-col gap-5">
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{titolo}</h1>
      {consiglio && <p>💡 {consiglio}</p>}
      <Tastierino valore={codice} onCambia={onCambia} />
      {errore && <Avviso>{errore}</Avviso>}
      {onRestaCollegato && (
        <Pulsante variante={restaCollegato ? "scelto" : "bianco"} className="w-full" aria-pressed={restaCollegato} onClick={() => onRestaCollegato(!restaCollegato)}>
          <span aria-hidden="true">{restaCollegato ? "✓" : "○"}</span> {T.restaCollegato}
        </Pulsante>
      )}
      <Pulsante variante="giallo" className="w-full" disabled={codice.length !== 4 || attesa} onClick={onAvanti}>
        {attesa ? T.unAttimo : pulsante} {!attesa && <span aria-hidden="true">→</span>}
      </Pulsante>
      {dimenticato && <p className="testo-piccolo">{T.codiceDimenticato}</p>}
    </section>
  );
}

export function SchermataNomePreso({ titoloRef, nome, proposta, onUsa, onAltro }: {
  titoloRef: RefTitolo; nome: string; proposta: string | null; onUsa: () => void; onAltro: () => void;
}) {
  return (
    <section className="pt-6 flex flex-col gap-5">
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.nomePreso(nome)}</h1>
      {proposta && <p className="pannello p-5 text-[1.5rem] font-bold">{T.propostaNome(proposta)}</p>}
      {proposta && <Pulsante variante="giallo" className="w-full" onClick={onUsa}>{T.usaProposta}</Pulsante>}
      <Pulsante className="w-full" onClick={onAltro}>{T.altroNome}</Pulsante>
    </section>
  );
}

export function SchermataBenvenuto({ titoloRef, testo, onAvanti }: { titoloRef: RefTitolo; testo: string; onAvanti: () => void }) {
  return (
    <section className="pt-6 flex flex-col gap-5 text-center">
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo text-[var(--giallo)]">{testo}</h1>
      <p className="text-[1.5rem]">{T.pronto}</p>
      <Pulsante variante="giallo" className="w-full fumetto !text-[1.75rem]" onClick={onAvanti}>{T.gioca}</Pulsante>
    </section>
  );
}
