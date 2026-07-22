const RADIUS = 44
const CIRC = 2 * Math.PI * RADIUS

export default function ProgressRing({ percent = 0, size = 120, stroke = 8, color = 'var(--rose-pale)', label, sub }) {
  const offset = CIRC - (percent / 100) * CIRC

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Center text — counter-rotate */}
        <text
          x="50" y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--rose-pale)"
          fontSize="16"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}
        >
          {percent}%
        </text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose-pale)', letterSpacing: 0.4 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 10, color: 'var(--rose-pastel)', marginTop: 2, fontWeight: 500 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
