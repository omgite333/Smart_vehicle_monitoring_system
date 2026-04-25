'use client'
import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/Card'
import Link from 'next/link'

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

function SpeedGauge({ speed }) {
  const maxSpeed = 120
  const pct = Math.min(speed / maxSpeed, 1)
  const degrees = pct * 180 - 90
  const isOver = speed > 40
  const accentColor = isOver ? '#f43f5e' : '#38bdf8'

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-52 h-26 overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor={isOver ? '#f43f5e' : '#34d399'} />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#334155"
            strokeWidth="10"
            strokeLinecap="round"
            className="opacity-50"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={isOver ? '#f43f5e' : '#38bdf8'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${pct * 251.2} 251.2`}
            filter="url(#gauge-glow)"
            style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
          />
          {[0, 30, 60, 90, 120].map((s, i) => {
            const a = (s / maxSpeed) * 180 - 90
            const rad = (a * Math.PI) / 180
            const x1 = 100 + 70 * Math.cos(rad)
            const y1 = 100 + 70 * Math.sin(rad)
            const x2 = 100 + 56 * Math.cos(rad)
            const y2 = 100 + 56 * Math.sin(rad)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          })}
          <line 
            x1={100 + 62 * Math.cos((40 / maxSpeed) * 180 * Math.PI / 180 - Math.PI)} 
            y1={100 + 62 * Math.sin((40 / maxSpeed) * 180 * Math.PI / 180 - Math.PI)} 
            x2={100 + 82 * Math.cos((40 / maxSpeed) * 180 * Math.PI / 180 - Math.PI)} 
            y2={100 + 82 * Math.sin((40 / maxSpeed) * 180 * Math.PI / 180 - Math.PI)} 
            stroke="#fbbf24" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          {(() => {
            const rad = (degrees * Math.PI) / 180
            return (
              <g style={{ transition: 'transform 0.5s ease', transformOrigin: '100px 100px', transform: `rotate(${degrees + 90}deg)` }}>
                <line x1="100" y1="100" x2="100" y2="28" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" filter="url(#gauge-glow)" />
                <circle cx="100" cy="100" r="7" fill={accentColor} filter="url(#gauge-glow)" />
                <circle cx="100" cy="100" r="3.5" fill="#1e293b" />
              </g>
            )
          })()}
        </svg>
      </div>
      <div className="mt-2 text-center">
        <p className="text-5xl font-bold" style={{ color: accentColor }}>{speed}</p>
        <p className="text-xs text-slate-500 mt-1 font-medium tracking-wider">KM/H</p>
        {isOver && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" className="w-4 h-4 animate-pulse">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-xs font-bold text-rose-400 tracking-wide">OVERSPEED</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { headers: authHeaders() })
      if (res.status === 401) { window.location.href = '/login'; return }
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 5000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-10 w-56 bg-surface-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-surface-800 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const speed = data?.latestLocation?.speed ?? 0
  const violation = data?.latestViolation

  return (
    <div className="p-6 lg:p-8 space-y-7">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">VEHICLE MONITORING</p>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          {user && (
            <p className="text-base text-slate-400 mt-2">
              Welcome back, <span className="text-primary-400 font-semibold">{user.name}</span>
              <span className="mx-2">·</span>
              Vehicle <span className="text-accent-400 font-mono font-semibold">{user.vehicleId}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-accent-500/10 border border-accent-500/20 shadow-glow-accent">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-400 animate-pulse shadow-lg" />
          <span className="text-sm font-semibold text-accent-400">Live Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          title="Current Speed"
          value={speed}
          unit="km/h"
          color={speed > 40 ? 'red' : 'accent'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          }
        />
        <Card
          title="Wallet Balance"
          value={`₹${(data?.walletBalance ?? 0).toFixed(0)}`}
          color="green"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M22 10H2" />
              <circle cx="17" cy="10" r="2" />
            </svg>
          }
          subtitle="FASTag balance"
        />
        <Card
          title="Unpaid Fines"
          value={data?.unpaidCount ?? 0}
          color={data?.unpaidCount > 0 ? 'red' : 'green'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          subtitle={data?.totalUnpaidFine > 0 ? `₹${data.totalUnpaidFine} due` : 'All clear'}
        />
        <Card
          title="Last Location"
          value={data?.latestLocation ? new Date(data.latestLocation.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'No data'}
          color="purple"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          }
          subtitle={data?.latestLocation ? `${data.latestLocation.latitude.toFixed(4)}°N, ${data.latestLocation.longitude.toFixed(4)}°E` : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-400">SPEED MONITOR</p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="w-4 h-4">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs font-bold text-amber-400">Limit: 40 km/h</span>
            </div>
          </div>
          <SpeedGauge speed={speed} />
          {data?.latestLocation && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-800/60 border border-surface-700">
                <p className="text-xs text-slate-500 mb-1">Latitude</p>
                <p className="font-mono text-base text-white">{data.latestLocation.latitude.toFixed(6)}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-800/60 border border-surface-700">
                <p className="text-xs text-slate-500 mb-1">Longitude</p>
                <p className="font-mono text-base text-white">{data.latestLocation.longitude.toFixed(6)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <p className="text-sm font-semibold text-slate-400 mb-5">LATEST VIOLATION</p>
          {violation ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${violation.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {violation.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(violation.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2">
                    <p className="text-xs text-slate-500 mb-1">Recorded</p>
                    <p className="text-2xl font-bold text-rose-400">{violation.speed}</p>
                    <p className="text-xs text-slate-500">km/h</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-xs text-slate-500 mb-1">Limit</p>
                    <p className="text-2xl font-bold text-amber-400">{violation.speedLimit}</p>
                    <p className="text-xs text-slate-500">km/h</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-xs text-slate-500 mb-1">Fine</p>
                    <p className="text-2xl font-bold text-rose-400">₹{violation.fine}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <a href={violation.mapLink} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 text-center py-2.5 text-sm">
                  View Location
                </a>
                <Link href="/violations" className="btn-secondary flex-1 text-center py-2.5 text-sm text-rose-400">
                  All Fines
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-accent-500/10 border border-accent-500/20 shadow-glow-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-10 h-10">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 10 11 15 8 12" />
                </svg>
              </div>
              <p className="text-xl font-bold text-accent-400">Safe Driving</p>
              <p className="text-sm text-slate-500 mt-1">No violations detected, great job!</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm font-semibold text-slate-400 mb-5">QUICK ACTIONS</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/location', label: 'Live Map', color: 'accent', icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            )},
            { href: '/violations', label: 'Violations', color: 'red', icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )},
            { href: '/wallet', label: 'Add Money', color: 'green', icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M22 10H2" />
                <circle cx="17" cy="10" r="2" />
                <line x1="6" y1="14" x2="10" y2="14" />
              </svg>
            )},
            { href: '/vehicle', label: 'Vehicle Info', color: 'purple', icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6l2-4H7l-2 4" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            )},
          ].map(({ href, label, color, icon }, index) => (
            <Link 
              key={href} 
              href={href} 
              className="btn-ghost p-5 flex flex-col items-center gap-3 border border-surface-700 hover:border-surface-500 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className={color === 'accent' ? 'text-primary-400' : color === 'red' ? 'text-rose-400' : color === 'green' ? 'text-accent-400' : 'text-violet-400'}>{icon}</span>
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}