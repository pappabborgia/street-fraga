"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Aspetto, Personaggio } from "@/gioco/personaggi";
import { Volto } from "./Volto";

const NERO = "#1a1a1a";

/** Un arto disegnato come linea spessa con contorno da fumetto. */
function Arto({ d, colore, w = 22, righe }: { d: string; colore: string; w?: number; righe?: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={NERO} strokeWidth={w + 6} />
      <path d={d} stroke={colore} strokeWidth={w} />
      {righe && <path d={d} stroke={righe} strokeWidth={4} transform="translate(-6 0)" />}
    </g>
  );
}

const Pugno = ({ x, y, a }: { x: number; y: number; a: Aspetto }) => (
  <circle cx={x} cy={y} r={12} fill={a.pelle} stroke={NERO} strokeWidth={3} />
);

function Gambe({ a }: { a: Aspetto }) {
  const righe = a.dettaglio === "catena" ? a.maglia2 : undefined;
  const w = a.corpo === "magro" ? 18 : 24;
  if (a.corpo === "gonna") {
    return (
      <g>
        <Arto d="M84 250 L80 282" colore="#5a4a42" w={14} />
        <Arto d="M116 250 L122 282" colore="#5a4a42" w={14} />
        <ellipse cx={74} cy={285} rx={15} ry={8} fill={a.scarpe} stroke={NERO} strokeWidth={3} />
        <ellipse cx={128} cy={285} rx={15} ry={8} fill={a.scarpe} stroke={NERO} strokeWidth={3} />
        <path d="M64 168 L136 168 L152 262 Q100 274 48 262 Z" fill={a.maglia} stroke={NERO} strokeWidth={3} />
        {[70, 92, 114, 132].map((x, i) => (
          <circle key={i} cx={x} cy={200 + (i % 2) * 30} r={4} fill="#f4e8c8" />
        ))}
      </g>
    );
  }
  if (a.corpo === "tonaca") {
    return (
      <g>
        <ellipse cx={74} cy={286} rx={15} ry={7} fill={a.scarpe} stroke={NERO} strokeWidth={3} />
        <ellipse cx={130} cy={286} rx={15} ry={7} fill={a.scarpe} stroke={NERO} strokeWidth={3} />
        <path d="M64 140 L136 140 L152 282 L48 282 Z" fill={a.maglia} stroke={NERO} strokeWidth={3} />
        <path d="M100 150 L100 280" stroke="#3a3a48" strokeWidth={3} />
      </g>
    );
  }
  return (
    <g>
      <Arto d="M90 200 L76 278" colore={a.pantaloni} w={w} righe={righe} />
      <Arto d="M112 200 L128 278" colore={a.pantaloni} w={w} righe={righe} />
      <ellipse cx={70} cy={283} rx={17} ry={9} fill={a.scarpe} stroke={NERO} strokeWidth={3} />
      <ellipse cx={136} cy={283} rx={17} ry={9} fill={a.scarpe} stroke={NERO} strokeWidth={3} />
    </g>
  );
}

