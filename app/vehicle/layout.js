'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function ProtectedLayout({ children }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] opacity-15" style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-2 border-cyber-accent border-t-transparent rounded-full animate-spin mx-auto mb-5" style={{ borderTopColor: '#00d4ff' }} />
          <p className="font-display text-sm tracking-widest" style={{ color: '#4a6080' }}>INITIALIZING SYSTEM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}