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
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="60%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
        </linearGradient>
        <clipPath id="bgClip">
          <rect width="100" height="100" rx="22" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="100" height="100" rx="22" fill="url(#bgGrad)" />

      {/* Clipped inner content */}
      <g clipPath="url(#bgClip)">
        {/* Subtle dot grid */}
        {[20, 40, 60, 80].map((x) =>
          [20, 40, 60, 80].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="white" fillOpacity="0.08" />
          ))
        )}

        {/* Ascending bars — the data metaphor */}
        <rect x="10" y="78" width="9" height="22" rx="2.5" fill="url(#barGrad)" />
        <rect x="23" y="68" width="9" height="32" rx="2.5" fill="url(#barGrad)" />
        <rect x="36" y="55" width="9" height="45" rx="2.5" fill="url(#barGrad)" />
        <rect x="49" y="40" width="9" height="60" rx="2.5" fill="url(#barGrad)" />
        <rect x="62" y="26" width="9" height="74" rx="2.5" fill="url(#barGrad)" />
        <rect x="75" y="12" width="9" height="88" rx="2.5" fill="url(#barGrad)" />

        {/* Trend line over bars */}
        <polyline
          points="14,76 27,66 40,53 53,38 66,24 79,10"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* S — bold, centered, overlaid */}
        <text
          x="50"
          y="72"
          fontFamily="'Arial Black', 'Impact', 'Helvetica Neue', Arial, sans-serif"
          fontSize="70"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
        >
          S
        </text>

        {/* Top-right accent dot */}
        <circle cx="83" cy="14" r="4" fill="white" fillOpacity="0.3" />
        <circle cx="83" cy="14" r="2" fill="white" fillOpacity="0.6" />
      </g>

      {/* Border shine */}
      <rect
        width="100"
        height="100"
        rx="22"
        stroke="white"
        strokeOpacity="0.12"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
