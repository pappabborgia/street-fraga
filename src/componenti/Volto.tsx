/**
 * Volto dei lottatori per i ritratti (scelta del personaggio, barra dell'energia, tabellone del torneo).
 * Disegno più grande e curato della testa del lottatore intero: mascella, zigomi in ombra,
 * occhi con iride e riflesso, sopracciglia decise, rughe per i più anziani. Niente quadretti.
 * Tutto disegnato da noi in SVG, a partire dall'"aspetto" del personaggio.
 */
import type { Aspetto } from "@/gioco/personaggi";

const NERO = "#1a1a1a";

/** Scurisce (k > 0) o schiarisce (k < 0) un colore #rrggbb. */
function tono(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(k >= 0 ? v * (1 - k) : v + (255 - v) * -k),
  );
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** I capelli grigi o bianchi dicono che il personaggio è avanti con gli anni: qualche ruga in più. */
function anziano(a: Aspetto) {
  const n = parseInt(a.capelli.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return Math.max(r, g, b) - Math.min(r, g, b) < 20 && r > 120;
}

export function Volto({ a }: { a: Aspetto }) {
  const pelle = a.pelle;
  const ombra = tono(pelle, 0.18);
  const ombraForte = tono(pelle, 0.32);
  const luce = tono(pelle, -0.25);
  const capelli = a.capelli;
  const ciglia = anziano(a) ? tono(capelli, 0.35) : tono(capelli, 0.1);
  const vecchio = anziano(a);
  const sorriso = a.occhiali === "sole"; // i tipi con gli occhiali da sole fanno il sorrisetto

  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* spalle con il vestito */}
      <path d="M14 200 Q22 160 66 150 L134 150 Q178 160 186 200 Z" fill={a.maglia} stroke={NERO} strokeWidth={3.5} />
      <path d="M66 150 Q100 182 134 150" fill="none" stroke={tono(a.maglia, 0.3)} strokeWidth={3} />
      <Colletto a={a} />

      {/* collo */}
      <path d="M80 118 L78 156 Q100 168 122 156 L120 118 Z" fill={pelle} stroke={NERO} strokeWidth={3.5} />
      <path d="M80 130 Q100 146 120 130 L120 140 Q100 152 80 140 Z" fill={ombra} />

      {/* capelli dietro */}
      {a.capigliatura === "crocchia" && <circle cx={58} cy={70} r={18} fill={capelli} stroke={NERO} strokeWidth={3.5} />}
      {a.capigliatura === "lunghi" && <path d="M58 70 Q46 130 74 146 L80 90 Z" fill={capelli} stroke={NERO} strokeWidth={3.5} />}

      {/* testa: mascella squadrata, mento deciso */}
      <path d="M58 82 Q56 36 100 30 Q146 30 148 80 Q150 106 142 126 Q132 152 106 157 Q80 157 68 136 Q58 118 58 82 Z"
        fill={pelle} stroke={NERO} strokeWidth={3.5} />
      {/* ombra sul lato lontano e sotto lo zigomo */}
      <path d="M58 82 Q56 112 68 136 Q80 155 100 157 Q80 140 76 112 Q72 92 76 66 Q62 68 58 82 Z" fill={ombra} />
      <path d="M118 120 Q134 116 142 104 Q142 118 136 128 Q126 128 118 120 Z" fill={ombra} />
      {/* luce sulla fronte e sul naso */}
      <path d="M104 40 Q130 40 138 60 Q122 50 104 50 Z" fill={luce} opacity={0.7} />

      {/* orecchio */}
      <path d="M66 84 Q48 82 50 100 Q52 118 68 116" fill={pelle} stroke={NERO} strokeWidth={3} />
      <path d="M62 92 Q55 99 61 108" fill="none" stroke={ombraForte} strokeWidth={2.5} />

      {/* capelli sopra */}
      <Capelli a={a} />

      {/* barba */}
      {a.barba && (
        <g>
          <path d="M64 112 Q68 150 100 160 Q134 158 146 116 Q138 140 120 144 Q112 140 104 144 Q84 144 64 112 Z"
            fill={capelli} stroke={NERO} strokeWidth={3} />
          <path d="M78 136 L80 142 M92 146 L93 151 M130 140 L128 146 M116 148 L116 153" stroke={tono(capelli, -0.25)} strokeWidth={2} />
        </g>
      )}

      {/* occhi */}
      {a.occhiali !== "sole" && (
        <g>
          {vecchio && <path d="M82 102 Q92 106 102 101 M116 101 Q126 106 136 101" fill="none" stroke={ombraForte} strokeWidth={2} />}
          <path d="M80 92 Q92 83 104 92 Q92 99 80 92 Z" fill="#fff" stroke={NERO} strokeWidth={2.5} />
          <path d="M114 92 Q126 84 138 91 Q126 99 114 92 Z" fill="#fff" stroke={NERO} strokeWidth={2.5} />
          <circle cx={95} cy={92} r={5} fill="#5b3a1e" />
          <circle cx={129} cy={92} r={5} fill="#5b3a1e" />
          <circle cx={95} cy={92} r={2.4} fill={NERO} />
          <circle cx={129} cy={92} r={2.4} fill={NERO} />
          <circle cx={96.5} cy={90.5} r={1.3} fill="#fff" />
          <circle cx={130.5} cy={90.5} r={1.3} fill="#fff" />
          {/* palpebra di sopra, spessa: sguardo deciso */}
          <path d="M79 91 Q92 81 105 90 M113 90 Q126 82 139 89" fill="none" stroke={NERO} strokeWidth={3.5} />
        </g>
      )}
      {/* sopracciglia a V: grinta da lottatore */}
      <path d="M76 76 L104 82 L104 88 L78 83 Z" fill={ciglia} stroke={NERO} strokeWidth={2} />
      <path d="M114 82 L140 73 L142 80 L116 88 Z" fill={ciglia} stroke={NERO} strokeWidth={2} />
      {/* ruga tra le sopracciglia */}
      <path d="M108 80 L108 90" stroke={ombraForte} strokeWidth={2.5} />

      {/* naso */}
      <path d="M110 92 Q112 106 118 114" fill="none" stroke={ombra} strokeWidth={3} />
      <path d="M108 118 Q114 126 124 124 Q132 120 128 112 Q124 106 118 104" fill={pelle} stroke={NERO} strokeWidth={3} />
      <path d="M104 116 Q102 122 108 124" fill="none" stroke={NERO} strokeWidth={2.5} />
      <ellipse cx={117} cy={121} rx={3} ry={1.8} fill={ombraForte} />

      {/* rughe dei più anziani */}
      {vecchio && (
        <g fill="none" stroke={ombraForte} strokeWidth={2}>
          <path d="M84 58 Q100 53 120 58 M88 66 Q102 62 118 66" />
          <path d="M102 122 Q96 132 98 142 M132 120 Q138 130 135 140" />
          <path d="M141 86 L148 83 M141 93 L148 94" />
        </g>
      )}

      {/* bocca */}
      {sorriso ? (
        <path d="M100 136 Q116 140 132 128" fill="none" stroke={NERO} strokeWidth={3.5} />
      ) : (
        <path d="M100 136 Q116 133 132 135" fill="none" stroke={NERO} strokeWidth={3.5} />
      )}
      <path d="M106 142 Q116 145 126 141" fill="none" stroke={ombraForte} strokeWidth={2.5} />
      {/* mento */}
      <path d="M106 151 Q114 153 122 150" fill="none" stroke={ombra} strokeWidth={2.5} />

      {/* baffi */}
      {(a.baffi === "folti" || a.baffi === "bianchi") && (
        <path d="M96 132 Q104 122 116 128 Q128 120 138 130 Q132 136 120 133 Q108 137 96 132 Z"
          fill={a.baffi === "bianchi" ? "#f2f2f2" : capelli === "#cfcfcf" ? "#e8e8e8" : capelli} stroke={NERO} strokeWidth={2.5} />
      )}
      {a.baffi === "sottili" && <path d="M100 129 Q116 124 134 128" fill="none" stroke={NERO} strokeWidth={3.5} />}

      {/* occhiali */}
      {a.occhiali === "vista" && (
        <g fill="none" stroke={NERO} strokeWidth={3}>
          <rect x={78} y={82} width={28} height={20} rx={8} />
          <rect x={112} y={82} width={28} height={20} rx={8} />
          <path d="M106 90 L112 90 M78 90 L64 88" />
          <path d="M82 86 L88 85 M116 86 L122 85" stroke="#fff" strokeWidth={2} />
        </g>
      )}
      {a.occhiali === "sole" && (
        <g stroke={NERO} strokeWidth={3}>
          <path d="M76 84 L106 86 Q106 100 92 101 Q78 100 76 84 Z" fill="#111" />
          <path d="M112 86 L142 82 Q142 98 128 100 Q114 100 112 86 Z" fill="#111" />
          <path d="M106 87 L112 87 M76 85 L62 86" />
          <path d="M82 89 L92 88 M118 89 L128 87" stroke="#fff" strokeWidth={2.5} />
        </g>
      )}

      <Cappello a={a} />
    </g>
  );
}