function Busto({ a, idQuadri }: { a: Aspetto; idQuadri: string }) {
  const largo = a.corpo === "magro" ? { x: 70, w: 60 } : { x: 64, w: 72 };
  return (
    <g>
      <rect x={largo.x} y={110} width={largo.w} height={a.corpo === "gonna" ? 70 : 100} rx={22}
        fill={a.maglia} stroke={NERO} strokeWidth={3} />
      {a.corpo === "pancia" && (
        <ellipse cx={106} cy={172} rx={44} ry={40} fill={a.maglia} stroke={NERO} strokeWidth={3} />
      )}
      {a.dettaglio === "grembiule" && (
        <g>
          <path d="M78 150 L126 150 L134 258 L70 258 Z" fill={`url(#${idQuadri})`} stroke={NERO} strokeWidth={3} />
          <path d="M84 150 L84 128 L120 128 L120 150" fill={`url(#${idQuadri})`} stroke={NERO} strokeWidth={3} />
        </g>
      )}
      {a.dettaglio === "gilet" && (
        <g fill={a.maglia2} stroke={NERO} strokeWidth={3}>
          <path d="M66 120 Q66 112 82 112 L94 112 L94 208 L66 208 Z" />
          <path d="M134 120 Q134 112 118 112 L108 112 L108 208 L134 208 Z" />
          <circle cx={101} cy={140} r={3} fill={NERO} />
          <circle cx={101} cy={165} r={3} fill={NERO} />
        </g>
      )}
      {a.dettaglio === "catena" && (
        <g>
          <path d="M100 112 L100 208" stroke="#d9d9d9" strokeWidth={3} />
          <path d="M66 140 L66 205 M134 140 L134 205" stroke={a.maglia2} strokeWidth={5} />
          <path d="M84 112 Q100 160 118 112" fill="none" stroke="#7a5a00" strokeWidth={9} />
          <path d="M84 112 Q100 160 118 112" fill="none" stroke="#ffcc33" strokeWidth={6} strokeDasharray="6 3" />
          <circle cx={101} cy={142} r={7} fill="#ffcc33" stroke="#7a5a00" strokeWidth={2} />
        </g>
      )}
      {a.dettaglio === "papillon" && (
        <g stroke={NERO} strokeWidth={2.5}>
          <path d="M86 112 L100 160 L114 112" fill="#e9e4d4" />
          <path d="M100 160 L100 205" />
          <path d="M88 116 L100 122 L88 128 Z M112 116 L100 122 L112 128 Z" fill={a.maglia2} />
          <path d="M118 165 Q130 175 122 185" fill="none" stroke="#d4a017" strokeWidth={3} />
          <circle cx={92} cy={175} r={3} fill={NERO} />
        </g>
      )}
      {a.dettaglio === "toppe" && (
        <g stroke={NERO} strokeWidth={2}>
          <path d="M78 112 L84 210 M122 112 L116 210" stroke={a.maglia2} strokeWidth={6} />
          <rect x={92} y={160} width={20} height={18} fill="#c9a66b" strokeDasharray="3 2" transform="rotate(-8 102 169)" />
          <rect x={74} y={128} width={14} height={14} fill="#8aa0b0" strokeDasharray="3 2" />
        </g>
      )}
      {a.dettaglio === "croce" && (
        <g>
          <path d="M84 112 L100 150 L116 112" fill="#ffffff" stroke={NERO} strokeWidth={2.5} />
          <rect x={112} y={150} width={18} height={18} fill="#ffffff" stroke={NERO} strokeWidth={2} />
          <rect x={115} y={153} width={12} height={12} fill={a.maglia} />
          <path d="M121 155 L121 163 M117 159 L125 159" stroke="#ffffff" strokeWidth={3} />
        </g>
      )}
      {a.dettaglio === "macchie" && (
        <g>
          <path d="M76 150 L126 150 L130 214 L72 214 Z" fill={a.maglia2} stroke={NERO} strokeWidth={3} />
          <circle cx={92} cy={175} r={6} fill="#9b3d7a" />
          <circle cx={112} cy={192} r={4} fill="#9b3d7a" />
        </g>
      )}
      {a.dettaglio === "alamari" && (
        <g stroke={a.maglia2} strokeWidth={4} strokeLinecap="round">
          {[132, 150, 168, 186].map((y) => <path key={y} d={`M80 ${y} L120 ${y}`} />)}
          <path d="M60 116 L80 112 M140 116 L120 112" strokeWidth={8} />
          {[132, 150, 168, 186].map((y) => <circle key={`b${y}`} cx={100} cy={y} r={3.5} fill={a.maglia2} stroke="none" />)}
        </g>
      )}
      {a.oggetto === "mazza" && (
        <g stroke={NERO} strokeWidth={3}>
          <ellipse cx={108} cy={182} rx={28} ry={34} fill="#f7f4ea" />
          <ellipse cx={108} cy={182} rx={28} ry={34} fill="none" stroke="#b3121f" strokeWidth={6} />
          <path d="M84 166 L132 198 M84 198 L132 166" stroke="#e0b13a" strokeWidth={2} />
        </g>
      )}
      {a.dettaglio === "collarino" && (
        <g>
          <rect x={94} y={108} width={14} height={9} fill="#ffffff" stroke={NERO} strokeWidth={2} />
          {[130, 146, 162, 178, 194].map((y) => <circle key={y} cx={101} cy={y} r={2.5} fill="#55556a" />)}
        </g>
      )}
      {a.dettaglio === "aquila" && (
        <g fill={a.maglia2}>
          <path d="M100 135 L88 128 L80 136 L70 132 L78 146 L72 152 L86 152 L94 166 L100 176 L106 166 L114 152 L128 152 L122 146 L130 132 L120 136 L112 128 Z" />
          <circle cx={92} cy={128} r={4} />
          <circle cx={108} cy={128} r={4} />
        </g>
      )}
    </g>
  );
}

