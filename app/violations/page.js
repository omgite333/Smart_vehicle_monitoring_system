'use client'
import { useState, useEffect, useCallback } from 'react'

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export default function ViolationsPage() {
  const [violations, setViolations] = useState({ unpaid: [], paid: [] })
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('unpaid')

  const fetchViolations = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.vehicleId) return
      const res = await fetch(`/api/violations/${user.vehicleId}`, { headers: authHeaders() })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      setViolations({ unpaid: data.unpaid || [], paid: data.paid || [] })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchViolations()
  }, [fetchViolations])

  const payFine = async (violationId, fine) => {
    setPaying(violationId)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/wallet/pay-fine', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ violationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      setSuccess(`✓ Fine of ₹${fine} paid! New balance: ₹${data.newBalance.toFixed(2)}`)
      fetchViolations()
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.walletBalance = data.newBalance
      localStorage.setItem('user', JSON.stringify(user))
    } catch (e) {
      setError(e.message)
    } finally {
      setPaying(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-24 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const currentList = violations[tab]
  const totalDue = violations.unpaid.reduce((s, v) => s + v.fine, 0)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">TRAFFIC ENFORCEMENT</p>
          <h1 className="text-3xl font-semibold text-white">Violations</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-rose-500/10 border border-rose-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" className="w-6 h-6">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 mb-1">Unpaid</p>
          <p className="text-3xl font-semibold text-rose-400">{violations.unpaid.length}</p>
        </div>
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-accent-500/10 border border-accent-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-6 h-6">
              <circle cx="12" cy="12" r="10" />
              <polyline points="16 10 11 15 8 12" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 mb-1">Paid</p>
          <p className="text-3xl font-semibold text-accent-400">{violations.paid.length}</p>
        </div>
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-amber-500/10 border border-amber-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="w-6 h-6">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 mb-1">Total Due</p>
          <p className="text-3xl font-semibold text-amber-400">₹{totalDue}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/20 text-sm text-accent-400">
          {success}
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-700/50">
        {['unpaid', 'paid'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium transition-all relative ${
              tab === t ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === t && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-500" />
            )}
            {t.charAt(0).toUpperCase() + t.slice(1)} ({violations[t].length})
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-slate-800 border border-slate-700">
              {tab === 'unpaid' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 10 11 15 8 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" className="w-8 h-8">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
              )}
            </div>
            <p className="text-base font-medium" style={{ color: tab === 'unpaid' ? '#34d399' : '#64748b' }}>
              {tab === 'unpaid' ? 'No Pending Fines' : 'No Past Fines'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tab === 'unpaid' ? 'Great job driving safely!' : 'Your paid fines will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Date & Time</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Speed</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Limit</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Excess</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Fine</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((v) => (
                  <tr key={v.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-white font-medium">{new Date(v.timestamp).toLocaleDateString('en-IN')}</p>
                        <p className="text-xs text-slate-500">{new Date(v.timestamp).toLocaleTimeString('en-IN')}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-lg font-semibold text-rose-400">{v.speed}</span>
                      <span className="text-xs text-slate-500 ml-1">km/h</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-lg font-semibold text-amber-400">{v.speedLimit}</span>
                      <span className="text-xs text-slate-500 ml-1">km/h</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-medium text-rose-400">+{(v.speed - v.speedLimit).toFixed(0)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-lg font-semibold" style={{ color: v.status === 'paid' ? '#34d399' : '#fb7185' }}>
                        ₹{v.fine}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${v.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={v.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost text-xs py-1.5 px-3 border border-slate-700"
                        >
                          Map
                        </a>
                        {v.status === 'unpaid' && (
                          <button
                            onClick={() => payFine(v.id, v.fine)}
                            disabled={paying === v.id}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            {paying === v.id ? '...' : 'Pay'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}