"use client";
import { useEffect, useRef, useState } from "react";
import type { Personaggio } from "@/gioco/personaggi";
import { audio } from "@/gioco/audio";
import { T } from "@/testi";
import { Sfondo } from "./Sfondi";
import { Lottatore } from "./Lottatore";
import { SvgOggetto } from "./Oggetti";
import { useMisure } from "./Arena";
import { COLORI, Coriandoli, Fuoco } from "./Festa";
import { Animato, anima, braccio, corpo, type NomeMossa } from "./movimento";

/** La coppa d'oro della Disfida di Fragnànu. */
export function DisegnoCoppa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="oro" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b8860b" /><stop offset="0.45" stopColor="#ffe066" /><stop offset="1" stopColor="#c9961a" />
        </linearGradient>
      </defs>
      <g stroke="#1a1a1a" strokeWidth={4} strokeLinejoin="round">
        <path d="M24 30 Q2 30 6 54 Q10 76 36 78" fill="none" strokeWidth={9} />
        <path d="M24 30 Q2 30 6 54 Q10 76 36 78" fill="none" stroke="url(#oro)" strokeWidth={5} />
        <path d="M96 30 Q118 30 114 54 Q110 76 84 78" fill="none" strokeWidth={9} />
        <path d="M96 30 Q118 30 114 54 Q110 76 84 78" fill="none" stroke="url(#oro)" strokeWidth={5} />
        <path d="M20 14 L100 14 Q100 80 60 92 Q20 80 20 14 Z" fill="url(#oro)" />
        <rect x={52} y={90} width={16} height={22} fill="url(#oro)" />
        <path d="M34 112 L86 112 L92 128 L28 128 Z" fill="url(#oro)" />
        <rect x={22} y={128} width={76} height={14} rx={3} fill="#5a3a1a" />
        <path d="M44 40 L52 52 L66 30" fill="none" stroke="#ffffff" strokeWidth={0} />
      </g>
      <path d="M60 30 L65 42 L78 42 L68 50 L72 63 L60 55 L48 63 L52 50 L42 42 L55 42 Z" fill="#fff6c2" stroke="#1a1a1a" strokeWidth={2} />
      <path d="M30 22 Q32 50 44 70" fill="none" stroke="#fffbe0" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
    </svg>
  );
}

const SCENE = 20;
const DURATA_SCENA = 1500; // 20 scene da 1,5 secondi = 30 secondi

/** Che cosa fa il campione in ogni scena. */
function mossaCampione(scena: number): { corpo: NomeMossa | null; braccio?: "alza" } {
  if ([1, 11].includes(scena)) return { corpo: "festa-salto" };
  if ([7].includes(scena)) return { corpo: "festa-capriola" };
  if (scena >= 4 && [4, 6, 9, 13, 16, 18].includes(scena)) return { corpo: "festa-saltello", braccio: "alza" };
  if (scena >= 4) return { corpo: null, braccio: "alza" };
  return { corpo: null };
}