function Testa({ a }: { a: Aspetto }) {
  const pelleScura = "rgba(0,0,0,0.15)";
  return (
    <g className="testa">
      <rect x={92} y={96} width={20} height={20} fill={a.pelle} stroke={NERO} strokeWidth={3} />
      {a.capigliatura === "crocchia" && <circle cx={76} cy={60} r={13} fill={a.capelli} stroke={NERO} strokeWidth={3} />}
      {a.capigliatura === "lunghi" && <path d="M76 60 Q70 100 84 108 L92 70 Z" fill={a.capelli} stroke={NERO} strokeWidth={3} />}
      <circle cx={104} cy={74} r={31} fill={a.pelle} stroke={NERO} strokeWidth={3} />
      {/* capelli */}
      {a.capigliatura === "ricci" &&
        [[80, 52], [92, 44], [106, 42], [120, 46], [130, 54], [78, 66], [86, 50]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={11} fill={a.capelli} stroke={NERO} strokeWidth={2.5} />
        ))}
      {(a.capigliatura === "corti" || a.capigliatura === "crocchia" || a.capigliatura === "lunghi") && (
        <path d="M74 74 Q72 42 106 42 Q132 42 134 60 Q114 52 96 58 Q86 62 84 78 Z" fill={a.capelli} stroke={NERO} strokeWidth={2.5} />
      )}
      {a.capigliatura === "pochi" && (
        <path d="M74 80 Q72 62 82 56 L86 76 Z" fill={a.capelli} stroke={NERO} strokeWidth={2.5} />
      )}
      {/* orecchio */}
      <circle cx={88} cy={80} r={7} fill={a.pelle} stroke={NERO} strokeWidth={2.5} />
      {/* barba */}
      {a.barba && (
        <path d="M80 84 Q86 112 108 108 Q128 106 134 88 Q120 100 104 98 Q90 96 80 84 Z" fill={a.capelli} stroke={NERO} strokeWidth={2.5} />
      )}
      {/* occhi */}
      <ellipse cx={113} cy={72} rx={6} ry={7} fill="#ffffff" stroke={NERO} strokeWidth={2} />
      <ellipse cx={128} cy={72} rx={5} ry={7} fill="#ffffff" stroke={NERO} strokeWidth={2} />
      <circle cx={116} cy={73} r={3} fill={NERO} />
      <circle cx={130} cy={73} r={3} fill={NERO} />
      {/* sopracciglia decise */}
      <path d="M106 60 L119 65 M124 65 L135 60" stroke={a.capigliatura === "pochi" || a.capelli === "#d9d9d9" ? "#555" : a.capelli} strokeWidth={4.5} strokeLinecap="round" />
      {/* naso */}
      <path d="M128 76 Q142 82 136 90 Q130 92 126 88" fill={a.pelle} stroke={NERO} strokeWidth={2.5} />
      <path d="M126 88 Q130 86 132 84" fill="none" stroke={pelleScura} strokeWidth={2} />
      {/* bocca */}
      <path d="M114 98 Q122 102 130 97" fill="none" stroke={NERO} strokeWidth={3} strokeLinecap="round" />
      {/* baffi */}
      {a.baffi === "folti" && <path d="M110 94 Q120 86 128 92 Q136 86 142 96 Q132 98 126 96 Q118 100 110 94 Z" fill={a.capelli === "#cfcfcf" ? "#e8e8e8" : a.capelli} stroke={NERO} strokeWidth={2} />}
      {a.baffi === "bianchi" && <path d="M110 94 Q120 86 128 92 Q136 86 142 96 Q132 98 126 96 Q118 100 110 94 Z" fill="#f2f2f2" stroke={NERO} strokeWidth={2} />}
      {a.baffi === "sottili" && <path d="M114 93 Q126 89 138 93" fill="none" stroke={NERO} strokeWidth={3} strokeLinecap="round" />}
      {/* occhiali */}
      {a.occhiali === "vista" && (
        <g fill="none" stroke={NERO} strokeWidth={2.5}>
          <circle cx={113} cy={72} r={9} />
          <circle cx={129} cy={72} r={8} />
          <path d="M122 72 L121 72 M104 72 L90 74" />
        </g>
      )}
      {a.occhiali === "sole" && (
        <g stroke={NERO} strokeWidth={2.5}>
          <rect x={104} y={64} width={18} height={13} rx={5} fill="#111" />
          <rect x={124} y={64} width={14} height={13} rx={5} fill="#111" />
          <path d="M122 69 L124 69 M104 68 L90 72" />
          <path d="M108 67 L114 67" stroke="#ffffff" strokeWidth={2} />
        </g>
      )}
      {/* cappelli */}
      {a.cappello === "fazzoletto" && (
        <g stroke={NERO} strokeWidth={3}>
          <path d="M70 80 Q66 40 104 38 Q138 38 138 62 Q122 52 100 54 Q84 58 82 86 Z" fill="#8e2a2a" />
          <path d="M78 84 L66 100 L84 96 Z" fill="#8e2a2a" />
          {[[90, 46], [112, 44], [126, 52], [80, 62]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.5} fill="#f4d35e" stroke="none" />
          ))}
        </g>
      )}
      {a.cappello === "coppola" && (
        <g stroke={NERO} strokeWidth={3}>
          <path d="M72 58 Q76 36 106 36 Q134 38 134 54 Z" fill="#6f6f6f" />
          <path d="M112 50 Q140 46 152 56 Q132 60 112 58 Z" fill="#5a5a5a" />
        </g>
      )}
      {a.cappello === "panama" && (
        <g stroke={NERO} strokeWidth={3}>
          <ellipse cx={104} cy={50} rx={46} ry={9} fill="#efe8d0" />
          <path d="M80 50 Q80 22 104 22 Q128 22 128 50 Z" fill="#efe8d0" />
          <path d="M80 44 L128 44" stroke={NERO} strokeWidth={7} />
        </g>
      )}
      {a.cappello === "paglia" && (
        <g stroke={NERO} strokeWidth={3}>
          <ellipse cx={104} cy={50} rx={54} ry={11} fill="#e8c766" />
          <path d="M80 50 Q82 24 104 24 Q126 24 128 50 Z" fill="#e8c766" />
          <path d="M80 44 L128 44" stroke="#8a2b2b" strokeWidth={5} />
        </g>
      )}
      {a.cappello === "banda" && (
        <g stroke={NERO} strokeWidth={3}>
          <path d="M76 52 L78 30 L132 30 L134 52 Z" fill="#1d2b5a" />
          <path d="M78 46 L134 46" stroke="#e0b13a" strokeWidth={5} />
          <path d="M116 52 Q140 52 148 60 Q128 62 112 56 Z" fill="#111" />
          <circle cx={104} cy={38} r={5} fill="#e0b13a" />
        </g>
      )}
      {a.cappello === "basco" && (
        <path d="M70 58 Q74 32 108 34 Q138 36 136 54 Q104 46 70 58 Z" fill="#3b3b4f" stroke={NERO} strokeWidth={3} />
      )}
      {a.cappello === "plis" && (
        <path d="M80 50 Q80 28 104 28 Q128 28 128 50 Z" fill="#f7f4ea" stroke={NERO} strokeWidth={3} />
      )}
    </g>
  );
}

