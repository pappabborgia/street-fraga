"use client";
import { useEffect, useState } from "react";
import { T } from "@/testi";
import { type Profilo, type RigaClassifica, type Sessione, classifica, ilMioProfilo } from "@/gioco/conto";
import { Pulsante } from "./ui";
import { Avviso } from "./Accesso";

/** Classifica del paese: punti e vittorie, della settimana e di sempre. Solo progressi positivi. */
export function SchermataClassifica({ titoloRef, sessione }: { titoloRef: React.RefObject<HTMLHeadingElement | null>; sessione: Sessione | null }) {
  const [periodo, setPeriodo] = useState<"settimana" | "sempre">("settimana");
  const [righe, setRighe] = useState<RigaClassifica[] | null>(null);
  const [profilo, setProfilo] = useState<Profilo | null>(null);
  const [errore, setErrore] = useState(false);

  useEffect(() => {
    let vivo = true;
    classifica(periodo)
      .then((r) => { if (vivo) { setRighe(r); setErrore(false); } })
      .catch(() => { if (vivo) setErrore(true); });
    return () => { vivo = false; };
  }, [periodo]);

  useEffect(() => {
    if (!sessione) return;
    ilMioProfilo(sessione.token).then(setProfilo).catch(() => {});
  }, [sessione]);

  return (
    <section className="pt-6 flex flex-col gap-5">
      <h1 ref={titoloRef} tabIndex={-1} className="testo-titolo">{T.classificaTitolo}</h1>
      {profilo && (
        <div className="pannello p-5">
          <p className="font-bold">★ {T.iTuoiProgressi}</p>
          <p className="text-[1.5rem] font-bold">{T.progressi(profilo.punti, profilo.vittorie, profilo.giorni)}</p>
          {profilo.coppe > 0 && <p className="text-[1.5rem] font-bold">{T.tueCoppe(profilo.coppe)}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {(["settimana", "sempre"] as const).map((p) => (
          <Pulsante key={p} variante={periodo === p ? "scelto" : "bianco"} aria-pressed={periodo === p} onClick={() => { setRighe(null); setPeriodo(p); }}>
            {periodo === p && <span aria-hidden="true">✓</span>} {p === "settimana" ? T.settimana : T.sempre}
          </Pulsante>
        ))}
      </div>
      {errore && <Avviso>{T.senzaRete}</Avviso>}
      {!errore && righe === null && <p>{T.caricamento}</p>}
      {righe && righe.length === 0 && <p className="pannello p-5 font-bold">{T.nessunaPartita}</p>}
      {righe && righe.length > 0 && (
        <ol className="flex flex-col gap-3">
          {righe.map((r, i) => {
            const io = sessione && r.nome.toLowerCase() === sessione.nome.toLowerCase();
            return (
              <li key={r.nome} className={`pannello p-4 flex items-center gap-4 ${io ? "!bg-[var(--giallo)]" : ""}`}>
                <span className="fumetto text-[1.75rem] w-12 text-center" aria-hidden="true">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[1.5rem] break-words">{T.riga(i + 1, r.nome)}</p>
                  {io && <p className="font-bold">★ {T.tu}</p>}
                  <p>{T.puntiVittorie(r.punti, r.vittorie)}{r.coppe > 0 && <> · <span aria-hidden="true">🏆</span> {T.coppe(r.coppe)}</>}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
