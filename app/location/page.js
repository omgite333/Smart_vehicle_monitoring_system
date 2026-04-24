'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false })

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export default function LocationPage() {
  const [location, setLocation] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [testInput, setTestInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  const fetchLocation = useCallback(async () => {
    try {
      const [latestRes, histRes] = await Promise.all([
        fetch('/api/location/latest', { headers: authHeaders() }),
        fetch('/api/location/history?limit=10', { headers: authHeaders() }),
      ])
      if (latestRes.status === 401) { window.location.href = '/login'; return }
      const latestData = await latestRes.json()
      const histData = await histRes.json()
      if (latestData.location) setLocation(latestData.location)
      if (histData.locations) setHistory(histData.locations)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocation()
    const interval = setInterval(fetchLocation, 5000)
    return () => clearInterval(interval)
  }, [fetchLocation])

  const sendTestData = async () => {
    if (!testInput.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      let body, headers
      try {
        JSON.parse(testInput)
        body = testInput
        headers = { 'Content-Type': 'application/json' }
      } catch {
        body = testInput
        headers = { 'Content-Type': 'text/plain' }
      }
      const res = await fetch('/api/location/update', { method: 'POST', headers, body })
      const data = await res.json()
      setSendResult({ success: res.ok, data })
      if (res.ok) fetchLocation()
    } catch (e) {
      setSendResult({ success: false, data: { error: e.message } })
    } finally {
      setSending(false)
    }
  }

  const jsonExample = JSON.stringify({
    vehicleId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).vehicleId : 'V123',
    speed: 55,
    latitude: 16.8542,
    longitude: 74.6015
  }, null, 2)

  const rawExample = `Overspeed Alert!
Speed: 55 km/h
Fine: Rs. 500
Location: https://maps.google.com/?q=16.8542,74.6015`

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">REAL-TIME TRACKING</p>
          <h1 className="text-3xl font-semibold text-white">Live Location</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-slate-500 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500/10 border border-accent-500/20">
            <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            <span className="text-xs font-medium text-accent-400">Polling 5s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card overflow-hidden" style={{ height: '500px' }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500">Acquiring GPS signal...</p>
              </div>
            </div>
          ) : location ? (
            <MapComponent lat={location.latitude} lng={location.longitude} zoom={14} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-800 border border-slate-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" className="w-10 h-10">
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-slate-400">No Location Data</p>
                <p className="text-sm text-slate-500 mt-1">Send a location update to start tracking</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <p className="text-sm font-medium text-slate-400 mb-4">Current Position</p>
            {location ? (
              <div className="space-y-4">
                {[
                  { label: 'Latitude', value: location.latitude.toFixed(6), color: '#38bdf8', icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </svg>
                  )},
                  { label: 'Longitude', value: location.longitude.toFixed(6), color: '#38bdf8', icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  )},
                  { label: 'Speed', value: `${location.speed} km/h`, color: location.speed > 40 ? '#fb7185' : '#34d399', icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
                    </svg>
                  )},
                  { label: 'Timestamp', value: new Date(location.timestamp).toLocaleString('en-IN'), color: '#a78bfa', icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )},
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ color }}>{icon}</span>
                      <span className="text-xs text-slate-500">{label}</span>
                    </div>
                    <span className="font-mono text-sm font-medium" style={{ color }}>{value}</span>
                  </div>
                ))}
                <a
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost w-full text-center block mt-4 text-sm border border-slate-700"
                >
                  Open in Google Maps
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No location data yet</p>
            )}
          </div>

          <div className="card p-5">
            <p className="text-sm font-medium text-slate-400 mb-4">Location History</p>
            {history.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((loc, i) => (
                  <div key={loc.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors" style={{ 
                    background: i === 0 ? 'rgba(56, 189, 248, 0.08)' : 'transparent', 
                    border: `1px solid ${i === 0 ? 'rgba(56, 189, 248, 0.2)' : 'transparent'}` 
                  }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === 0 ? '#38bdf8' : '#475569' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono truncate text-slate-300">
                        {loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E
                      </p>
                      <p className="text-xs text-slate-500">
                        {loc.speed} km/h · {new Date(loc.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No history yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="w-4 h-4">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">IoT Hardware Simulator</p>
            <p className="text-xs text-slate-600">Send JSON or raw text message to update vehicle location</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setTestInput(jsonExample)}
            className="btn-ghost text-left p-3 border border-slate-700"
          >
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="w-4 h-4">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              </svg>
              <div>
                <p className="text-xs font-medium mb-0.5">Use JSON Example</p>
                <pre className="text-xs text-slate-500 font-mono">{"{\"vehicleId\":\"...\"}"}</pre>
              </div>
            </div>
          </button>
          <button
            onClick={() => setTestInput(rawExample)}
            className="btn-ghost text-left p-3 border border-slate-700 text-accent-400"
          >
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
              </svg>
              <div>
                <p className="text-xs font-medium mb-0.5">Use Raw Message</p>
                <pre className="text-xs text-slate-500 font-mono">{"Overspeed Alert!..."}</pre>
              </div>
            </div>
          </button>
        </div>

        <textarea
          className="input font-mono text-sm"
          rows={4}
          value={testInput}
          onChange={e => setTestInput(e.target.value)}
          placeholder="Paste JSON or IoT message here..."
        />

        <div className="flex gap-3 mt-3">
          <button onClick={sendTestData} disabled={sending} className="btn-primary">
            {sending ? 'Sending...' : 'Send Update'}
          </button>
          <button onClick={() => { setTestInput(''); setSendResult(null) }} className="btn-ghost">
            Clear
          </button>
        </div>

        {sendResult && (
          <div className="mt-4 p-3 rounded-lg text-xs font-mono" style={{
            background: sendResult.success ? 'rgba(52, 211, 153, 0.05)' : 'rgba(251, 113, 133, 0.05)',
            border: `1px solid ${sendResult.success ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)'}`,
            color: sendResult.success ? '#34d399' : '#fb7185',
          }}>
            <div className="flex items-center gap-2 mb-2">
              {sendResult.success ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              <span className="font-medium">{sendResult.success ? 'SUCCESS' : 'ERROR'}</span>
            </div>
            <pre className="whitespace-pre-wrap opacity-80">{JSON.stringify(sendResult.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}