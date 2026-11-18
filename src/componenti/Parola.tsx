"use client";
import { useEffect, useState } from "react";
import { T } from "@/testi";
import { type Proposta, propostaParola, votaParola } from "@/gioco/conto";
import { Pulsante } from "./ui";
import { Avviso } from "./Accesso";

type Passo = "carico" | "proposta" | "scrivo" | "invio" | "fatto";

/**
 * A fine partita: "Come si dice ... in fragagnanese?". Non dà punti: serve a raccogliere il dialetto.
 * Se c'è già una proposta si chiede se è giusta; se no (o se manca) si scrive la propria versione.
 */
export function SchermataParola({ titoloRef, parola, token, avanti }: {
  titoloRef: React.RefObject<HTMLHeadingElement | null>; parola: string; token: string | null; avanti: () => void;
}) {
  const [passo, setPasso] = useState<Passo>("carico");
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [esito, setEsito] = useState<{ salvato: boolean; proposta?: Proposta | null } | null>(null);
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    propostaParola(parola)
      .then((p) => { if (vivo) { setProposta(p); setPasso(p ? "proposta" : "scrivo"); } })
      .catch(() => { if (vivo) setPasso("scrivo"); });
    return () => { vivo = false; };
  }, [parola]);

  const vota = async (dialetto: string, giusto: boolean, poi: Passo = "fatto") => {
    setPasso("invio");
    const r = await votaParola(token, parola, dialetto, giusto);
    setEsito({ salvato: r.ok, proposta: r.proposta });
    setPasso(poi);
  };

  const salvaScritta = async () => {
    if (!testo.trim()) return setErrore(T.parolaVuota);
    // chi ha detto "no" alla proposta ha già votato; ora propone la sua versione
    await vota(testo.trim(), true);
  };

  return (
    <section className="pt-6 flex flex-col gap-5">
      <p className="fumetto text-[var(--giallo)] text-[1.25rem]">🗣 {T.dialettoEtichetta}</p>
      <h1 ref={titoloRef} tabIndex={-1} className="testo-domanda">{T.comeSiDice(parola)}</h1>

      {(passo === "carico" || passo === "proposta" || passo === "scrivo" || passo === "invio") && (
        <div className="pannello p-4 flex flex-col gap-2">
          <p className="font-bold">{T.dialettoSpiegazione}</p>
          <p>{T.comeFunziona}</p>
        </div>
      )}

      {passo === "carico" && <p>{T.caricamento}</p>}

      {passo === "proposta" && proposta && (
        <>
          <div className="rounded-[var(--raggio)] bg-[var(--notte-chiara)] p-4">
            <p>{T.qualcunoHaScritto}</p>
            <p className="text-[2rem] font-bold text-[var(--giallo)]">«{proposta.dialetto}»</p>
            <p className="text-[1.5rem] font-bold">{T.eGiusto}</p>
          </div>
          <Pulsante variante="giallo" className="w-full" onClick={() => void vota(proposta.dialetto, true)}>✓ {T.siGiusto}</Pulsante>
          <Pulsante className="w-full" onClick={() => void (async () => { await votaParola(token, parola, proposta.dialetto, false); setPasso("scrivo"); })()}>
            ✗ {T.noDiverso}
          </Pulsante>
          <Pulsante variante="scuro" className="w-full" onClick={avanti}>{T.nonLoSoBreve}</Pulsante>
        </>
      )}

      {(passo === "scrivo" || passo === "invio") && (
        <>
          <label className="flex flex-col gap-2">
            <span className="testo-piccolo font-bold">{proposta ? T.scriviTua : T.scriviComeSiDice}</span>
            <input value={testo} onChange={(e) => { setTesto(e.target.value); setErrore(null); }} maxLength={60} autoComplete="off"
              className="w-full min-h-[4.5rem] rounded-[var(--raggio)] border-[3px] border-black bg-white text-[var(--inchiostro)] px-4 text-[1.75rem] font-bold"
              onKeyDown={(e) => { if (e.key === "Enter") void salvaScritta(); }} />
          </label>
          {errore && <Avviso>{errore}</Avviso>}
          <Pulsante variante="giallo" className="w-full" disabled={passo === "invio"} onClick={() => void salvaScritta()}>
            {passo === "invio" ? T.unAttimo : T.inviaParola}
          </Pulsante>
          <Pulsante className="w-full" onClick={avanti}>{T.nonLoSo}</Pulsante>
        </>
      )}

      {passo === "fatto" && esito && (
        <>
          <div className="pannello p-5 flex flex-col gap-2 font-bold text-[1.5rem]">
            <p>✓ {esito.salvato ? T.graziVoto : T.parolaInAttesa}</p>
            {esito.proposta && <p>{T.votiParola(esito.proposta.si)}</p>}
            {esito.proposta?.confermata && <p>★ {T.parolaConfermata}</p>}
          </div>
          <Pulsante variante="giallo" className="w-full" onClick={avanti}>{T.avanti} <span aria-hidden="true">→</span></Pulsante>
        </>
      )}
    </section>
  );
}