function Oggetto({ a }: { a: Aspetto }) {
  switch (a.oggetto) {
    case "mattarello":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <rect x={150} y={88} width={16} height={90} rx={8} fill="#e1b97a" transform="rotate(20 158 133)" />
        </g>
      );
    case "zappa":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <rect x={160} y={40} width={9} height={170} rx={4} fill="#9a6b3a" transform="rotate(12 164 125)" />
          <path d="M176 38 L200 46 L196 70 L172 56 Z" fill="#9aa4ab" />
        </g>
      );
    case "bastone":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <rect x={160} y={140} width={8} height={145} rx={4} fill="#3b2412" />
          <circle cx={164} cy={138} r={9} fill="#e8b923" />
        </g>
      );
    case "sedia":
      return (
        <g stroke={NERO} strokeWidth={3} fill="#b07a3e" transform="rotate(-15 170 140)">
          <rect x={160} y={88} width={8} height={70} />
          <rect x={160} y={130} width={40} height={8} />
          <rect x={192} y={130} width={8} height={36} />
          <rect x={160} y={138} width={8} height={28} />
          <path d="M164 104 L196 120" stroke="#6b4a24" strokeWidth={4} fill="none" />
        </g>
      );
    case "orologio":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <rect x={142} y={146} width={22} height={10} fill="#d4a017" />
          <circle cx={153} cy={151} r={9} fill="#ffe680" />
          <path d="M153 151 L153 146 M153 151 L157 151" strokeWidth={2} />
        </g>
      );
    case "cesto":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <path d="M146 168 Q170 140 194 168" fill="none" strokeWidth={4} />
          <path d="M144 168 L196 168 L188 198 L152 198 Z" fill="#c69c5d" />
          {[[156, 162], [168, 158], [180, 162], [162, 152], [174, 152]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={6} fill="#5b1f4a" strokeWidth={2} />
          ))}
        </g>
      );
    case "mazza":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <rect x={154} y={98} width={7} height={50} fill="#d9c08a" transform="rotate(25 158 123)" />
          <circle cx={170} cy={98} r={11} fill="#f2f2f2" />
        </g>
      );
    case "libro":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <rect x={150} y={130} width={26} height={32} rx={3} fill="#2b1f3a" />
          <path d="M163 138 L163 154 M157 144 L169 144" stroke="#e0b13a" strokeWidth={3} />
        </g>
      );
    default:
      return null;
  }
}

