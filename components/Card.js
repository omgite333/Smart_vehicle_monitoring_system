export default function Card({ title, value, unit, icon, color = 'accent', trend, subtitle, className = '' }) {
  const colorMap = {
    accent: { text: '#38bdf8', bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.2)', glow: 'rgba(14, 165, 233, 0.15)' },
    green: { text: '#34d399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.2)', glow: 'rgba(52, 211, 153, 0.15)' },
    red: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.08)', border: 'rgba(251, 113, 133, 0.2)', glow: 'rgba(251, 113, 133, 0.15)' },
    yellow: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.2)', glow: 'rgba(251, 191, 36, 0.15)' },
    purple: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.08)', border: 'rgba(167, 139, 250, 0.2)', glow: 'rgba(167, 139, 250, 0.15)' },
  }

  const c = colorMap[color] || colorMap.accent

  return (
    <div
      className={`card p-5 card-hover relative overflow-hidden ${className}`}
      style={{ 
        boxShadow: `0 4px 20px ${c.glow}`,
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-30 blur-3xl" style={{ background: c.text, transform: 'translate(30%, -30%)' }} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold" style={{ color: c.text }}>
              {value ?? '—'}
            </span>
            {unit && (
              <span className="text-sm text-slate-500">{unit}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <svg viewBox="0 0 24 24" fill="none" stroke={trend.positive ? '#34d399' : '#fb7185'} strokeWidth="2" className="w-3.5 h-3.5">
                {trend.positive ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
              <span className="text-xs font-medium" style={{ color: trend.positive ? '#34d399' : '#fb7185' }}>
                {trend.label}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ 
              background: c.bg, 
              border: `1px solid ${c.border}`,
              color: c.text,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}