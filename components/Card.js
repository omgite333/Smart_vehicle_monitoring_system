export default function Card({ title, value, unit, icon, color = 'accent', trend, subtitle, className = '' }) {
  const colorMap = {
    accent: { text: '#38bdf8', bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.25)', glow: 'rgba(14, 165, 233, 0.15)' },
    green: { text: '#34d399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.25)', glow: 'rgba(52, 211, 153, 0.15)' },
    red: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.08)', border: 'rgba(251, 113, 133, 0.25)', glow: 'rgba(251, 113, 133, 0.15)' },
    yellow: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.25)', glow: 'rgba(251, 191, 36, 0.15)' },
    purple: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.08)', border: 'rgba(167, 139, 250, 0.25)', glow: 'rgba(167, 139, 250, 0.15)' },
    orange: { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.08)', border: 'rgba(251, 146, 60, 0.25)', glow: 'rgba(251, 146, 60, 0.15)' },
  }

  const c = colorMap[color] || colorMap.accent

  return (
    <div
      className={`stat-card card-hover ${className}`}
      style={{ 
        boxShadow: `0 4px 20px ${c.glow}`,
      }}
    >
      <div 
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-30" 
        style={{ background: c.text, transform: 'translate(30%, -30%)' }} 
      />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color: c.text }}>
              {value ?? '—'}
            </span>
            {unit && (
              <span className="text-sm text-slate-500 font-medium">{unit}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-2 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <svg viewBox="0 0 24 24" fill="none" stroke={trend.positive ? '#34d399' : '#fb7185'} strokeWidth="2.5" className="w-3.5 h-3.5">
                {trend.positive ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
              <span className="text-xs font-semibold" style={{ color: trend.positive ? '#34d399' : '#fb7185' }}>
                {trend.label}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
            style={{ 
              background: c.bg, 
              border: `1px solid ${c.border}`,
              color: c.text,
              boxShadow: `0 0 20px ${c.glow}`
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}