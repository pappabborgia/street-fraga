import type { Oggetto } from "@/gioco/personaggi";

const N = "#1a1a1a";

/** Oggetti dei colpi speciali, disegnati in un riquadro 0 0 60 60. */
export function DisegnoOggetto({ tipo }: { tipo: Oggetto }) {
  switch (tipo) {
    case "tarallo":
      return (
        <g>
          <circle cx={30} cy={30} r={18} fill="none" stroke={N} strokeWidth={14} />
          <circle cx={30} cy={30} r={18} fill="none" stroke="#e2b46a" strokeWidth={9} />
          <path d="M18 22 L22 26 M36 14 L38 19 M44 34 L40 36" stroke="#a8742f" strokeWidth={2} />
        </g>
      );
    case "oliva":
      return (
        <g stroke={N} strokeWidth={3}>
          <path d="M30 16 Q44 6 50 14 Q40 22 30 16 Z" fill="#5d8a3a" />
          <ellipse cx={28} cy={34} rx={13} ry={17} fill="#4a5a1f" transform="rotate(-20 28 34)" />
          <ellipse cx={24} cy={28} rx={3} ry={5} fill="#9cb04a" stroke="none" />
        </g>
      );
    case "moneta":
      return (
        <g stroke={N} strokeWidth={3}>
          <circle cx={30} cy={30} r={20} fill="#f2c230" />
          <circle cx={30} cy={30} r={14} fill="none" stroke="#a87b00" strokeWidth={2} />
          <path d="M30 20 L33 27 L40 27 L34 32 L36 39 L30 35 L24 39 L26 32 L20 27 L27 27 Z" fill="#fff2a8" strokeWidth={1.5} />
        </g>
      );
    case "cioccolato":
      return (
        <g stroke={N} strokeWidth={3}>
          <rect x={8} y={14} width={44} height={32} rx={3} fill="#6b3a1e" />
          <path d="M22.7 14 L22.7 46 M37.3 14 L37.3 46 M8 30 L52 30" stroke="#4a2410" strokeWidth={2.5} />
        </g>
      );
    case "uva":
      return (
        <g stroke={N} strokeWidth={2}>
          <path d="M30 4 L30 14" strokeWidth={4} stroke="#5a3a1a" />
          <path d="M32 10 Q46 4 50 14 Q40 18 32 10 Z" fill="#5d8a3a" />
          {[[22, 18], [34, 18], [46, 20], [16, 30], [28, 30], [40, 30], [22, 42], [34, 42], [28, 53]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={7} fill="#5b1f4a" />
          ))}
        </g>
      );
    case "nota":
      return (
        <g fill="#ffd23f" stroke={N} strokeWidth={3}>
          <ellipse cx={20} cy={46} rx={10} ry={7} transform="rotate(-20 20 46)" />
          <rect x={27} y={10} width={5} height={36} />
          <path d="M32 10 Q48 16 46 32 Q42 22 32 20 Z" />
        </g>
      );
    case "campana":
      return (
        <g stroke={N} strokeWidth={3}>
          <rect x={26} y={2} width={8} height={8} fill="#8a6a1a" />
          <path d="M14 46 Q14 12 30 10 Q46 12 46 46 L52 50 L8 50 Z" fill="#d9a531" />
          <circle cx={30} cy={53} r={5} fill="#8a6a1a" />
          <path d="M20 22 Q22 16 28 14" fill="none" stroke="#fff0b0" strokeWidth={3} />
        </g>
      );
    case "aquila":
      return (
        <g fill={N} stroke={N}>
          <path d="M30 22 L18 14 L4 18 L12 24 L2 30 L16 32 L22 40 L26 52 L30 46 L34 52 L38 40 L44 32 L58 30 L48 24 L56 18 L42 14 Z" />
          <circle cx={24} cy={12} r={5} />
          <circle cx={36} cy={12} r={5} />
          <path d="M19 12 L15 14 M41 12 L45 14" stroke="#d9a531" strokeWidth={3} />
        </g>
      );
    case "sedia":
      return (
        <g stroke={N} strokeWidth={3} fill="#b07a3e">
          <rect x={10} y={4} width={7} height={50} />
          <rect x={10} y={30} width={38} height={7} />
          <rect x={41} y={30} width={7} height={24} />
          <path d="M13 14 L40 26" stroke="#6b4a24" strokeWidth={4} fill="none" />
        </g>
      );
    case "mattarello":
      return (
        <g stroke={N} strokeWidth={3}>
          <rect x={4} y={24} width={52} height={14} rx={7} fill="#e1b97a" />
          <rect x={0} y={27} width={8} height={8} rx={3} fill="#b8864a" />
          <rect x={52} y={27} width={8} height={8} rx={3} fill="#b8864a" />
          <path d="M14 28 L46 28" stroke="#f3d6a4" strokeWidth={2} />
        </g>
      );
    case "ciabatta":
      return (
        <g stroke={N} strokeWidth={3}>
          <path d="M6 40 Q4 26 18 24 L48 22 Q58 24 56 34 Q54 42 42 42 L14 46 Q6 46 6 40 Z" fill="#8e2a2a" />
          <path d="M22 24 Q30 12 40 22" fill="#c94f4f" />
          <path d="M8 44 L54 38" stroke="#4a1a1a" strokeWidth={4} />
        </g>
      );
    case "motorino":
      return (
        <g stroke={N} strokeWidth={3}>
          <circle cx={12} cy={46} r={9} fill="#333" />
          <circle cx={48} cy={46} r={9} fill="#333" />
          <path d="M10 40 L22 26 L40 26 L50 40 Z" fill="#1f8a4c" />
          <path d="M40 26 L44 10 L52 10" fill="none" strokeWidth={4} />
          <rect x={18} y={20} width={16} height={6} rx={3} fill="#111" />
          <path d="M0 30 L6 30 M0 36 L6 36" stroke="#888" strokeWidth={2} />
        </g>
      );
  }
}

export function SvgOggetto({ tipo, className = "" }: { tipo: Oggetto; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      <DisegnoOggetto tipo={tipo} />
    </svg>
  );
}

/** Fiamma da fumetto: tre lingue di fuoco una dentro l'altra. */
export function Fiamma({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={className} style={style} aria-hidden="true">
      <path d="M30 78 Q4 74 6 50 Q8 34 18 22 Q16 36 24 40 Q20 20 34 2 Q36 22 46 30 Q50 22 48 14 Q58 30 56 50 Q56 74 30 78 Z"
        fill="#d4140f" stroke={N} strokeWidth={3} strokeLinejoin="round" />
      <path d="M30 74 Q14 70 15 54 Q16 44 24 36 Q24 46 30 48 Q28 32 38 20 Q40 36 46 42 Q50 52 46 62 Q42 72 30 74 Z" fill="#ff7a00" />
      <path d="M30 72 Q22 68 22 58 Q22 52 28 46 Q30 54 34 54 Q34 46 38 40 Q42 50 40 60 Q38 70 30 72 Z" fill="#ffd23f" />
    </svg>
  );
}
