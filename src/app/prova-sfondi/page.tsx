import { PERSONAGGI } from "@/gioco/personaggi";
import { Arena } from "@/componenti/Arena";
import { NOMI_LUOGHI, type Luogo } from "@/componenti/Sfondi";

/** Pagina di prova (non collegata dal gioco): tutti gli sfondi. */
export default function ProvaSfondi() {
  return (
    <main className="p-4 grid gap-6 md:grid-cols-2">
      {(Object.keys(NOMI_LUOGHI) as Luogo[]).map((l, i) => (
        <div key={l}>
          <p className="font-bold">{NOMI_LUOGHI[l]}</p>
          <Arena luogo={l} giocatore={PERSONAGGI[i]} computer={PERSONAGGI[i + 5]} className="rounded-2xl border-[3px] border-black h-[15rem] sm:h-[20rem]" />
        </div>
      ))}
    </main>
  );
}
