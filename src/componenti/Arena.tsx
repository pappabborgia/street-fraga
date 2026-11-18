"use client";
import { useEffect, useRef, useState } from "react";
import type { Oggetto, Personaggio, Stile } from "@/gioco/personaggi";
import { Chiesa } from "./Chiesa";
import { Lottatore } from "./Lottatore";
import { Fiamma, SvgOggetto } from "./Oggetti";

export type Lato = "giocatore" | "computer";
export interface Azione {
  chi: Lato;
  tipo: "colpo" | "speciale" | "manca";
  scritta: string;
  chiave: number;
  stile?: Stile;
  oggetto?: Oggetto;
}

/** Quando arriva il colpo (secondi dall'inizio): tutto dura al massimo 1,5 secondi. */
export const MOMENTO_COLPO: Record<Stile | "speciale", number> = {
  salto: 0.85, capriola: 0.7, carica: 0.5, lancio: 0.85, speciale: 0.95,
};

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

  const stile = azione?.stile ?? "carica";
  const momento = azione?.tipo === "speciale" ? MOMENTO_COLPO.speciale : MOMENTO_COLPO[stile];
  // Nel lancio il lottatore resta quasi fermo: è l'oggetto a volare.
  const animAttacco = !azione ? "" : azione.tipo === "manca" ? "anim-manca" : azione.tipo === "speciale" ? "anim-speciale" : `anim-${stile}`;

  const classe = (lato: Lato) => {
    if (stretta) return "anim-stretta";
    if (ko === lato) return "anim-ko";
    if (!azione) return "";
    if (azione.chi === lato) return animAttacco;
    if (azione.tipo === "manca") return "";
    return azione.tipo === "speciale" ? "anim-subisce-forte" : "anim-subisce";
  };
  const ritardo = (lato: Lato) =>
    azione && azione.chi !== lato && azione.tipo !== "manca" ? { animationDelay: `${momento}s` } : {};

  const attaccante = azione ? (azione.chi === "giocatore" ? giocatore : computer) : null;
  const bersaglio: Lato | null = azione ? (azione.chi === "giocatore" ? "computer" : "giocatore") : null;
  const dir = azione?.chi === "computer" ? -1 : 1;

  const fiammeAddosso = (lato: Lato) => {
    if (!azione || azione.chi !== lato || azione.tipo === "manca") return null;
    if (azione.tipo === "speciale") return <Aura />;
    if (stile === "carica") return <Scia dir={lato === "giocatore" ? 1 : -1} />;
    return null;
  };

  return (
    <div ref={ref} className={`arena ${className}`} style={{ ["--spinta" as string]: `${spinta}px` }}>
      <Chiesa />
      {azione?.tipo === "speciale" && attaccante && (
        <div key={`buio-${azione.chiave}`} className="effetto inset-0 buio" aria-hidden="true" />
      )}
      <div key={`g-${azione?.chiave ?? 0}-${stretta}-${ko}`} className={`lott ${classe("giocatore")}`}
        style={{ left: margine, ...ritardo("giocatore") }}>
        {fiammeAddosso("giocatore")}
        <Lottatore p={giocatore} verso="destra" />
      </div>
      <div key={`c-${azione?.chiave ?? 0}-${stretta}-${ko}`} className={`lott cpu ${classe("computer")}`}
        style={{ right: margine, ...ritardo("computer") }}>
        {fiammeAddosso("computer")}
        <Lottatore p={computer} verso="sinistra" />
      </div>

      {azione && attaccante && bersaglio && (
        <div key={`e-${azione.chiave}`} aria-hidden="true">
          {azione.tipo === "colpo" && stile === "lancio" && azione.oggetto && (
            <Lancio oggetto={azione.oggetto} da={centro[azione.chi]} a={centro[bersaglio]} dir={dir} h={h} />
          )}
          {azione.tipo === "speciale" && (
            <>
              <Striscione testo={attaccante.speciale.nome} />
              <EffettoSpeciale p={attaccante} da={centro[azione.chi]} a={centro[bersaglio]} dir={dir} h={h} fw={fw} />
              <Fiammata x={centro[bersaglio]} h={h} fw={fw} ritardo={momento} />
            </>
          )}
          {azione.tipo !== "manca" && <Stelline x={centro[bersaglio]} y={h * 0.4} ritardo={momento} />}
          <Scritta
            testo={azione.scritta}
            x={azione.tipo === "manca" ? w / 2 : centro[bersaglio]}
            y={h * 0.03}
            manca={azione.tipo === "manca"}
            ritardo={azione.tipo === "manca" ? 0.7 : momento}
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

/** Fiamme intorno a chi lancia il colpo speciale. */
function Aura() {
  return (
    <div className="aura" aria-hidden="true">
      <Fiamma className="absolute bottom-0 left-[-18%] w-[55%] h-[75%]" style={{ animationDelay: "0.05s" }} />
      <Fiamma className="absolute bottom-0 right-[-18%] w-[55%] h-[75%]" style={{ animationDelay: "0.12s" }} />
      <Fiamma className="absolute bottom-[10%] left-[15%] w-[70%] h-[100%]" />
    </div>
  );
}

/** Scia di fuoco dietro chi carica. */
function Scia({ dir }: { dir: number }) {
  return (
    <div className="scia" aria-hidden="true" style={{ [dir > 0 ? "right" : "left"]: "62%" }}>
      {[0, 1, 2].map((i) => (
        <Fiamma key={i} className="absolute w-[60%] h-[38%]"
          style={{
            top: `${18 + i * 24}%`, [dir > 0 ? "right" : "left"]: `${i * 12}%`,
            transform: `rotate(${dir > 0 ? -90 : 90}deg)`,
          }} />
      ))}
    </div>
  );
}

function Lancio({ oggetto, da, a, dir, h }: { oggetto: Oggetto; da: number; a: number; dir: number; h: number }) {
  const lato = Math.max(44, h * 0.2);
  return (
    <div className="effetto lancio-oggetto"
      style={{
        left: a - lato / 2, top: h * 0.28, width: lato, height: lato,
        ["--dx" as string]: `${da - a}px`, ["--dir" as string]: `${dir}`, ["--terra" as string]: `${h * 0.45}px`,
      }}>
      <SvgOggetto tipo={oggetto} className="w-full h-full" />
    </div>
  );
}

function Fiammata({ x, h, fw, ritardo }: { x: number; h: number; fw: number; ritardo: number }) {
  const larg = fw * 1.3;
  return (
    <div className="effetto fiammata" style={{ left: x - larg / 2, bottom: h * 0.02, width: larg, height: h * 0.85 }}>
      <Fiamma className="w-full h-full" style={{ animationDelay: `${ritardo - 0.1}s` }} />
    </div>
  );
}

function Stelline({ x, y, ritardo }: { x: number; y: number; ritardo: number }) {
  const raggi = [[-60, -40], [60, -50], [-70, 20], [70, 15], [0, -70], [-20, 60], [30, 55]];
  return (
    <>
      {raggi.map(([sx, sy], i) => (
        <div key={i} className="effetto stellina fumetto"
          style={{ left: x - 14, top: y - 14, ["--sx" as string]: `${sx}px`, ["--sy" as string]: `${sy}px`, animationDelay: `${ritardo}s` }}>
          ★
        </div>
      ))}
    </>
  );
}

function Striscione({ testo }: { testo: string }) {
  return (
    <div className="effetto striscione left-0 right-0 flex justify-center" style={{ top: "38%" }}>
      <div className="fumetto testo-fuoco px-3 py-1 text-center leading-tight" style={{ fontSize: "min(2.75rem, 8cqw)" }}>
        {testo.toUpperCase()}!
      </div>
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
    const pezzi = [-0.5, 0.1, -0.2, 0.45, -0.05, 0.3, -0.38, 0.2, 0, 0.55, -0.6];
    return (
      <>
        {pezzi.map((o, i) => (
          <div key={i} className="effetto cade"
            style={{
              left: a + o * fw * 1.2 - lato / 2,
              top: h * (0.62 + ((i * 37) % 25) / 100) - lato / 2,
              width: lato, height: lato,
              animationDelay: `${0.45 + i * 0.05}s`,
              ["--giro" as string]: `${(i % 2 ? 1 : -1) * 360}deg`,
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
      <div className="effetto cade" style={{ left: a - grande / 2, top: h * 0.26, width: grande, height: grande, animationDelay: "0.45s", ["--giro" as string]: "0deg" }}>
        <SvgOggetto tipo={oggetto} className="w-full h-full" />
      </div>
    );
  }
  if (effetto === "onda") {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <div key={`c${i}`} className="effetto cerchio"
            style={{ left: da - h * 0.25, top: h * 0.25, width: h * 0.5, height: h * 0.5, animationDelay: `${0.25 + i * 0.15}s` }} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <div key={`n${i}`} className="effetto vola"
            style={{
              left: a - lato / 2 + (i - 1.5) * lato * 0.6, top: h * (0.25 + i * 0.1), width: lato, height: lato,
              animationDelay: `${0.3 + i * 0.1}s`,
              ["--dx" as string]: `${da - a}px`, ["--dir" as string]: `${dir}`,
            }}>
            <SvgOggetto tipo={oggetto} className="w-full h-full" />
          </div>
        ))}
      </>
    );
  }
  // lancio di un oggetto grande
  const grande = lato * 1.7;
  return (
    <div className="effetto vola"
      style={{
        left: a - grande / 2, top: h * 0.4, width: grande, height: grande,
        animationDelay: "0.3s",
        ["--dx" as string]: `${da - a}px`, ["--dir" as string]: `${dir}`,
      }}>
      <div style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }} className="w-full h-full">
        <SvgOggetto tipo={oggetto} className="w-full h-full" />
      </div>
    </div>
  );
}
