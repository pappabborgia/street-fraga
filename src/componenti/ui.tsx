"use client";
import { audio } from "@/gioco/audio";
import { T } from "@/testi";

let ultimoTocco = 0;
/** Ignora i doppi tocchi involontari: un secondo tocco entro 600 ms non conta. */
export function toccoValido(): boolean {
  const ora = Date.now();
  if (ora - ultimoTocco < 600) return false;
  ultimoTocco = ora;
  return true;
}

type Props = React.ComponentProps<"button"> & { variante?: "bianco" | "giallo" | "scelto" | "giusto" | "sbagliato" };

export function Pulsante({ variante = "bianco", className = "", onClick, children, ...resto }: Props) {
  const classi = {
    bianco: "", giallo: "pulsante-giallo", scelto: "pulsante-scelto",
    giusto: "pulsante-giusto", sbagliato: "pulsante-sbagliato",
  }[variante];
  return (
    <button
      type="button"
      className={`pulsante ${classi} ${className}`}
      onClick={(e) => {
        if (!toccoValido()) return;
        audio.sblocca();
        onClick?.(e);
      }}
      {...resto}
    >
      {children}
    </button>
  );
}

/** Barra in alto: "Indietro" a sinistra e "Casa" a destra, sempre nello stesso posto. */
export function BarraFissa({ onIndietro, onCasa, musica }: { onIndietro: () => void; onCasa: () => void; musica: boolean }) {
  return (
    <nav className="sticky top-0 z-30 bg-[var(--notte)] border-b-4 border-black px-3 py-2" aria-label={T.navigazione}>
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
        <Pulsante onClick={onIndietro} className="min-w-[8.5rem]">
          <span aria-hidden="true">←</span> {T.indietro}
        </Pulsante>
        <p className="testo-piccolo text-center font-bold" aria-live="polite">
          <span aria-hidden="true">{musica ? "♪" : ""}</span>
          <span className="sr-only">{musica ? T.musicaInCorso : T.musicaSpenta}</span>
        </p>
        <Pulsante onClick={onCasa} className="min-w-[7.5rem]">
          <span aria-hidden="true">⌂</span> {T.casa}
        </Pulsante>
      </div>
    </nav>
  );
}
