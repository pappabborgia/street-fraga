"use client";
import { useState } from "react";
import { T } from "@/testi";
import { proponiParola } from "@/gioco/conto";
import { Pulsante } from "./ui";
import { Avviso } from "./Accesso";

/** A fine partita: "Come si dice ... in fragagnanese?". Non dà punti: serve a raccogliere il dialetto. */
export function SchermataParola({ titoloRef, parola, token, avanti }: {
  titoloRef: React.RefObject<HTMLHeadingElement | null>; parola: string; token: string | null; avanti: () => void;
}) {
  const [testo, setTesto] = useState("");
  const [stato, setStato] = useState<"scrivo" | "invio" | "salvata" | "in_attesa">("scrivo");
  const [raccolte, setRaccolte] = useState<number | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  const salva = async () => {
    if (!testo.trim()) return setErrore(T.parolaVuota);
    setStato("invio");
    const r = await proponiParola(token, parola, testo.trim());
    setRaccolte(r.raccolte ?? null);
    setStato(r.ok ? "salvata" : "in_attesa");
  };

  return (
    <section className="pt-6 flex flex-col gap-5">
      <p className="fumetto text-[var(--giallo)] text-[1.25rem]">🗣 {T.dialettoEtichetta}</p>
      <h1 ref={titoloRef} tabIndex={-1} className="testo-domanda">{T.comeSiDice(parola)}</h1>
      {stato === "scrivo" || stato === "invio" ? (
        <>
          <div className="pannello p-4 flex flex-col gap-2">
            <p className="font-bold">{T.dialettoSpiegazione}</p>
            <p>{T.dialettoSpiegazione2}</p>
          </div>
          <label className="flex flex-col gap-2">
            <span className="testo-piccolo font-bold">{T.scriviComeSiDice}</span>
            <input value={testo} onChange={(e) => { setTesto(e.target.value); setErrore(null); }} maxLength={60} autoComplete="off"
              className="w-full min-h-[4.5rem] rounded-[var(--raggio)] border-[3px] border-black bg-white text-[var(--inchiostro)] px-4 text-[1.75rem] font-bold"
              onKeyDown={(e) => { if (e.key === "Enter") void salva(); }} />
          </label>
          {errore && <Avviso>{errore}</Avviso>}
          <Pulsante variante="giallo" className="w-full" disabled={stato === "invio"} onClick={() => void salva()}>
            {stato === "invio" ? T.unAttimo : T.inviaParola}
          </Pulsante>
          <Pulsante className="w-full" onClick={avanti}>{T.nonLoSo}</Pulsante>
        </>
      ) : (
        <>
          <div className="pannello p-5 flex flex-col gap-2 font-bold text-[1.5rem]">
            <p>✓ {stato === "salvata" ? T.grazieParola : T.parolaInAttesa}</p>
            {raccolte !== null && <p>{T.paroleRaccolte(raccolte)}</p>}
          </div>
          <Pulsante variante="giallo" className="w-full" onClick={avanti}>{T.avanti} <span aria-hidden="true">→</span></Pulsante>
        </>
      )}
    </section>
  );
}
