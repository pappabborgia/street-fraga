import { T } from "@/testi";
/** Logo originale di Street Fraga: lettere infuocate e una pennellata tricolore. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 270" className={className} role="img" aria-label={T.titolo}>
      <defs>
        <linearGradient id="fuoco" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff36b" />
          <stop offset="0.38" stopColor="#ffc21a" />
          <stop offset="0.7" stopColor="#ff7a00" />
          <stop offset="1" stopColor="#d4140f" />
        </linearGradient>
      </defs>
      {/* pennellata tricolore */}
      <g transform="skewX(-14) translate(60 0)">
        <path d="M120 232 Q300 214 520 220 L512 236 Q300 230 110 246 Z" fill="#009246" stroke="#1a1a1a" strokeWidth={3} />
        <path d="M110 246 Q300 230 512 236 L506 250 Q300 246 104 260 Z" fill="#f4f5f0" stroke="#1a1a1a" strokeWidth={3} />
        <path d="M104 260 Q300 246 506 250 L498 264 Q300 262 98 272 Z" fill="#ce2b37" stroke="#1a1a1a" strokeWidth={3} />
      </g>
      <g transform="skewX(-10) translate(28 0)" fontFamily="Bungee, 'Atkinson Hyperlegible', sans-serif"
        textAnchor="middle" fill="url(#fuoco)" stroke="#2a0800" strokeWidth={12} strokeLinejoin="round"
        style={{ paintOrder: "stroke" }}>
        <text x={300} y={92} fontSize={82} letterSpacing={6}>STREET</text>
        <text x={300} y={212} fontSize={138} letterSpacing={2}>FRAGA</text>
      </g>
    </svg>
  );
}
