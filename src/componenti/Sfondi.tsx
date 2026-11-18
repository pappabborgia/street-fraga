/**
 * Sfondi delle sfide: luoghi di Fragagnano ridisegnati in stile videogioco (non copie delle foto).
 * Tutti usano lo stesso riquadro della chiesa: i lottatori stanno sul terreno in basso.
 */
import { Chiesa } from "./Chiesa";

export type Luogo = "chiesa" | "scuola" | "cappella" | "municipio" | "piazza";

export const NOMI_LUOGHI: Record<Luogo, string> = {
  chiesa: "Davanti alla chiesa",
  scuola: "Nel cortile della scuola",
  cappella: "Alla cappella in campagna",
  municipio: "Davanti al Municipio",
  piazza: "In piazza, vicino al monumento",
};

const W = 800, H = 450;
const L = "#2a2030"; // linee scure

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 55 ${W} ${H - 55}`} preserveAspectRatio="xMidYMin slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {children}
    </svg>
  );
}

function Nuvola({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g fill="#ffffff" opacity={0.9} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={40} ry={16} />
      <ellipse cx={30} cy={-8} rx={30} ry={18} />
      <ellipse cx={-28} cy={-4} rx={22} ry={12} />
    </g>
  );
}

/** Finestra con tapparella abbassata a metà. */
function Finestra({ x, y, w = 34, h = 40, colore = "#5c6670" }: { x: number; y: number; w?: number; h?: number; colore?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#2e3440" stroke={L} strokeWidth={2} />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h * 0.55} fill={colore} />
      {[0.15, 0.3, 0.45].map((k) => <line key={k} x1={x + 2} x2={x + w - 2} y1={y + h * k} y2={y + h * k} stroke="#3e4650" strokeWidth={1.5} />)}
      <rect x={x - 3} y={y + h} width={w + 6} height={4} fill="#c9c4b8" stroke={L} strokeWidth={1} />
    </g>
  );
}

function Bandiera({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={L} strokeWidth={1.5}>
      <line x1={x} y1={y} x2={x} y2={y + 70} strokeWidth={3} />
      <path d={`M${x} ${y + 2} q12 -6 22 0 v22 q-10 -6 -22 0 Z`} fill="#009246" />
      <path d={`M${x + 22} ${y + 2} q10 -5 20 0 v22 q-10 -5 -20 0 Z`} fill="#f4f5f0" />
      <path d={`M${x + 42} ${y + 2} q10 -5 20 0 v22 q-10 -5 -20 0 Z`} fill="#ce2b37" />
    </g>
  );
}

function Pino({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={L} strokeWidth={2}>
      <path d="M-6 0 Q-10 -80 -2 -150 L6 -150 Q2 -80 8 0 Z" fill="#7a5a3a" />
      <ellipse cx={-30} cy={-160} rx={55} ry={30} fill="#2f6b2a" />
      <ellipse cx={30} cy={-175} rx={60} ry={34} fill="#3a7d30" />
      <ellipse cx={0} cy={-200} rx={50} ry={28} fill="#448c35" />
    </g>
  );
}

function Panchina({ x, y, colore = "#3a5bbf" }: { x: number; y: number; colore?: string }) {
  return (
    <g stroke={L} strokeWidth={2}>
      <rect x={x} y={y} width={60} height={8} fill={colore} />
      <rect x={x} y={y - 16} width={60} height={8} fill={colore} />
      <line x1={x + 6} y1={y + 8} x2={x + 6} y2={y + 20} strokeWidth={3} />
      <line x1={x + 54} y1={y + 8} x2={x + 54} y2={y + 20} strokeWidth={3} />
    </g>
  );
}

function Arancio({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={L} strokeWidth={2}>
      <rect x={x - 4} y={y - 60} width={8} height={60} fill="#6b4a2a" />
      <circle cx={x} cy={y - 85} r={38} fill="#2f6b2a" />
      {[[-14, -95], [12, -80], [-4, -70], [18, -100]].map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={y + dy} r={4} fill="#f39c12" strokeWidth={1} />)}
    </g>
  );
}

function Scuola() {
  return (
    <Svg>
      <defs>
        <linearGradient id="cielo-scuola" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f7fd8" /><stop offset="1" stopColor="#9fd0f5" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cielo-scuola)" />
      <Nuvola x={620} y={95} /><Nuvola x={170} y={80} s={0.7} />
      <circle cx={60} cy={260} r={40} fill="#3a7d30" stroke={L} strokeWidth={2} />
      {/* edificio della scuola */}
      <rect x={70} y={110} width={680} height={210} fill="#e6e1d6" stroke={L} strokeWidth={3} />
      <rect x={70} y={104} width={680} height={12} fill="#d1cbbd" stroke={L} strokeWidth={2} />
      <rect x={300} y={92} width={450} height={14} fill="#d1cbbd" stroke={L} strokeWidth={2} />
      <rect x={70} y={290} width={680} height={30} fill="#cfc6b0" stroke={L} strokeWidth={2} />
      {[130, 190, 250, 330, 400, 470, 540, 610, 680].map((x) => (
        <g key={x}>
          <Finestra x={x} y={130} />
          <Finestra x={x} y={205} />
        </g>
      ))}
      {/* portico con le colonne e la ringhiera verde */}
      <rect x={60} y={262} width={200} height={14} fill="#ffffff" stroke={L} strokeWidth={2} />
      {[70, 120, 170, 220, 250].map((x) => <rect key={x} x={x} y={276} width={8} height={48} fill="#ffffff" stroke={L} strokeWidth={2} />)}
      <rect x={60} y={304} width={200} height={20} fill="#3a9a6a" opacity={0.85} stroke={L} strokeWidth={2} />
      <Bandiera x={150} y={200} />
      {/* cortile con le righe del campo */}
      <polygon points={`0,320 ${W},320 ${W},${H} 0,${H}`} fill="#b9b6ad" />
      <path d="M0 360 L800 360 M120 320 L40 450 M400 320 L400 450 M680 320 L760 450" stroke="#ffffff" strokeWidth={4} opacity={0.8} />
      <path d="M200 400 L600 400" stroke="#c0392b" strokeWidth={3} opacity={0.6} />
      <circle cx={400} cy={385} r={30} fill="none" stroke="#ffffff" strokeWidth={4} opacity={0.8} />
    </Svg>
  );
}

function Cappella() {
  return (
    <Svg>
      <defs>
        <linearGradient id="cielo-cappella" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f6fd1" /><stop offset="1" stopColor="#a9d6f7" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cielo-cappella)" />
      <Nuvola x={560} y={110} /><Nuvola x={700} y={160} s={0.8} /><Nuvola x={360} y={90} s={0.6} />
      {/* campagna in fondo */}
      <rect x={0} y={280} width={W} height={40} fill="#7fa64a" />
      <circle cx={720} cy={280} r={40} fill="#3a7d30" stroke={L} strokeWidth={2} />
      <circle cx={780} cy={285} r={30} fill="#2f6b2a" stroke={L} strokeWidth={2} />
      {/* fili della luce */}
      <path d="M150 120 Q450 150 800 110" stroke={L} strokeWidth={2} fill="none" />
      <rect x={640} y={150} width={7} height={170} fill="#c9c4b8" stroke={L} strokeWidth={1.5} />
      {/* pini */}
      <Pino x={90} y={330} s={1} />
      <Pino x={230} y={320} s={0.85} />
      {/* agavi */}
      {[60, 160, 250].map((x) => (
        <g key={x} fill="#5b8f6a" stroke={L} strokeWidth={1.5}>
          <path d={`M${x} 330 l-20 -40 l26 34 l4 -44 l8 44 l22 -34 l-16 40 Z`} />
        </g>
      ))}
      {/* cappella bianca */}
      <g stroke={L} strokeWidth={3}>
        <polygon points="380,320 380,175 480,120 580,175 580,320" fill="#f6f5f0" />
        <polygon points="580,320 580,262 615,262 625,320" fill="#ecebe4" />
        <path d="M440 220 Q480 180 520 220 Z" fill="#e2e0d6" />
        <rect x={452} y={240} width={56} height={80} fill="#9a4f2a" />
        <path d="M480 240 L480 320" strokeWidth={2} />
        <circle cx={480} cy={230} r={4} fill={L} strokeWidth={0} />
      </g>
      <path d="M480 120 L480 80 M466 94 L494 94" stroke="#2b5fd9" strokeWidth={7} strokeLinecap="round" />
      {/* piazzale */}
      <polygon points={`0,320 ${W},320 ${W},${H} 0,${H}`} fill="#cbbfa8" />
      <path d="M0 340 Q300 330 800 345" stroke="#b3a68d" strokeWidth={3} fill="none" />
      <Panchina x={30} y={348} /><Panchina x={110} y={352} />
    </Svg>
  );
}

function Municipio() {
  return (
    <Svg>
      <defs>
        <linearGradient id="cielo-municipio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9aa9b8" /><stop offset="1" stopColor="#dde3e8" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cielo-municipio)" />
      <Nuvola x={150} y={100} s={1.2} /><Nuvola x={660} y={80} />
      {/* case a sinistra in prospettiva */}
      <polygon points="0,150 170,190 170,320 0,330" fill="#e9b7b0" stroke={L} strokeWidth={2} />
      <polygon points="0,200 90,215 90,250 0,245" fill="#ffffff" opacity={0.25} />
      {[20, 70, 120].map((x, i) => <rect key={x} x={x} y={220 + i * 3} width={22} height={34} fill="#3a3340" stroke={L} strokeWidth={1.5} />)}
      {/* municipio */}
      <g stroke={L} strokeWidth={3}>
        <rect x={170} y={170} width={480} height={150} fill="#e8dcc2" />
        <rect x={160} y={160} width={500} height={16} fill="#d6c7a6" />
        <rect x={260} y={70} width={110} height={100} fill="#e8dcc2" />
        <rect x={252} y={62} width={126} height={12} fill="#d6c7a6" />
        <circle cx={315} cy={112} r={30} fill="#ffffff" />
        <path d="M315 112 L315 92 M315 112 L330 118" strokeWidth={3} />
        <rect x={290} y={150} width={50} height={20} fill="#d6c7a6" strokeWidth={2} />
      </g>
      {[200, 400, 470, 540, 600].map((x) => <g key={x}><Finestra x={x} y={190} w={34} h={42} colore="#8a7a62" /><Finestra x={x} y={262} w={34} h={42} colore="#8a7a62" /></g>)}
      {/* balcone con le bandiere */}
      <rect x={280} y={240} width={70} height={10} fill="#c9b994" stroke={L} strokeWidth={2} />
      <path d="M282 250 L282 270 M296 250 L296 270 M310 250 L310 270 M324 250 L324 270 M338 250 L338 270" stroke={L} strokeWidth={2} />
      <rect x={298} y={196} width={34} height={44} fill="#3a2a20" stroke={L} strokeWidth={2} />
      <Bandiera x={262} y={190} />
      <g stroke={L} strokeWidth={1.5}>
        <line x1={355} y1={190} x2={355} y2={240} strokeWidth={3} />
        <rect x={355} y={192} width={30} height={20} fill="#1f4fa8" />
        <circle cx={370} cy={202} r={6} fill="none" stroke="#ffd23f" strokeDasharray="2 2" />
      </g>
      {/* siepe e lampione */}
      <rect x={180} y={300} width={460} height={22} rx={8} fill="#4f7a3a" stroke={L} strokeWidth={2} />
      <g stroke={L} strokeWidth={4} fill="none">
        <path d="M720 330 L720 170 Q720 150 740 150" />
        <path d="M732 150 L752 150 L748 168 L736 168 Z" fill="#f7d98a" strokeWidth={2} />
      </g>
      <polygon points={`0,320 ${W},320 ${W},${H} 0,${H}`} fill="#8f8c94" />
      <path d="M0 380 L800 380" stroke="#d6d2c4" strokeWidth={4} strokeDasharray="30 22" />
    </Svg>
  );
}

function Piazza() {
  return (
    <Svg>
      <defs>
        <linearGradient id="cielo-piazza" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b8c4d0" /><stop offset="1" stopColor="#eef1f3" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cielo-piazza)" />
      {/* palazzo bianco sul fondo */}
      <g stroke={L} strokeWidth={3}>
        <rect x={110} y={150} width={580} height={170} fill="#ece9e2" />
        <rect x={100} y={142} width={600} height={12} fill="#d9d5cb" />
      </g>
      {[180, 300, 420, 540].map((x) => (
        <g key={x} stroke={L} strokeWidth={2}>
          <path d={`M${x - 6} 182 L${x + 21} 168 L${x + 48} 182 Z`} fill="#d9d5cb" />
          <rect x={x} y={185} width={42} height={52} fill="#3a3340" />
          <rect x={x + 3} y={188} width={36} height={24} fill="#6b6575" />
        </g>
      ))}
      {[150, 640].map((x) => <rect key={x} x={x} y={258} width={44} height={62} fill="#2a5a3a" stroke={L} strokeWidth={2} />)}
      {/* casa rosa a sinistra */}
      <rect x={0} y={130} width={90} height={190} fill="#e7a9a2" stroke={L} strokeWidth={2} />
      <rect x={20} y={160} width={30} height={46} fill="#3a3340" stroke={L} strokeWidth={1.5} />
      {/* alberi di arance e panchine */}
      <Arancio x={70} y={330} /><Arancio x={560} y={330} /><Arancio x={680} y={335} /><Arancio x={250} y={330} />
      <Panchina x={20} y={345} colore="#3f5a3a" /><Panchina x={600} y={350} colore="#3f5a3a" />
      {/* monumento con la statua */}
      <g stroke={L} strokeWidth={3}>
        <rect x={360} y={300} width={80} height={24} fill="#e9e6df" />
        <polygon points="378,300 422,300 412,170 388,170" fill="#f4f2ec" />
        <rect x={384} y={160} width={32} height={12} fill="#e9e6df" />
        <path d="M400 160 L400 128 M400 136 L388 150 M400 136 L414 120 M400 160 L392 172 M400 160 L408 172" strokeWidth={6} strokeLinecap="round" stroke="#e4e1d8" />
        <circle cx={400} cy={122} r={8} fill="#e4e1d8" />
      </g>
      <path d="M340 324 L460 324 M345 312 L345 324 M370 312 L370 324 M430 312 L430 324 M455 312 L455 324 M340 312 L460 312" stroke="#ffffff" strokeWidth={3} />
      <Bandiera x={330} y={170} />
      {/* pavimento a quadri */}
      <polygon points={`0,324 ${W},324 ${W},${H} 0,${H}`} fill="#b5b0a8" />
      {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={0} x2={W} y1={334 + i * 13} y2={334 + i * 13} stroke="#a29d95" strokeWidth={1.5} />)}
      {Array.from({ length: 21 }, (_, i) => <line key={`v${i}`} x1={i * 40} x2={i * 40 + (i - 10) * 8} y1={324} y2={H} stroke="#a29d95" strokeWidth={1.5} />)}
    </Svg>
  );
}

export function Sfondo({ luogo }: { luogo: Luogo }) {
  switch (luogo) {
    case "scuola": return <Scuola />;
    case "cappella": return <Cappella />;
    case "municipio": return <Municipio />;
    case "piazza": return <Piazza />;
    default: return <Chiesa />;
  }
}
