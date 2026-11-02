import type { CSSProperties } from "react";

export function Hibiscus({ size = 80, color = "#f28db8", center = "#ffc857", style, className = "" }: { size?: number; color?: string; center?: string; style?: CSSProperties; className?: string }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg className={`deco ${className}`} width={size} height={size} viewBox="-50 -50 100 100" style={style} aria-hidden>
      {petals.map((a) => (
        <path
          key={a}
          d="M0 0 C -18 -14, -22 -40, 0 -46 C 22 -40, 18 -14, 0 0 Z"
          fill={color}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="1.5"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r="9" fill={center} />
      <path d="M0 0 L 10 -26" stroke={center} strokeWidth="3" strokeLinecap="round" />
      <circle cx="11" cy="-28" r="3.5" fill="#fff" />
    </svg>
  );
}

export function Leaf({ size = 120, color = "#2f9e78", style, className = "" }: { size?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <svg className={`deco ${className}`} width={size} height={size} viewBox="0 0 120 120" style={style} aria-hidden>
      <path d="M10 110 C 30 50, 70 15, 115 8 C 105 55, 70 95, 10 110 Z" fill={color} />
      <path d="M10 110 C 45 75, 75 45, 112 10" stroke="rgba(255,255,255,0.45)" strokeWidth="3" fill="none" />
      {[0.25, 0.42, 0.58, 0.74].map((t, i) => {
        const x = 10 + t * 102;
        const y = 110 - t * 100;
        return <path key={i} d={`M${x} ${y} l ${-14 + i * 2} ${-6 - i * 2}`} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />;
      })}
    </svg>
  );
}

// Estrellas pseudoaleatorias pero estables (mismo resultado en servidor y cliente).
export function Stars({ count = 40 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const x = (i * 73.13) % 100;
    const y = (i * 37.71 + (i % 7) * 11) % 100;
    const r = 0.6 + ((i * 17) % 10) / 8;
    return { x, y, r, o: 0.35 + ((i * 29) % 10) / 16 };
  });
  return (
    <svg className="stars" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
      {stars.map((s, i) => (
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#fff" opacity={s.o} />
      ))}
    </svg>
  );
}

export function Wave({ fill = "#eaf5fd", className = "wave" }: { fill?: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden>
      <path d="M0 60 C 180 10, 360 10, 540 50 C 720 90, 900 100, 1080 60 C 1260 20, 1360 30, 1440 45 L1440 110 L0 110 Z" fill={fill} opacity="0.55" />
      <path d="M0 80 C 200 40, 400 50, 600 78 C 800 106, 1000 96, 1200 70 C 1320 55, 1400 60, 1440 66 L1440 110 L0 110 Z" fill={fill} />
    </svg>
  );
}

export function GiftIcon({ color = "#3e74c9", ribbon = "#f28db8" }: { color?: string; ribbon?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
      <rect x="4" y="13" width="24" height="15" rx="3" fill={color} />
      <rect x="2.5" y="9" width="27" height="6" rx="2.5" fill={color} opacity="0.85" />
      <rect x="14" y="9" width="4" height="19" fill={ribbon} />
      <path d="M16 9 C 10 2, 5 6, 9 9 Z M16 9 C 22 2, 27 6, 23 9 Z" fill={ribbon} />
    </svg>
  );
}
