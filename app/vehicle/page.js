'use client'
import { useState, useEffect } from 'react'

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vehicleNumber: '', model: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicle', { headers: authHeaders() })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      setVehicles(data.vehicles || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    fetchVehicles()
  }, [])

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/vehicle', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add vehicle')
      setSuccess('Vehicle added successfully!')
      setShowForm(false)
      setForm({ vehicleNumber: '', model: '' })
      fetchVehicles()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-48 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">VEHICLE REGISTRY</p>
          <h1 className="text-3xl font-semibold text-white">Vehicle Info</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Vehicle
        </button>
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

      {showForm && (
        <div className="card p-5">
          <p className="text-sm font-medium text-primary-400 mb-4">Register New Vehicle</p>
          <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Vehicle Number (Plate)</label>
              <input
                className="input"
                placeholder="e.g. MH10AB1234"
                value={form.vehicleNumber}
                onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Vehicle Model</label>
              <input
                className="input"
                placeholder="e.g. Maruti Swift 2022"
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Vehicle'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {user && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-500/10 border border-primary-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="w-4 h-4">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">Registered Operator</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Name', value: user.name, color: '#38bdf8' },
              { label: 'Email', value: user.email, color: '#cbd5e1' },
              { label: 'Vehicle ID', value: user.vehicleId, color: '#34d399' },
              { label: 'Wallet', value: `₹${(user.walletBalance || 0).toFixed(2)}`, color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-sm font-medium truncate" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-800 border border-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" className="w-10 h-10">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6l2-4H7l-2 4" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <p className="text-base font-medium text-slate-400">No Vehicles Registered</p>
          <p className="text-sm text-slate-500 mt-1">Add a vehicle using the button above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <div key={v.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-500/10 border border-primary-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="w-6 h-6">
                    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5" />
                    <circle cx="7" cy="17" r="2" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                  <span className="text-xs font-medium text-accent-400">Active</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-3">
                {v.vehicleNumber || v.vehicleId}
              </h3>

              <div className="space-y-2">
                {[
                  { label: 'Device ID', value: v.vehicleId },
                  { label: 'Model', value: v.model },
                  { label: 'Owner', value: v.owner?.name },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-sm text-slate-300">{value || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={`https://maps.google.com/maps/search/${encodeURIComponent(v.vehicleNumber)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-center text-sm py-2 border border-slate-700">
                  Track
                </a>
                <div className="btn-ghost text-center text-sm py-2 cursor-default opacity-50 border border-dashed border-slate-700">
                  ID: {v.vehicleId?.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}