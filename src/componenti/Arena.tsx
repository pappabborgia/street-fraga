"use client";
import { useEffect, useRef, useState } from "react";
import type { Personaggio } from "@/gioco/personaggi";
import { Chiesa } from "./Chiesa";
import { Lottatore } from "./Lottatore";
import { SvgOggetto } from "./Oggetti";

export type Lato = "giocatore" | "computer";
export interface Azione {
  chi: Lato;
  tipo: "colpo" | "speciale" | "manca";
  scritta: string;
  chiave: number;
}

interface Misure { w: number; h: number }

function useMisure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [m, setM] = useState<Misure>({ w: 360, h: 240 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setM({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, m] as const;
}

export function Arena({
  giocatore, computer, azione = null, ko = null, stretta = false, className = "",
}: {
  giocatore: Personaggio; computer: Personaggio; azione?: Azione | null;
  ko?: Lato | null; stretta?: boolean; className?: string;
}) {
  const [ref, { w, h }] = useMisure<HTMLDivElement>();
  // Dimensioni dei lottatori e distanza del balzo, calcolate sullo spazio disponibile
  const fh = h * 0.82;
  const fw = fh * (210 / 300);
  const margine = Math.max(w * 0.02, w / 2 - fw - h * 0.08);
  const spazio = w - 2 * margine - 2 * fw;
  const spinta = Math.max(0, spazio + fw * 0.2);
  const centro = { giocatore: margine + fw * 0.5, computer: w - margine - fw * 0.5 };

  const classe = (lato: Lato) => {
    if (stretta) return "anim-stretta";
    if (ko === lato) return "anim-ko";
    if (!azione) return "";
    if (azione.chi === lato) return `anim-${azione.tipo}`;
    return azione.tipo === "manca" ? "" : "anim-subisce";
  };

  const attaccante = azione ? (azione.chi === "giocatore" ? giocatore : computer) : null;
  const bersaglio: Lato | null = azione ? (azione.chi === "giocatore" ? "computer" : "giocatore") : null;

  return (
    <div ref={ref} className={`arena ${className}`} style={{ ["--spinta" as string]: `${spinta}px` }}>
      <Chiesa />
      <div key={`g-${azione?.chiave ?? 0}-${stretta}-${ko}`} className={`lott ${classe("giocatore")}`} style={{ left: margine }}>
        <Lottatore p={giocatore} verso="destra" />
      </div>
      <div key={`c-${azione?.chiave ?? 0}-${stretta}-${ko}`} className={`lott cpu ${classe("computer")}`} style={{ right: margine }}>
        <Lottatore p={computer} verso="sinistra" />
      </div>

      {azione && attaccante && bersaglio && (
        <div key={`e-${azione.chiave}`} aria-hidden="true">
          {azione.tipo === "speciale" && (
            <EffettoSpeciale
              p={attaccante}
              da={centro[azione.chi]}
              a={centro[bersaglio]}
              dir={azione.chi === "giocatore" ? 1 : -1}
              h={h}
              fw={fw}
            />
          )}
          <Scritta
            testo={azione.scritta}
            x={azione.tipo === "manca" ? w / 2 : centro[bersaglio]}
            y={h * 0.03}
            manca={azione.tipo === "manca"}
            ritardo={azione.tipo === "speciale" ? 0.9 : 0.6}
          />
        </div>
      )}
      {stretta && (
        <div className="effetto dissolvenza fumetto text-center" style={{ left: 0, right: 0, top: h * 0.06, animationDelay: "1.2s" }} aria-hidden="true">
          <span className="inline-block bg-[var(--giallo)] text-[var(--inchiostro)] border-4 border-black rounded-2xl px-4 py-1 text-[1.5rem]">
            ★ ★ ★
          </span>
        </div>
      )}
    </div>
  );
}

function Scritta({ testo, x, y, manca, ritardo }: { testo: string; x: number; y: number; manca: boolean; ritardo: number }) {
  return (
    <div className="effetto scoppio" style={{ left: x, top: y, translate: "-50% 0", animationDelay: `${ritardo}s` }}>
      <div
        className="fumetto px-4 py-2 border-4 border-black rounded-[40%] text-[1.75rem] whitespace-nowrap"
        style={{ background: manca ? "#ffffff" : "#ffd23f", color: manca ? "#1d3a8a" : "#a10f0f", boxShadow: "0 4px 0 #1a1a1a" }}
      >
        {testo}
      </div>
    </div>
  );
}

function EffettoSpeciale({ p, da, a, dir, h, fw }: { p: Personaggio; da: number; a: number; dir: number; h: number; fw: number }) {
  const { effetto, oggetto } = p.speciale;
  const lato = Math.max(36, h * 0.16);
  if (effetto === "pioggia") {
    const pezzi = [-0.5, 0.1, -0.2, 0.45, -0.05, 0.3, -0.38, 0.2, 0];
    return (
      <>
        {pezzi.map((o, i) => (
          <div key={i} className="effetto cade"
            style={{
              left: a + o * fw * 1.2 - lato / 2,
              top: h * (0.62 + ((i * 37) % 25) / 100) - lato / 2,
              width: lato, height: lato,
              animationDelay: `${0.35 + i * 0.07}s`,
              ["--giro" as string]: `${(i % 2 ? 1 : -1) * 220}deg`,
            }}>
            <SvgOggetto tipo={oggetto} className="w-full h-full" />
          </div>
        ))}
      </>
    );
  }
  if (effetto === "cade") {
    const grande = lato * 1.8;
    return (
      <div className="effetto cade" style={{ left: a - grande / 2, top: h * 0.26, width: grande, height: grande, animationDelay: "0.4s", ["--giro" as string]: "0deg" }}>
        <SvgOggetto tipo={oggetto} className="w-full h-full" />
      </div>
    );
  }
  if (effetto === "onda") {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <div key={`c${i}`} className="effetto cerchio"
            style={{ left: da - h * 0.25, top: h * 0.25, width: h * 0.5, height: h * 0.5, animationDelay: `${0.3 + i * 0.2}s` }} />
        ))}
        {[0, 1, 2].map((i) => (
          <div key={`n${i}`} className="effetto vola"
            style={{
              left: a - lato / 2 + (i - 1) * lato * 0.6, top: h * (0.3 + i * 0.12), width: lato, height: lato,
              animationDelay: `${0.35 + i * 0.12}s`,
              ["--dx" as string]: `${da - a}px`, ["--dir" as string]: `${dir}`,
            }}>
            <SvgOggetto tipo={oggetto} className="w-full h-full" />
          </div>
        ))}
      </>
    );
  }
  // lancio
  const grande = lato * 1.6;
  return (
    <div className="effetto vola"
      style={{
        left: a - grande / 2, top: h * 0.4, width: grande, height: grande,
        animationDelay: "0.35s",
        ["--dx" as string]: `${da - a}px`, ["--dir" as string]: `${dir}`,
      }}>
      <div style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }} className="w-full h-full">
        <SvgOggetto tipo={oggetto} className="w-full h-full" />
      </div>
    </div>
  );
}
