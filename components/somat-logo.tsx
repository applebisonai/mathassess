export function SomatLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="45%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="bgClip">
          <rect width="100" height="100" rx="20" />
        </clipPath>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');`}</style>
      </defs>

      {/* Background */}
      <rect width="100" height="100" rx="20" fill="url(#bgGrad)" />

      <g clipPath="url(#bgClip)">
        {/* Top-left glow */}
        <ellipse cx="20" cy="20" rx="40" ry="40" fill="url(#glowGrad)" />

        {/* Subtle scan lines */}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.03" strokeWidth="1" />
        ))}

        {/* Ascending bars */}
        <rect x="9"  y="80" width="8" height="20" rx="2" fill="url(#barGrad)" />
        <rect x="21" y="70" width="8" height="30" rx="2" fill="url(#barGrad)" />
        <rect x="33" y="57" width="8" height="43" rx="2" fill="url(#barGrad)" />
        <rect x="45" y="42" width="8" height="58" rx="2" fill="url(#barGrad)" />
        <rect x="57" y="28" width="8" height="72" rx="2" fill="url(#barGrad)" />
        <rect x="69" y="14" width="8" height="86" rx="2" fill="url(#barGrad)" />
        <rect x="81" y="4"  width="8" height="96" rx="2" fill="url(#barGrad)" />

        {/* Trend line with glow */}
        <polyline
          points="13,78 25,68 37,55 49,40 61,26 73,12 85,2"
          stroke="#38bdf8"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#glow)"
        />

        {/* Trend dots */}
        {[[13,78],[49,40],[85,2]].map(([x,y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#7dd3fc" fillOpacity="0.8" filter="url(#glow)" />
        ))}

        {/* The S — Orbitron futuristic font */}
        <text
          x="50"
          y="74"
          style={{ fontFamily: "'Orbitron', 'Arial Black', sans-serif", fontWeight: 900 }}
          fontSize="66"
          fill="white"
          textAnchor="middle"
          filter="url(#glow)"
        >
          S
        </text>

        {/* Corner accent marks */}
        <line x1="6" y1="6" x2="14" y2="6" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="6" x2="6" y2="14" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="6" x2="86" y2="6" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="6" x2="94" y2="14" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="94" x2="14" y2="94" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="94" x2="6" y2="86" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="94" x2="86" y2="94" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="94" x2="94" y2="86" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Border */}
      <rect width="100" height="100" rx="20" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