/**
 * Filtro "a pixel": prende un punto ogni `passo` unità e lo allarga a quadretto,
 * così il disegno sembra fatto a pixel come gli sfondi. Funziona dentro l'SVG
 * (anche con il braccio che si muove), senza immagini in più da scaricare.
 * `scala` = pixel (CSS) per unità del disegno. Il punto preso è largo 1,5 pixel CSS: più piccolo,
 * su iPhone si perde e il lottatore diventa trasparente. I quadretti si allargano un filo
 * più del necessario, così tra uno e l'altro non resta mai un buco.
 */
function FiltroPixel({ id, x, y, w, h, passo = 3, scala }: { id: string; x: number; y: number; w: number; h: number; passo?: number; scala: number }) {
  const punto = 1.5 / Math.max(scala, 0.05);
  const cella = Math.max(passo, punto * 1.6);
  const raggio = (cella - punto) / 2 + punto * 0.35;
  const inizio = (cella - punto) / 2;
  return (
    <filter id={id} x={x} y={y} width={w} height={h} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB">
      <feFlood x={x + inizio} y={y + inizio} width={punto} height={punto} floodColor="#000" />
      <feComposite x={x} y={y} width={cella} height={cella} />
      <feTile x={x} y={y} width={w} height={h} result="punti" />
      <feComposite in="SourceGraphic" in2="punti" operator="in" />
      <feMorphology operator="dilate" radius={raggio} />
    </filter>
  );
}

/** Quanti pixel CSS vale un'unità del disegno (si aggiorna se l'elemento cambia misura). */
function useScala(unitaLarghezza: number, unitaAltezza: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [scala, setScala] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const misura = () => {
      const r = el.getBoundingClientRect();
      setScala(Math.min(r.width / unitaLarghezza, r.height / unitaAltezza));
    };
    misura();
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    return () => ro.disconnect();
  }, [unitaLarghezza, unitaAltezza]);
  return [ref, scala] as const;
}

export function Lottatore({ p, verso = "destra", className = "" }: { p: Personaggio; verso?: "destra" | "sinistra"; className?: string }) {
  const a = p.aspetto;
  const uid = useId().replace(/:/g, "");
  const idQuadri = `quadri-${uid}`;
  const idPixel = `pixel-${uid}`;
  const [refSvg, scala] = useScala(210, 300);
  const righe = a.dettaglio === "catena" ? a.maglia2 : undefined;
  const manica = a.corpo === "gonna" || a.corpo === "tonaca" ? a.maglia : a.maglia;
  return (
    <svg ref={refSvg} viewBox="0 0 210 300" className={`lottatore-svg ${className}`} aria-hidden="true"
      style={verso === "sinistra" ? { transform: "scaleX(-1)" } : undefined}>
      <defs>
        <pattern id={idQuadri} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#ffffff" />
          <rect width="6" height="6" fill="#d24b4b" />
          <rect x="6" y="6" width="6" height="6" fill="#d24b4b" />
        </pattern>
        <FiltroPixel id={idPixel} x={0} y={0} w={210} h={300} scala={scala} />
      </defs>
      <ellipse cx={104} cy={290} rx={62} ry={8} fill="rgba(0,0,0,0.35)" />
      <g filter={`url(#${idPixel})`}>
      <g className="braccio-dietro">
        <Arto d="M76 124 L80 166 L116 150" colore={manica} righe={righe} />
        <Pugno x={118} y={150} a={a} />
      </g>
      <Gambe a={a} />
      <Busto a={a} idQuadri={idQuadri} />
      <Testa a={a} />
      <g className="braccio-av">
        <Arto d="M128 124 L148 162 L160 138" colore={manica} righe={righe} />
        <Oggetto a={a} />
        <Pugno x={160} y={136} a={a} />
      </g>
      </g>
    </svg>
  );
}

/** Solo la faccia (disegno più curato, senza quadretti): griglia di scelta, barra dell'energia, torneo. */
export function Ritratto({ p, verso = "destra" }: { p: Personaggio; verso?: "destra" | "sinistra" }) {
  return (
    <svg viewBox="28 6 150 150" className="w-full h-full" aria-hidden="true"
      style={verso === "sinistra" ? { transform: "scaleX(-1)" } : undefined}>
      <Volto a={p.aspetto} />
    </svg>
  );
}
