'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    vehicleId: '', vehicleNumber: '', vehicleModel: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) router.push('/dashboard')
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          vehicleId: form.vehicleId,
          vehicleNumber: form.vehicleNumber,
          vehicleModel: form.vehicleModel,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, required = true }) => (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-2.5">{label}</label>
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm({ ...form, [name]: e.target.value })}
        onFocus={() => setFocused(name)}
        onBlur={() => setFocused(null)}
        required={required}
      />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 bg-surface-900 bg-dots">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 bg-gradient-to-br from-accent-500/20 to-accent-500/5 border border-accent-500/30 shadow-glow-accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-accent-400">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6l2-4H7l-2 4" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Register Vehicle</h1>
          <p className="text-slate-500 mt-2 font-medium">Set up your vehicle for monitoring</p>
        </div>

        <div className="card p-8 shadow-glow-lg border-surface-700/50">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-rose-400 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="pb-6 border-b border-surface-700">
              <p className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-primary-400">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Operator Details
              </p>
              <div className="space-y-4">
                <Field label="Full Name" name="name" placeholder="Your full name" />
                <Field label="Email Address" name="email" type="email" placeholder="you@example.com" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Password" name="password" type="password" placeholder="Min 8 characters" />
                  <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-accent-400">
                  <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5" />
                  <circle cx="7" cy="17" r="2" />
                </svg>
                Vehicle Details
              </p>
              <div className="space-y-4">
                <Field label="Vehicle ID (IoT Device)" name="vehicleId" placeholder="e.g. V123" />
                <Field label="Vehicle Number" name="vehicleNumber" placeholder="e.g. MH10AB1234" required={false} />
                <Field label="Vehicle Model" name="vehicleModel" placeholder="e.g. Maruti Swift 2022" required={false} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-accent w-full py-3.5"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Register Vehicle
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-700 text-center">
            <p className="text-sm text-slate-500">
              Already registered?{' '}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}