function Capelli({ a }: { a: Aspetto }) {
  const c = a.capelli;
  const riflesso = tono(c, -0.3);
  switch (a.capigliatura) {
    case "ricci":
      return (
        <g>
          {[[64, 70], [70, 50], [86, 36], [104, 30], [122, 34], [138, 46], [146, 62], [60, 90]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={15} fill={c} stroke={NERO} strokeWidth={3} />
          ))}
          <path d="M66 60 Q90 40 140 56 Q120 62 96 60 Q78 62 66 74 Z" fill={c} />
          {[[82, 40], [108, 34], [132, 46]].map(([x, y], i) => (
            <path key={i} d={`M${x - 5} ${y} Q${x} ${y - 5} ${x + 5} ${y}`} fill="none" stroke={riflesso} strokeWidth={2} />
          ))}
        </g>
      );
    case "pochi":
      return (
        <g stroke={NERO} strokeWidth={3}>
          <path d="M58 100 Q52 74 64 62 L74 68 Q66 80 68 100 Z" fill={c} />
          <path d="M146 72 Q150 82 148 92 L142 88 Q144 80 142 74 Z" fill={c} />
        </g>
      );
    default:
      // corti, crocchia, lunghi
      return (
        <g>
          <path d="M56 92 Q48 40 94 28 Q132 22 148 56 Q152 68 148 80 Q140 60 118 56 Q94 52 78 62 Q66 72 66 92 Z"
            fill={c} stroke={NERO} strokeWidth={3.5} />
          <path d="M74 46 Q92 36 112 36 M70 58 Q86 48 104 46 M118 40 Q134 44 142 56" fill="none" stroke={riflesso} strokeWidth={2.5} />
        </g>
      );
  }
}

