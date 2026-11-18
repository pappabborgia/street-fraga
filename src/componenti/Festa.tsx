"use client";
import { useEffect, useMemo, useState } from "react";
import type { Personaggio } from "@/gioco/personaggi";
import { audio } from "@/gioco/audio";
import { T } from "@/testi";
import { Chiesa } from "./Chiesa";
import { Lottatore } from "./Lottatore";
import { SvgOggetto } from "./Oggetti";
import { useMisure } from "./Arena";

/**
 * Festa di fine partita: circa 17 secondi, fatti di 11 scene brevi (ognuna al massimo 1,5 secondi),
 * senza lampeggi e senza animazioni infinite. Alla fine resta tutto fermo sulla scena finale.
 */
export const DURATA_SCENA = 1550;
const SCENE = 11;
const COLORI = ["#009246", "#f4f5f0", "#ce2b37", "#ffd23f", "#2b7bd6"];

export type Risultato = "vinto" | "perso" | "pari";

export function scegliSottotitolo(r: Risultato, vincitore: string, perdente: string, seme: number) {
  const elenco = r === "vinto" ? T.sottotitoliVinto : r === "perso" ? T.sottotitoliPerso : T.sottotitoliPari;
  return elenco[seme % elenco.length].replace("{vincitore}", vincitore).replace("{perdente}", perdente);
}

export function Festa({ me, lui, risultato, className = "" }: {
  me: Personaggio; lui: Personaggio; risultato: Risultato; seme: number; className?: string;
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

  const fh = h * 0.7;
  const fw = fh * (210 / 300);
  const margine = Math.max(w * 0.04, w / 2 - fw - h * 0.12);
  const spinta = Math.max(0, w - 2 * margine - 2 * fw + fw * 0.2);

  // Chi festeggia e chi no (al pareggio festeggiano tutti e due)
  const vinceIo = risultato !== "perso";
  const vinceLui = risultato !== "vinto";
  const anim = (vince: boolean) => {
    switch (scena) {
      case 1: return vince ? "festa-salto" : "festa-gira";
      case 2: return vince ? "festa-capriola" : "festa-siede";
      case 3: return vince ? "festa-braccia" : "festa-seduto";
      case 4: return vince ? "festa-lancia" : "festa-seduto";
      case 5: return vince ? "festa-salto" : "festa-seduto";
      case 6: return vince ? "festa-braccia" : "festa-rialza";
      case 7: case 8: return "anim-stretta";
      case 9: return "festa-inchino festa-vicini";
      case 10: return "festa-vicini";
      default: return "";
    }
  };

  const centri = { io: margine + fw / 2, lui: w - margine - fw / 2 };
  const vincitore = risultato === "perso" ? lui : me;
  const titolo = risultato === "vinto" ? T.titoloVinto : risultato === "perso" ? T.titoloPerso : T.titoloPari;

  return (
    <div ref={ref} className={`arena ${className}`} style={{ ["--spinta" as string]: `${spinta}px` }} aria-hidden="true">
      <Chiesa />
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

      <div key={`io-${scena}`} className={`lott ${anim(vinceIo)}`} style={{ left: margine, height: "70%" }}>
        <Lottatore p={me} verso="destra" />
        {!vinceIo && scena >= 1 && scena <= 5 && <Stordito />}
      </div>
      <div key={`lui-${scena}`} className={`lott cpu ${anim(vinceLui)}`} style={{ right: margine, height: "70%" }}>
        <Lottatore p={lui} verso="sinistra" />
        {!vinceLui && scena >= 1 && scena <= 5 && <Stordito />}
      </div>

      {/* Il vincitore lancia in aria il suo oggetto */}
      {scena === 4 && (
        <div className="effetto su-e-giu" style={{ left: (risultato === "perso" ? centri.lui : centri.io) - 30, top: h * 0.35, width: 60, height: 60 }}>
          <SvgOggetto tipo={vincitore.speciale.oggetto} className="w-full h-full" />
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

function Stordito() {
  return (
    <div className="absolute left-[20%] right-[10%] top-[-6%] flex justify-center gap-1 stordito fumetto text-[1.5rem] text-[#ffd23f]" style={{ WebkitTextStroke: "2px #1a1a1a" }}>
      <span>★</span><span>★</span><span>★</span>
    </div>
  );
}

function Fuoco({ x, y, ritardo, colore }: { x: number; y: number; ritardo: number; colore: string }) {
  const raggi = useMemo(() => Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2), []);
  return (
    <>
      {raggi.map((a, i) => (
        <div key={i} className="effetto scintilla"
          style={{
            left: x - 6, top: y - 6, width: 12, height: 12, background: colore,
            ["--x" as string]: `${Math.cos(a) * 70}px`, ["--y" as string]: `${Math.sin(a) * 70}px`,
            animationDelay: `${ritardo}s`,
          }} />
      ))}
    </>
  );
}

function Coriandoli({ w, h, seme, taralli }: { w: number; h: number; seme: number; taralli: boolean }) {
  const pezzi = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const r = ((i * 9301 + seme * 49297) % 233280) / 233280;
    return { x: r * w, y: h * (0.55 + ((i * 7) % 40) / 100), ritardo: (i % 7) * 0.08, colore: COLORI[i % COLORI.length], giro: (i % 2 ? 1 : -1) * (180 + (i % 4) * 90) };
  }), [w, h, seme]);
  return (
    <>
      {pezzi.map((p, i) =>
        taralli && i % 3 === 0 ? (
          <div key={i} className="effetto cade" style={{ left: p.x, top: p.y, width: 34, height: 34, animationDelay: `${p.ritardo}s`, ["--giro" as string]: `${p.giro}deg` }}>
            <SvgOggetto tipo="tarallo" className="w-full h-full" />
          </div>
        ) : (
          <div key={i} className="effetto cade coriandolo" style={{ left: p.x, top: p.y, background: p.colore, animationDelay: `${p.ritardo}s`, ["--giro" as string]: `${p.giro}deg` }} />
        ),
      )}
    </>
  );
}
