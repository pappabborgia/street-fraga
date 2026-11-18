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

type Props = React.ComponentProps<"button"> & { variante?: "bianco" | "giallo" | "scuro" | "scelto" | "giusto" | "sbagliato" };

export function Pulsante({ variante = "bianco", className = "", onClick, children, ...resto }: Props) {
  const classi = {
    bianco: "", giallo: "pulsante-giallo", scuro: "pulsante-scuro", scelto: "pulsante-scelto",
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
export function BarraFissa({ onIndietro, onCasa, musica, onMusica, inCasa = false, onMenu }: {
  onIndietro: () => void; onCasa: () => void; musica: boolean; onMusica: () => void; inCasa?: boolean; onMenu?: () => void;
}) {
  return (
    <nav aria-label={T.navigazione}
      className={inCasa
        ? "barra-casa sticky top-0 z-30 bg-[var(--notte)] px-3 py-2" /* in casa: solo la musica */
        : "sticky top-0 z-30 bg-[var(--notte)] border-b-2 border-[var(--notte-chiara)] px-3 py-2"}>
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-2">
        {/* In casa "Indietro" e "Casa" non servono: resta solo la musica, a destra */}
        {inCasa ? (
          /* in casa: a sinistra il menu (classifica, impostazioni, chi gioca), a destra la musica */
          <Pulsante variante="scuro" onClick={onMenu} className="!px-3 !text-[1.375rem]">
            <span aria-hidden="true">☰</span> {T.menu}
          </Pulsante>
        ) : (
          <Pulsante variante="scuro" onClick={onIndietro} className="!px-3 !text-[1.375rem]">
            <span aria-hidden="true">←</span> {T.indietro}
          </Pulsante>
        )}
        <Pulsante variante="scuro" onClick={onMusica} className="!px-2 !gap-0 flex-col !leading-tight min-w-[5rem]" aria-pressed={musica}
          aria-label={musica ? T.musicaTogli : T.musicaMetti}>
          <span className="testo-piccolo">{T.musica}</span>
          <span className="text-[1.375rem]"><span aria-hidden="true">{musica ? "♪ " : "✕ "}</span>{musica ? T.si : T.no}</span>
        </Pulsante>
        {!inCasa && (
          <Pulsante variante="scuro" onClick={onCasa} className="!px-3 !text-[1.375rem]">
            <span aria-hidden="true">⌂</span> {T.casa}
          </Pulsante>
        )}
      </div>
    </nav>
  );
}
