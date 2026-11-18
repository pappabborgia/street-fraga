"use client";
import { useEffect, useRef, useState } from "react";
import type { Oggetto, Personaggio, Speciale, Stile } from "@/gioco/personaggi";
import { type Luogo, Sfondo } from "./Sfondi";
import { Lottatore } from "./Lottatore";
import { Fiamma, SvgOggetto } from "./Oggetti";
import { Animato, anima, braccio, corpo, type NomeMossa } from "./movimento";

export type Lato = "giocatore" | "computer";
export interface Azione {
  chi: Lato;
  tipo: "colpo" | "speciale" | "manca";
  scritta: string;
  chiave: number;
  stile?: Stile;
  oggetto?: Oggetto;
  speciale?: Speciale;
}

/** Quando arriva il colpo (secondi dall'inizio): tutto dura al massimo 1,5 secondi. */
export const MOMENTO_COLPO: Record<Stile | "speciale", number> = {
  salto: 0.85, capriola: 0.7, carica: 0.5, lancio: 0.85, speciale: 0.95,
};

interface Misure { w: number; h: number }

export function useMisure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [m, setM] = useState<Misure>({ w: 360, h: 240 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setM({ w: r.width, h: r.height });
    const ro = new ResizeObserver(([e]) => setM({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, m] as const;
}

/** Posizioni dei lottatori calcolate sullo spazio disponibile. */
export function geometria(w: number, h: number, altezza = 0.82, aria = 0.08) {
  const fh = h * altezza;
  const fw = fh * (210 / 300);
  const margine = Math.max(w * 0.02, w / 2 - fw - h * aria);
  const spinta = Math.max(0, w - 2 * margine - 2 * fw + fw * 0.2);
  return { fh, fw, margine, spinta, centro: { giocatore: margine + fw * 0.5, computer: w - margine - fw * 0.5 } };
}

export function Arena({
  giocatore, computer, azione = null, ko = null, stretta = false, className = "", luogo = "chiesa",
}: {
  giocatore: Personaggio; computer: Personaggio; azione?: Azione | null;
  ko?: Lato | null; stretta?: boolean; className?: string; luogo?: Luogo;
}) {
  const [ref, { w, h }] = useMisure<HTMLDivElement>();
  const g = geometria(w, h);
  const refG = useRef<HTMLDivElement>(null);
  const refC = useRef<HTMLDivElement>(null);

  const stile = azione?.stile ?? "carica";
  const momento = azione?.tipo === "speciale" ? MOMENTO_COLPO.speciale : MOMENTO_COLPO[stile];

  // Avvia i movimenti dei due lottatori a ogni nuova azione
  useEffect(() => {
    const box = ref.current?.getBoundingClientRect();
    const { spinta } = geometria(box?.width ?? w, box?.height ?? h);
    const anim: (Animation | null)[] = [];
    for (const [lato, el] of [["giocatore", refG.current], ["computer", refC.current]] as const) {
      const d = lato === "giocatore" ? 1 : -1;
      let nome: NomeMossa | null = null;
      let ritardo = 0;
      if (stretta) nome = "stretta";
      else if (ko === lato) nome = "ko";
      else if (azione && azione.chi === lato) nome = azione.tipo === "manca" ? "manca" : azione.tipo === "speciale" ? "speciale" : stile;
      else if (azione && azione.tipo !== "manca") { nome = azione.tipo === "speciale" ? "subisce-forte" : "subisce"; ritardo = momento * 1000; }
      if (!nome) continue;
      anim.push(anima(el, corpo(nome, d, spinta, ritardo)));
      const b = el?.querySelector(".braccio-av");
      if (nome === "stretta") anim.push(anima(b, braccio("porgi", 1400)));
      else if (nome === "lancio") anim.push(anima(b, braccio("tiro", 1100)));
      else if (nome === "salto" || nome === "carica" || nome === "speciale") anim.push(anima(b, braccio("pugno", nome === "speciale" ? 1500 : nome === "salto" ? 1300 : 1100)));
    }
    return () => anim.forEach((a) => a?.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azione?.chiave, stretta, ko]);

  const attaccante = azione ? (azione.chi === "giocatore" ? giocatore : computer) : null;
  const bersaglio: Lato | null = azione ? (azione.chi === "giocatore" ? "computer" : "giocatore") : null;
  const dir = azione?.chi === "computer" ? -1 : 1;
  const sp = azione?.speciale;

  const fiammeAddosso = (lato: Lato) => {
    if (!azione || azione.chi !== lato || azione.tipo === "manca") return null;
    if (azione.tipo === "speciale") return <Aura />;
    if (stile === "carica") return <Scia dir={lato === "giocatore" ? 1 : -1} />;
    return null;
  };

  return (
    <div ref={ref} className={`arena ${className}`}>
      <Sfondo luogo={luogo} />
      {azione?.tipo === "speciale" && attaccante && (
        <div key={`buio-${azione.chiave}`} className="effetto inset-0 buio" aria-hidden="true" />
      )}
      <div ref={refG} key={`g-${azione?.chiave ?? 0}-${stretta}-${ko}`} className="lott" style={{ left: g.margine }}>
        {fiammeAddosso("giocatore")}
        <Lottatore p={giocatore} verso="destra" />
      </div>
      <div ref={refC} key={`c-${azione?.chiave ?? 0}-${stretta}-${ko}`} className="lott cpu" style={{ right: g.margine }}>
        {fiammeAddosso("computer")}
        <Lottatore p={computer} verso="sinistra" />
      </div>

      {azione && attaccante && bersaglio && (
        <div key={`e-${azione.chiave}`} aria-hidden="true">
          {azione.tipo === "colpo" && stile === "lancio" && azione.oggetto && (
            <Lancio oggetto={azione.oggetto} da={g.centro[azione.chi]} a={g.centro[bersaglio]} dir={dir} h={h} />
          )}
          {azione.tipo === "speciale" && sp && (
            <>
              <Striscione testo={sp.nome} />
              <EffettoSpeciale sp={sp} da={g.centro[azione.chi]} a={g.centro[bersaglio]} dir={dir} h={h} fw={g.fw} />
              <Fiammata x={g.centro[bersaglio]} h={h} fw={g.fw} ritardo={momento} />
            </>
          )}
          {azione.tipo !== "manca" && <Stelline x={g.centro[bersaglio]} y={h * 0.4} ritardo={momento} />}
          <Scritta
            testo={azione.scritta}
            x={azione.tipo === "manca" ? w / 2 : g.centro[bersaglio]}
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
          style={{ top: `${18 + i * 24}%`, [dir > 0 ? "right" : "left"]: `${i * 12}%`, rotate: `${dir > 0 ? -90 : 90}deg` }} />
      ))}
    </div>
  );
}

function Lancio({ oggetto, da, a, dir, h }: { oggetto: Oggetto; da: number; a: number; dir: number; h: number }) {
  const lato = Math.max(44, h * 0.2);
  const dx = da - a;
  return (
    <Animato className="effetto" style={{ left: a - lato / 2, top: h * 0.28, width: lato, height: lato, zIndex: 4 }}
      a={{
        durata: 1000, ritardo: 350, kf: [
          { offset: 0, transform: `translate(${dx}px, 0px) rotate(0deg)`, opacity: 0 },
          { offset: 0.06, opacity: 1 },
          { offset: 0.5, transform: `translate(0px, 0px) rotate(${dir * 540}deg)`, opacity: 1 },
          { offset: 1, transform: `translate(${dir * 30}px, ${h * 0.45}px) rotate(${dir * 900}deg)`, opacity: 1 },
        ],
      }}>
      <SvgOggetto tipo={oggetto} className="w-full h-full" />
    </Animato>
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
        <Animato key={i} className="effetto stellina fumetto" style={{ left: x - 14, top: y - 14 }}
          a={{ durata: 550, ritardo: ritardo * 1000, easing: "ease-out", kf: [
            { transform: "translate(0px, 0px) scale(0.4)", opacity: 0 },
            { offset: 0.05, opacity: 1 },
            { transform: `translate(${sx}px, ${sy}px) scale(1.1)`, opacity: 0 },
          ] }}>
          ★
        </Animato>
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
    <div className="effetto" style={{ left: x, top: y, translate: "-50% 0", zIndex: 6 }}>
      <div className="scoppio fumetto px-4 py-2 border-4 border-black rounded-[40%] text-[1.75rem] whitespace-nowrap"
        style={{ animationDelay: `${ritardo}s`, background: manca ? "#ffffff" : "#ffd23f", color: manca ? "#1d3a8a" : "#a10f0f", boxShadow: "0 4px 0 #1a1a1a" }}>
        {testo}
      </div>
    </div>
  );
}

const cade = (h: number, ritardo: number, giro: number) => ({
  durata: 800, ritardo: ritardo * 1000, easing: "cubic-bezier(.45,0,.9,.6)",
  kf: [{ transform: `translateY(${-1.2 * h}px) rotate(0deg)` }, { transform: `translateY(0px) rotate(${giro}deg)` }],
});

const vola = (dx: number, h: number, dir: number, ritardo: number) => ({
  durata: 900, ritardo: ritardo * 1000,
  kf: [
    { transform: `translate(${dx}px, 0px) rotate(0deg)` },
    { transform: `translate(${dx / 2}px, ${-0.18 * h}px) rotate(${dir * 180}deg)` },
    { transform: `translate(0px, 0px) rotate(${dir * 360}deg)` },
  ],
});

function EffettoSpeciale({ sp, da, a, dir, h, fw }: { sp: Speciale; da: number; a: number; dir: number; h: number; fw: number }) {
  const { effetto, oggetto } = sp;
  const lato = Math.max(36, h * 0.16);
  const ogg = <SvgOggetto tipo={oggetto} className="w-full h-full" />;
  switch (effetto) {
    case "pioggia": {
      const pezzi = [-0.5, 0.1, -0.2, 0.45, -0.05, 0.3, -0.38, 0.2, 0, 0.55, -0.6];
      return (
        <>
          {pezzi.map((o, i) => (
            <Animato key={i} className="effetto" a={cade(h, 0.45 + i * 0.05, (i % 2 ? 1 : -1) * 360)}
              style={{ left: a + o * fw * 1.2 - lato / 2, top: h * (0.62 + ((i * 37) % 25) / 100) - lato / 2, width: lato, height: lato, zIndex: 4 }}>
              {ogg}
            </Animato>
          ))}
        </>
      );
    }
    case "cade": {
      const grande = lato * 1.8;
      return (
        <Animato className="effetto" a={cade(h, 0.45, 0)} style={{ left: a - grande / 2, top: h * 0.26, width: grande, height: grande, zIndex: 4 }}>
          {ogg}
        </Animato>
      );
    }
    case "onda":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <div key={`c${i}`} className="effetto cerchio"
              style={{ left: da - h * 0.25, top: h * 0.25, width: h * 0.5, height: h * 0.5, animationDelay: `${0.25 + i * 0.15}s` }} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Animato key={`n${i}`} className="effetto" a={vola(da - a, h, dir, 0.3 + i * 0.1)}
              style={{ left: a - lato / 2 + (i - 1.5) * lato * 0.6, top: h * (0.25 + i * 0.1), width: lato, height: lato, zIndex: 4 }}>
              {ogg}
            </Animato>
          ))}
        </>
      );
    case "fuoco":
      // fiamme che salgono da terra sotto l'avversario, con gli oggetti che ci girano dentro
      return (
        <>
          {[-0.45, 0, 0.45].map((o, i) => (
            <div key={i} className="effetto fiammata" style={{ left: a + o * fw - fw * 0.4, bottom: 0, width: fw * 0.8, height: h * (0.6 + (i === 1 ? 0.25 : 0)) }}>
              <Fiamma className="w-full h-full" style={{ animationDelay: `${0.4 + i * 0.12}s`, animationDuration: "1s" }} />
            </div>
          ))}
          {[0, 1, 2].map((i) => (
            <Animato key={`o${i}`} className="effetto" a={vola(da - a, h, dir, 0.25 + i * 0.12)}
              style={{ left: a - lato / 2 + (i - 1) * lato * 0.7, top: h * 0.45, width: lato, height: lato, zIndex: 4 }}>
              {ogg}
            </Animato>
          ))}
        </>
      );
    case "vortice": {
      const raggio = fw * 0.6;
      return (
        <Animato className="effetto" style={{ left: a, top: h * 0.45, width: 0, height: 0, zIndex: 4 }}
          a={{ durata: 1200, ritardo: 250, easing: "ease-in-out", kf: [
            { transform: "rotate(0deg) scale(0.2)", opacity: 0 },
            { offset: 0.2, transform: `rotate(${dir * 120}deg) scale(1)`, opacity: 1 },
            { offset: 0.8, transform: `rotate(${dir * 480}deg) scale(1)`, opacity: 1 },
            { transform: `rotate(${dir * 600}deg) scale(0.3)`, opacity: 0 },
          ] }}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const ang = (i / 6) * Math.PI * 2;
            return (
              <div key={i} className="absolute" style={{ left: Math.cos(ang) * raggio - lato / 2, top: Math.sin(ang) * raggio - lato / 2, width: lato, height: lato }}>
                {ogg}
              </div>
            );
          })}
        </Animato>
      );
    }
    default: {
      // lancio di un oggetto grande
      const grande = lato * 1.7;
      return (
        <Animato className="effetto" a={vola(da - a, h, dir, 0.3)} style={{ left: a - grande / 2, top: h * 0.4, width: grande, height: grande, zIndex: 4 }}>
          <div style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }} className="w-full h-full">{ogg}</div>
        </Animato>
      );
    }
  }
}
