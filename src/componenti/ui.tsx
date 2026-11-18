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

/** Barra in alto: "Indietro" a sinistra, la musica al centro, "Casa" a destra, sempre nello stesso posto. */
export function BarraFissa({ onIndietro, onCasa, musica, onMusica }: {
  onIndietro: () => void; onCasa: () => void; musica: boolean; onMusica: () => void;
}) {
  return (
    <nav className="sticky top-0 z-30 bg-[var(--notte)] border-b-4 border-black px-2 py-2" aria-label={T.navigazione}>
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
        <Pulsante onClick={onIndietro} className="!px-3">
          <span aria-hidden="true">←</span> {T.indietro}
        </Pulsante>
        <Pulsante onClick={onMusica} className="!px-2 !gap-0 flex-col !leading-none min-w-[4.5rem]" aria-pressed={musica}
          aria-label={musica ? T.musicaTogli : T.musicaMetti}>
          <span aria-hidden="true" className="text-[1.75rem] relative">
            ♪
            {!musica && <span className="absolute inset-0 flex items-center justify-center text-[2rem] text-[#8a1c1c]">⁄</span>}
          </span>
          <span className="testo-piccolo">{musica ? T.si : T.no}</span>
        </Pulsante>
        <Pulsante onClick={onCasa} className="!px-3">
          <span aria-hidden="true">⌂</span> {T.casa}
        </Pulsante>
      </div>
    </nav>
  );
}
