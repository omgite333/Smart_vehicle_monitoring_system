'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/location',
    label: 'Live Location',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="10" r="3" />
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      </svg>
    ),
  },
  {
    href: '/violations',
    label: 'Violations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/vehicle',
    label: 'Vehicle',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v5" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6l2-4H7l-2 4" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    href: '/wallet',
    label: 'FASTag Wallet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M22 10H2" />
        <circle cx="17" cy="10" r="2" />
        <line x1="6" y1="14" x2="10" y2="14" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getIconColor = (item, isActive) => {
    if (isActive) return 'text-primary-400'
    if (hovered === item.href) return 'text-white'
    return 'text-slate-400'
  }

  return (
    <aside
      className={`flex flex-col border-r border-surface-700/50 bg-surface-900/80 backdrop-blur-lg transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-surface-700/50 ${
        collapsed ? 'justify-center px-3' : ''
      }`}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-500/5 border border-primary-500/30 shadow-glow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-primary-400">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            <circle cx="12" cy="14" r="2" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="text-lg font-semibold text-white">VehicleOS</span>
            <span className="text-xs text-slate-500">Monitor</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`ml-auto text-slate-500 hover:text-white transition-all p-1.5 rounded-lg hover:bg-surface-700 ${
            collapsed ? 'absolute top-6 right-2' : ''
          }`}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1.5">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-surface-700/50'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span 
                className={`flex-shrink-0 transition-all duration-200 ${
                  isActive ? 'scale-110' : hovered === item.href ? 'scale-105' : ''
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-800 text-sm font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-surface-700 shadow-lg">
                  {item.label}
                </div>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary-400 shadow-glow" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`border-t border-surface-700/50 p-4 ${
        collapsed ? 'flex flex-col items-center gap-3 px-2' : ''
      }`}>
        {user && !collapsed && (
          <div className="mb-3 px-1">
            <p className="text-xs text-slate-500 mb-1">Current User</p>
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-xs text-accent-400 font-medium">Online</span>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary-500/10 border border-primary-500/30">
            <span className="text-sm font-bold text-primary-400">{user.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-all w-full px-3 py-2.5 rounded-xl hover:bg-rose-500/10 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}