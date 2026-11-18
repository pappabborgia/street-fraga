"use client";
import { useState } from "react";
import { PERSONAGGI } from "@/gioco/personaggi";
import { Arena } from "@/componenti/Arena";

/** Pagina di prova (non collegata dal gioco): mostra il colpo speciale di ogni lottatore. */
export default function ProvaMosse() {
  const [giro, setGiro] = useState(1);
  return (
    <main className="p-4 grid gap-6 sm:grid-cols-2">
      <button className="pulsante pulsante-giallo sm:col-span-2" onClick={() => setGiro((g) => g + 1)}>Rivedi i colpi</button>
      {PERSONAGGI.map((p, i) => (
        <div key={p.id}>
          <p className="font-bold">{p.nome}: {p.speciale.nome}</p>
          <Arena giocatore={p} computer={PERSONAGGI[(i + 1) % PERSONAGGI.length]}
            azione={{ chi: "giocatore", tipo: "speciale", scritta: p.suono[0], chiave: giro * 100 + i }}
            className="rounded-2xl border-4 border-black h-[15rem]" />
        </div>
      ))}
    </main>
  );
}
