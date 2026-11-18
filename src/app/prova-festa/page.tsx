"use client";
import { useState } from "react";
import { PERSONAGGI } from "@/gioco/personaggi";
import { Festa, scegliSottotitolo, type Risultato } from "@/componenti/Festa";

/** Pagina di prova (non collegata dal gioco): la festa di fine partita. */
export default function ProvaFesta() {
  const [r, setR] = useState<Risultato>("vinto");
  const [giro, setGiro] = useState(0);
  const me = PERSONAGGI[0], lui = PERSONAGGI[2];
  return (
    <main className="p-4 flex flex-col gap-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {(["vinto", "perso", "pari"] as Risultato[]).map((x) => (
          <button key={x} className="pulsante" onClick={() => { setR(x); setGiro((g) => g + 1); }}>{x}</button>
        ))}
      </div>
      <Festa key={`${r}-${giro}`} me={me} lui={lui} risultato={r} seme={giro} className="rounded-2xl border-[3px] border-black h-[17rem] sm:h-[26rem]" />
      <p className="text-center text-[1.5rem] font-bold">{scegliSottotitolo(r, r === "perso" ? lui.nome : me.nome, r === "perso" ? me.nome : lui.nome, giro)}</p>
    </main>
  );
}
