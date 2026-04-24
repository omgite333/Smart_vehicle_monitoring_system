'use client'
import { useState, useEffect, useCallback } from 'react'

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2000, 5000]

export default function WalletPage() {
  const [wallet, setWallet] = useState({ walletBalance: 0, transactions: [] })
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet', { headers: authHeaders() })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      setWallet(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  const handleAddMoney = async (e) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    setAdding(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/wallet/add-money', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add money')
      setSuccess(`✓ ₹${amt} added successfully! New balance: ₹${data.newBalance.toFixed(2)}`)
      setAmount('')
      fetchWallet()
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.walletBalance = data.newBalance
      localStorage.setItem('user', JSON.stringify(user))
    } catch (e) {
      setError(e.message)
    } finally {
      setAdding(false)
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

  const credits = wallet.transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const debits = wallet.transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">ELECTRONIC TOLL</p>
        <h1 className="text-3xl font-semibold text-white">Wallet</h1>
      </div>

      <div className="card p-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
        <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-500/10 border border-accent-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-6 h-6">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M22 10H2" />
                <circle cx="17" cy="10" r="2" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">FASTag Balance</p>
          </div>
          
          <p className="text-xs text-slate-500 mb-2">Available Balance</p>
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-5xl font-semibold text-accent-400">
              ₹{wallet.walletBalance.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/20">
              <div className="flex items-center gap-2 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
                <p className="text-xs text-slate-400">Total Credited</p>
              </div>
              <p className="text-2xl font-semibold text-accent-400">₹{credits.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <div className="flex items-center gap-2 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <p className="text-xs text-slate-400">Total Debited</p>
              </div>
              <p className="text-2xl font-semibold text-rose-400">₹{debits.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-500/10 border border-primary-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" className="w-5 h-5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">Add Money to Wallet</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-accent-500/10 border border-accent-500/20 text-sm text-accent-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {PRESET_AMOUNTS.map(preset => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                amount === preset.toString()
                  ? 'bg-primary-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              ₹{preset}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddMoney} className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
            <input
              type="number"
              className="input pl-9"
              placeholder="Enter custom amount..."
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              max="100000"
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary whitespace-nowrap">
            {adding ? 'Processing...' : 'Add Money'}
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <p className="text-sm font-medium text-slate-400">Transaction History</p>
        </div>
        {wallet.transactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 bg-slate-800 border border-slate-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" className="w-6 h-6">
                <rect x="2" y="6" width="20" height="14" rx="2" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No transactions yet</p>
            <p className="text-xs text-slate-600 mt-1">Add money to your wallet to see transactions</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {wallet.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'credit' ? 'bg-accent-500/10 border border-accent-500/20' : 'bg-rose-500/10 border border-rose-500/20'
                  }`}>
                    {tx.type === 'credit' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-5 h-5">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" className="w-5 h-5">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold" style={{ color: tx.type === 'credit' ? '#34d399' : '#fb7185' }}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </p>
                  <span className={`badge ${tx.type === 'credit' ? 'badge-success' : 'badge-danger'} text-xs`}>
                    {tx.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}