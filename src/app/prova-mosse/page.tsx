"use client";
import { useState } from "react";
import { PERSONAGGI } from "@/gioco/personaggi";
import { Arena, type Azione } from "@/componenti/Arena";

/** Pagina di prova (non collegata dal gioco): tutte le mosse di ogni lottatore. */
export default function ProvaMosse() {
  const [giro, setGiro] = useState(1);
  return (
    <main className="p-4 flex flex-col gap-6">
      <button className="pulsante pulsante-giallo" onClick={() => setGiro((g) => g + 1)}>Rivedi le mosse</button>
      {PERSONAGGI.map((p, i) => {
        const avv = PERSONAGGI[(i + 1) % PERSONAGGI.length];
        const azioni: { titolo: string; a: Azione }[] = [
          ...p.mosse.map((m, k) => ({
            titolo: m.nome,
            a: { chi: "giocatore", tipo: "colpo", scritta: p.suono[k], stile: m.stile, oggetto: m.oggetto, chiave: giro * 1000 + i * 10 + k } as Azione,
          })),
          ...p.speciali.map((sp, k) => ({
            titolo: `Speciale: ${sp.nome}`,
            a: { chi: "giocatore", tipo: "speciale", scritta: p.suono[0], speciale: sp, chiave: giro * 1000 + i * 10 + 5 + k } as Azione,
          })),
        ];
        return (
          <section key={p.id}>
            <h2 className="testo-titolo">{p.nome}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {azioni.map(({ titolo, a }) => (
                <div key={titolo}>
                  <p className="font-bold">{titolo}</p>
                  <Arena giocatore={p} computer={avv} azione={a} className="rounded-2xl border-4 border-black h-[13rem]" />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
