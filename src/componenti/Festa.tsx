"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Personaggio } from "@/gioco/personaggi";
import { audio } from "@/gioco/audio";
import { T } from "@/testi";
import { type Luogo, Sfondo } from "./Sfondi";
import { Lottatore } from "./Lottatore";
import { SvgOggetto } from "./Oggetti";
import { geometria, useMisure } from "./Arena";
import { Animato, anima, braccio, corpo, type NomeMossa } from "./movimento";

/**
 * Festa di fine partita: circa 17 secondi, fatti di 11 scene brevi (ognuna al massimo 1,5 secondi),
 * senza lampeggi e senza animazioni infinite. Alla fine resta tutto fermo sulla scena finale.
 */
export const DURATA_SCENA = 1550;
const SCENE = 11;
export const COLORI = ["#009246", "#f4f5f0", "#ce2b37", "#ffd23f", "#2b7bd6"];

export type Risultato = "vinto" | "perso" | "pari";

export function scegliSottotitolo(r: Risultato, vincitore: string, perdente: string, seme: number) {
  const elenco = r === "vinto" ? T.sottotitoliVinto : r === "perso" ? T.sottotitoliPerso : T.sottotitoliPari;
  return elenco[seme % elenco.length].replace("{vincitore}", vincitore).replace("{perdente}", perdente);
}

export function Festa({ me, lui, risultato, className = "", luogo = "chiesa" }: {
  me: Personaggio; lui: Personaggio; risultato: Risultato; seme: number; className?: string; luogo?: Luogo;
}) {
  const [scena, setScena] = useState(0);
  const [ref, { w, h }] = useMisure<HTMLDivElement>();

  useEffect(() => {
    if (scena >= SCENE - 1) return;
    const t = setTimeout(() => setScena((s) => s + 1), DURATA_SCENA);
    return () => clearTimeout(t);
  }, [scena]);

  // Suoni della festa, legati alle scene (si vedono sempre anche gli effetti)
  useEffect(() => {
    if (scena === 0) { if (risultato === "perso") audio.trombone(); else audio.vittoria(); }
    if (scena === 3 || scena === 5) audio.fuochi();
    if (scena === 9) audio.vittoria();
  }, [scena, risultato]);

  const { margine, fw } = geometria(w, h, 0.7, 0.12);
  const refIo = useRef<HTMLDivElement>(null);
  const refLui = useRef<HTMLDivElement>(null);

  // Chi festeggia e chi no (al pareggio festeggiano tutti e due)
  const vinceIo = risultato !== "perso";
  const vinceLui = risultato !== "vinto";

  // Movimenti di ogni scena, con le Web Animations (funzionano anche su iPhone)
  useEffect(() => {
    const box = ref.current?.getBoundingClientRect();
    const S = geometria(box?.width ?? w, box?.height ?? h, 0.7, 0.12).spinta;
    const anim: (Animation | null)[] = [];
    for (const [el, d, vince] of [[refIo.current, 1, vinceIo], [refLui.current, -1, vinceLui]] as const) {
      const m = mossaFesta(scena, vince);
      if (m.corpo) anim.push(anima(el, corpo(m.corpo, d, S)));
      if (m.braccio) anim.push(anima(el?.querySelector(".braccio-av"), braccio(m.braccio, 1400)));
    }
    return () => anim.forEach((x) => x?.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scena]);

  const centri = { io: margine + fw / 2, lui: w - margine - fw / 2 };
  const vincitore = risultato === "perso" ? lui : me;
  const titolo = risultato === "vinto" ? T.titoloVinto : risultato === "perso" ? T.titoloPerso : T.titoloPari;

  return (
    <div ref={ref} className={`arena ${className}`} aria-hidden="true">
      <Sfondo luogo={luogo} />
      {/* Fuochi d'artificio */}
      {(scena === 3 || scena === 5 || scena === 10) && (
        <div key={`fuochi-${scena}`}>
          {[0.25, 0.5, 0.75].map((x, i) => (
            <Fuoco key={i} x={w * x} y={h * (0.18 + (i % 2) * 0.1)} ritardo={i * 0.25} colore={COLORI[(i + scena) % COLORI.length]} />
          ))}
        </div>
      )}
      {/* Coriandoli tricolore e taralli */}
      {(scena === 0 || scena === 2 || scena === 5 || scena === 10) && (
        <Coriandoli key={`cor-${scena}`} w={w} h={h} seme={scena} taralli={scena === 5} />
      )}

      <div ref={refIo} key={`io-${scena}`} className="lott" style={{ left: margine, height: "70%" }}>
        <Lottatore p={me} verso="destra" />
        {!vinceIo && scena >= 1 && scena <= 5 && <Stordito />}
      </div>
      <div ref={refLui} key={`lui-${scena}`} className="lott cpu" style={{ right: margine, height: "70%" }}>
        <Lottatore p={lui} verso="sinistra" />
        {!vinceLui && scena >= 1 && scena <= 5 && <Stordito />}
      </div>

      {/* Il vincitore lancia in aria il suo oggetto */}
      {scena === 4 && (
        <div className="effetto su-e-giu" style={{ left: (risultato === "perso" ? centri.lui : centri.io) - 30, top: h * 0.35, width: 60, height: 60 }}>
          <SvgOggetto tipo={vincitore.speciali[0].oggetto} className="w-full h-full" />
        </div>
      )}
      {/* Cuori quando si stringono la mano */}
      {scena === 8 && [0, 1, 2].map((i) => (
        <div key={i} className="effetto cuore fumetto" style={{ left: w / 2 - 20 + (i - 1) * 40, top: h * 0.3, animationDelay: `${i * 0.2}s` }}>♥</div>
      ))}
      {/* La banda suona */}
      {scena === 9 && [0, 1, 2, 3].map((i) => (
        <div key={i} className="effetto cuore" style={{ left: w * (0.2 + i * 0.2), top: h * 0.25, width: 40, height: 40, animationDelay: `${i * 0.15}s` }}>
          <SvgOggetto tipo="nota" className="w-full h-full" />
        </div>
      ))}

      {/* Scritta grande: resta sempre visibile */}
      <div className="effetto left-0 right-0 flex justify-center titolo-festa" style={{ top: h * 0.03 }}>
        <div className="fumetto testo-fuoco text-center leading-none" style={{ fontSize: "min(4rem, 12cqw)" }}>
          {titolo.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export function Stordito() {
  return (
    <div className="absolute left-[20%] right-[10%] top-[-6%] flex justify-center gap-1 stordito fumetto text-[1.5rem] text-[#ffd23f]" style={{ WebkitTextStroke: "2px #1a1a1a" }}>
      <span>★</span><span>★</span><span>★</span>
    </div>
  );
}

export function Fuoco({ x, y, ritardo, colore }: { x: number; y: number; ritardo: number; colore: string }) {
  const raggi = useMemo(() => Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2), []);
  return (
    <>
      {raggi.map((a, i) => (
        <Animato key={i} className="effetto scintilla"
          style={{ left: x - 6, top: y - 6, width: 12, height: 12, background: colore }}
          a={{ durata: 1300, ritardo: ritardo * 1000, easing: "ease-out", kf: [
            { transform: "translate(0px, 0px) scale(0.3)", opacity: 1 },
            { offset: 0.7, opacity: 1 },
            { transform: `translate(${Math.cos(a) * 70}px, ${Math.sin(a) * 70}px) scale(1)`, opacity: 0 },
          ] }} />
      ))}
    </>
  );
}

export function Coriandoli({ w, h, seme, taralli }: { w: number; h: number; seme: number; taralli: boolean }) {
  const pezzi = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const r = ((i * 9301 + seme * 49297) % 233280) / 233280;
    return { x: r * w, y: h * (0.55 + ((i * 7) % 40) / 100), ritardo: (i % 7) * 0.08, colore: COLORI[i % COLORI.length], giro: (i % 2 ? 1 : -1) * (180 + (i % 4) * 90) };
  }), [w, h, seme]);
  return (
    <>
      {pezzi.map((p, i) =>
        taralli && i % 3 === 0 ? (
          <Animato key={i} className="effetto" style={{ left: p.x, top: p.y, width: 34, height: 34 }} a={caduta(h, p.ritardo, p.giro)}>
            <SvgOggetto tipo="tarallo" className="w-full h-full" />
          </Animato>
        ) : (
          <Animato key={i} className="effetto coriandolo" style={{ left: p.x, top: p.y, background: p.colore }} a={caduta(h, p.ritardo, p.giro)} />
        ),
      )}
    </>
  );
}