function Colletto({ a }: { a: Aspetto }) {
  switch (a.dettaglio) {
    case "collarino":
      return <rect x={88} y={150} width={24} height={10} fill="#fff" stroke={NERO} strokeWidth={2.5} />;
    case "papillon":
      return (
        <g stroke={NERO} strokeWidth={2.5} fill={a.maglia2}>
          <path d="M100 160 L84 152 L84 170 Z" />
          <path d="M100 160 L116 152 L116 170 Z" />
          <circle cx={100} cy={160} r={4} />
        </g>
      );
    case "catena":
      return <path d="M74 160 Q100 190 126 160" fill="none" stroke="#e0b13a" strokeWidth={5} strokeDasharray="6 3" />;
    case "alamari":
      return <path d="M86 172 L114 172 M86 184 L114 184" stroke={a.maglia2} strokeWidth={4} />;
    case "grembiule":
      return <path d="M76 200 L80 170 L120 170 L124 200 Z" fill="#fff" stroke={NERO} strokeWidth={2.5} />;
    default:
      return <path d="M82 152 L100 176 L118 152" fill={a.maglia2} stroke={NERO} strokeWidth={2.5} />;
  }
}

function Cappello({ a }: { a: Aspetto }) {
  switch (a.cappello) {
    case "fazzoletto":
      return (
        <g stroke={NERO} strokeWidth={3.5}>
          <path d="M60 98 L40 124 L68 116 Z" fill="#7a2222" />
          <path d="M52 96 Q44 32 100 26 Q154 26 152 74 Q132 54 100 54 Q72 58 66 98 Z" fill="#8e2a2a" />
          {[[80, 40], [104, 34], [128, 40], [144, 58], [64, 62], [92, 48], [118, 48]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={5} fill="#f4d35e" stroke="none" />
          ))}
        </g>
      );
    case "coppola":
      return (
        <g stroke={NERO} strokeWidth={3.5}>
          <path d="M52 70 Q56 22 104 22 Q148 24 150 58 Q120 50 52 70 Z" fill="#6f6f6f" />
          <path d="M118 54 Q160 44 176 60 Q148 68 116 64 Z" fill="#555" />
          <path d="M70 46 Q100 34 132 40" fill="none" stroke="#8a8a8a" strokeWidth={2.5} />
        </g>
      );
    case "panama":
      return (
        <g stroke={NERO} strokeWidth={3.5}>
          <ellipse cx={100} cy={54} rx={72} ry={13} fill="#efe8d0" />
          <path d="M66 54 Q64 12 100 12 Q136 12 134 54 Z" fill="#efe8d0" />
          <path d="M66 44 L134 44" stroke={NERO} strokeWidth={8} />
        </g>
      );
    case "paglia":
      return (
        <g stroke={NERO} strokeWidth={3.5}>
          <ellipse cx={100} cy={54} rx={80} ry={15} fill="#e8c766" />
          <path d="M66 54 Q66 14 100 14 Q134 14 134 54 Z" fill="#e8c766" />
          <path d="M66 46 L134 46" stroke="#8a2b2b" strokeWidth={6} />
          <path d="M40 56 L60 52 M140 52 L160 56" stroke="#c9a640" strokeWidth={2} />
        </g>
      );
    case "banda":
      return (
        <g stroke={NERO} strokeWidth={3.5}>
          <path d="M62 58 L64 20 L140 20 L142 58 Z" fill="#1d2b5a" />
          <path d="M64 50 L142 50" stroke="#e0b13a" strokeWidth={6} />
          <path d="M112 58 Q152 56 166 70 Q138 72 108 64 Z" fill="#111" />
          <circle cx={102} cy={32} r={7} fill="#e0b13a" />
        </g>
      );
    case "basco":
      return (
        <g stroke={NERO} strokeWidth={3.5}>
          <path d="M50 72 Q54 28 106 28 Q154 30 152 62 Q104 50 50 72 Z" fill="#3b3b4f" />
          <path d="M102 28 L104 20" strokeWidth={4} />
        </g>
      );
    case "plis":
      return <path d="M64 56 Q64 16 102 16 Q140 16 140 56 Q102 46 64 56 Z" fill="#f7f4ea" stroke={NERO} strokeWidth={3.5} />;
    default:
      return null;
  }
}
