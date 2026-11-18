/**
 * Sfondo: la strada che porta alla chiesa, al tramonto.
 * Disegno evocativo e originale, non una copia fedele.
 */
const W = 800, H = 450;
const VX = 400, VY = 300; // punto di fuga

// Facciata sinistra: dal bordo (x=0) al punto vicino alla chiesa (x=320)
function puntoSx(t: number, v: number): [number, number] {
  const x = 0 + 320 * t;
  const top = 30 + (240 - 30) * t;
  const bot = 440 + (305 - 440) * t;
  return [x, top + (bot - top) * v];
}
const puntoDx = (t: number, v: number): [number, number] => {
  const [x, y] = puntoSx(t, v);
  return [W - x, y];
};

function quad(f: typeof puntoSx, t1: number, t2: number, v1: number, v2: number) {
  const p = [f(t1, v1), f(t2, v1), f(t2, v2), f(t1, v2)];
  return p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function Facciata({ f, colore, ombra }: { f: typeof puntoSx; colore: string; ombra: string }) {
  const finestre = [0.06, 0.3, 0.52, 0.7, 0.84];
  return (
    <g>
      <polygon points={quad(f, 0, 1, 0, 1)} fill={colore} stroke="#2a2030" strokeWidth={2} />
      <polygon points={quad(f, 0, 1, 0, 0.05)} fill={ombra} />
      {/* cornicione tra i piani */}
      <polygon points={quad(f, 0, 1, 0.47, 0.5)} fill={ombra} />
      {finestre.map((t, i) => {
        const w = 0.09 * (1 - t * 0.5);
        return (
          <g key={i}>
            {/* piano alto: finestra con persiane e balcone */}
            <polygon points={quad(f, t, t + w, 0.14, 0.4)} fill="#3a3340" stroke="#1a1520" strokeWidth={1.5} />
            <polygon points={quad(f, t - w * 0.25, t, 0.14, 0.4)} fill="#5c6b5e" />
            <polygon points={quad(f, t - 0.012, t + w + 0.012, 0.4, 0.43)} fill="#8d867c" />
            {[0, 0.25, 0.5, 0.75, 1].map((k) => {
              const [x1, y1] = f(t + w * k, 0.33);
              const [x2, y2] = f(t + w * k, 0.4);
              return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a2030" strokeWidth={1.5} />;
            })}
            <polygon points={quad(f, t - 0.01, t + w + 0.01, 0.32, 0.335)} fill="#2a2030" />
            {/* piano terra: porta */}
            <polygon points={quad(f, t + w * 0.1, t + w * 0.9, 0.62, 0.97)} fill="#4a3a30" stroke="#1a1520" strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
}

export function Chiesa() {
  return (
    <svg viewBox={`0 55 ${W} ${H - 55}`} preserveAspectRatio="xMidYMin slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e1a52" />
          <stop offset="0.35" stopColor="#7a3a8c" />
          <stop offset="0.6" stopColor="#d9557a" />
          <stop offset="0.75" stopColor="#f08a5d" />
        </linearGradient>
        <linearGradient id="strada" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a8794" />
          <stop offset="1" stopColor="#5c5a66" />
        </linearGradient>
        <linearGradient id="pietra" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c99a52" />
          <stop offset="0.5" stopColor="#e2b468" />
          <stop offset="1" stopColor="#b9874a" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#cielo)" />
      {/* nuvole a strisce */}
      <g fill="#f3a0b8" opacity={0.35}>
        <ellipse cx={180} cy={90} rx={170} ry={10} />
        <ellipse cx={560} cy={60} rx={200} ry={12} />
        <ellipse cx={420} cy={140} rx={160} ry={8} />
        <ellipse cx={680} cy={170} rx={120} ry={7} />
      </g>

      {/* CHIESA */}
      <g stroke="#5a3a1a" strokeWidth={2}>
        {/* cupola */}
        <rect x={372} y={150} width={56} height={34} fill="#c99a52" />
        <path d="M366 152 Q366 104 400 102 Q434 104 434 152 Z" fill="#a8a097" />
        <path d="M384 150 Q384 118 400 106" fill="none" stroke="#7d766e" />
        <path d="M416 150 Q416 118 400 106" fill="none" stroke="#7d766e" />
        <rect x={394} y={88} width={12} height={16} fill="#c99a52" />
        <path d="M392 90 Q400 80 408 90 Z" fill="#a8a097" />
        <path d="M400 70 L400 82 M395 75 L405 75" stroke="#3a2a1a" strokeWidth={2.5} />
        {/* ordine superiore con volute */}
        <path d="M350 238 Q340 238 336 230 Q330 220 352 214 L352 186 Q400 168 448 186 L448 214 Q470 220 464 230 Q460 238 450 238 Z" fill="url(#pietra)" />
        <path d="M352 186 Q400 166 448 186" fill="none" strokeWidth={4} />
        <rect x={388} y={196} width={24} height={34} rx={12} fill="#5a3a24" />
        <rect x={360} y={192} width={8} height={44} fill="#d9aa5f" />
        <rect x={432} y={192} width={8} height={44} fill="#d9aa5f" />
        {/* ordine inferiore */}
        <rect x={322} y={236} width={156} height={70} fill="url(#pietra)" />
        <rect x={318} y={232} width={164} height={8} fill="#b9874a" />
        {[330, 352, 438, 460].map((x) => <rect key={x} x={x} y={240} width={10} height={66} fill="#d9aa5f" />)}
        <path d="M384 306 L384 266 Q400 252 416 266 L416 306 Z" fill="#3b2a1f" />
        <rect x={378} y={252} width={44} height={6} fill="#b9874a" />
        <rect x={392} y={214} width={16} height={6} fill="#f5d77a" stroke="none" opacity={0.7} />
        {/* gradini */}
        <polygon points="362,306 438,306 446,312 354,312" fill="#b8b0a6" />
        <polygon points="350,312 450,312 460,318 340,318" fill="#a39b92" />
      </g>

      {/* STRADA */}
      <polygon points={`${VX - 60},${VY + 18} ${VX + 60},${VY + 18} ${W + 40},${H} ${-40},${H}`} fill="url(#strada)" />
      <polygon points={`0,${H} 0,440 320,305 ${VX - 60},${VY + 18}`} fill="#9a958e" />
      <polygon points={`${W},${H} ${W},440 ${W - 320},305 ${VX + 60},${VY + 18}`} fill="#9a958e" />

      {/* CASE ai lati */}
      <Facciata f={puntoSx} colore="#bdb5aa" ombra="#9d958b" />
      <Facciata f={puntoDx} colore="#c7bfb3" ombra="#a69e93" />

      {/* lampione */}
      <g stroke="#1e1a22" strokeWidth={4} fill="none">
        <path d="M60 150 L95 150 L95 160" />
        <path d="M86 160 L104 160 L100 176 L90 176 Z" fill="#f7d98a" strokeWidth={2.5} />
      </g>
    </svg>
  );
}