const caduta = (h: number, ritardo: number, giro: number) => ({
  durata: 900, ritardo: ritardo * 1000, easing: "cubic-bezier(.45,0,.9,.6)",
  kf: [{ transform: `translateY(${-1.2 * h}px) rotate(0deg)` }, { transform: `translateY(0px) rotate(${giro}deg)` }],
});

/** Che cosa fa ogni lottatore in ogni scena della festa. */
function mossaFesta(scena: number, vince: boolean): { corpo: NomeMossa | null; braccio?: "alza" | "tiro" | "porgi" } {
  switch (scena) {
    case 1: return { corpo: vince ? "festa-salto" : "festa-gira" };
    case 2: return { corpo: vince ? "festa-capriola" : "festa-siede" };
    case 3: return vince ? { corpo: "festa-saltello", braccio: "alza" } : { corpo: "festa-seduto" };
    case 4: return vince ? { corpo: "lancio", braccio: "tiro" } : { corpo: "festa-seduto" };
    case 5: return { corpo: vince ? "festa-salto" : "festa-seduto" };
    case 6: return vince ? { corpo: "festa-saltello", braccio: "alza" } : { corpo: "festa-rialza" };
    case 7: case 8: return { corpo: "stretta", braccio: "porgi" };
    case 9: return { corpo: "festa-inchino" };
    case 10: return { corpo: "festa-vicini" };
    default: return { corpo: null };
  }
}