export function FestaCoppa({ me, battuti, className = "" }: { me: Personaggio; battuti: Personaggio[]; className?: string }) {
  const [scena, setScena] = useState(0);
  const [ref, { w, h }] = useMisure<HTMLDivElement>();
  const refMe = useRef<HTMLDivElement>(null);
  const refBattuti = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (scena >= SCENE - 1) return;
    const t = setTimeout(() => setScena((s) => s + 1), DURATA_SCENA);
    return () => clearTimeout(t);
  }, [scena]);

  useEffect(() => {
    if ([0, 10, 19].includes(scena)) audio.vittoria();
    if ([3, 6, 10, 15, 18].includes(scena)) audio.fuochi();
    const anim: (Animation | null)[] = [];
    const m = mossaCampione(scena);
    if (m.corpo) anim.push(anima(refMe.current, corpo(m.corpo, 1, 0)));
    if (m.braccio) anim.push(anima(refMe.current?.querySelector(".braccio-av"), braccio("alza", 900)));
    // gli avversari battuti applaudono saltellando, e alla fine fanno l'inchino
    const nomeBattuti: NomeMossa | null = [3, 8, 12, 17].includes(scena) ? "festa-saltello" : [14, 19].includes(scena) ? "festa-inchino" : null;
    if (nomeBattuti) refBattuti.current.forEach((el, i) => anim.push(anima(el, { ...corpo(nomeBattuti, i < 2 ? 1 : -1, 0), ritardo: i * 120 })));
    return () => anim.forEach((x) => x?.cancel());
  }, [scena]);

  const fh = h * 0.72;
  const fw = fh * (210 / 300);
  const xMe = w / 2 - fw / 2;
  const posBattuti = [0.02, 0.17, 0.83, 0.98];
  const coppaSuMano = scena >= 4;
  const latoCoppa = Math.min(h * 0.32, 130);

  return (
    <div ref={ref} className={`arena ${className}`} aria-hidden="true">
      <Sfondo luogo="piazza" />
      {/* raggi dorati dietro la coppa, prima che il campione la prenda */}
      {scena >= 1 && scena < 4 && (
        <Animato key={`raggi-${scena}`} className="effetto" style={{ left: w / 2 - h * 0.45, top: h * 0.02, width: h * 0.9, height: h * 0.9 }}
          a={{ durata: 1500, easing: "linear", kf: [{ transform: "rotate(0deg)", opacity: 0.8 }, { transform: "rotate(60deg)", opacity: 0.8 }] }}>
          <svg viewBox="-50 -50 100 100" className="w-full h-full">
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M0 0 L-4 -48 L4 -48 Z" fill="#ffe066" opacity={0.55} transform={`rotate(${i * 30})`} />
            ))}
          </svg>
        </Animato>
      )}
      {/* avversari battuti, sullo sfondo */}
      {battuti.map((p, i) => (
        <div key={`${p.id}-${scena}`} ref={(el) => { refBattuti.current[i] = el; }} className={`lott ${i >= 2 ? "cpu" : ""}`}
          style={{ height: "45%", bottom: "26%", left: posBattuti[i] * w - fh * 0.45 * (210 / 300) * (i >= 2 ? 1 : 0) }}>
          <Lottatore p={p} verso={i < 2 ? "destra" : "sinistra"} />
        </div>
      ))}
      {/* il campione al centro */}
      <div ref={refMe} key={`me-${scena}`} className="lott" style={{ left: xMe, height: "72%" }}>
        <Lottatore p={me} verso="destra" />
      </div>
      {/* la coppa: scende dal cielo, poi il campione la tiene alzata */}
      {!coppaSuMano ? (
        <Animato key="coppa-scende" className="effetto" style={{ left: w / 2 - latoCoppa / 2, top: h * 0.16, width: latoCoppa, height: latoCoppa * 1.25, zIndex: 5 }}
          a={{ durata: 1400, easing: "ease-out", kf: [{ transform: `translateY(${-h}px) rotate(-20deg)` }, { offset: 0.8, transform: "translateY(10px) rotate(4deg)" }, { transform: "translateY(0px) rotate(0deg)" }] }}>
          <DisegnoCoppa className="w-full h-full" />
        </Animato>
      ) : (
        <div className="effetto" style={{ left: xMe + fw * 0.55, top: h * 0.14, width: latoCoppa * 0.8, height: latoCoppa, zIndex: 5 }}>
          <DisegnoCoppa className="w-full h-full" />
        </div>
      )}
      {/* fuochi, coriandoli, taralli, note e cuori */}
      {[3, 6, 10, 15, 18].includes(scena) && (
        <div key={`fuochi-${scena}`}>
          {[0.2, 0.5, 0.8].map((x, i) => <Fuoco key={i} x={w * x} y={h * (0.15 + (i % 2) * 0.12)} ritardo={i * 0.25} colore={COLORI[(i + scena) % COLORI.length]} />)}
        </div>
      )}
      {[1, 5, 8, 13, 17].includes(scena) && <Coriandoli key={`cor-${scena}`} w={w} h={h} seme={scena} taralli={scena === 5 || scena === 17} />}
      {[7, 12].includes(scena) && [0, 1, 2, 3, 4].map((i) => (
        <div key={`n-${scena}-${i}`} className="effetto cuore" style={{ left: w * (0.1 + i * 0.2), top: h * 0.25, width: 40, height: 40, animationDelay: `${i * 0.15}s` }}>
          <SvgOggetto tipo="nota" className="w-full h-full" />
        </div>
      ))}
      {scena === 9 && [0, 1, 2].map((i) => (
        <div key={`c-${i}`} className="effetto cuore fumetto" style={{ left: w / 2 - 20 + (i - 1) * 50, top: h * 0.35, animationDelay: `${i * 0.2}s` }}>♥</div>
      ))}
      <div className="effetto left-0 right-0 flex justify-center titolo-festa" style={{ top: h * 0.02 }}>
        <div className="fumetto testo-fuoco text-center leading-none" style={{ fontSize: "min(3rem, 9cqw)" }}>{T.campione.toUpperCase()}</div>
      </div>
    </div>
  );
}
