'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Clock,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materias', label: 'Minhas Matérias', icon: BookOpen },
  { href: '/aulas/preparar', label: 'Preparar Aula', icon: GraduationCap },
  { href: '/historico', label: 'Histórico', icon: Clock },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser, sidebarOpen, toggleSidebar } = useStore()

  useEffect(() => {
    if (!user) {
      fetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data?.user) setUser(data.user) })
        .catch(() => {})
    }
  }, [user, setUser])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full bg-bg-card border-r border-border-subtle z-40 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border-subtle">
        <Image src="/icon-192.png" alt="Professoryx" width={40} height={40} className="rounded-lg shrink-0" />
        {sidebarOpen && (
          <span className="font-[family-name:var(--font-orbitron)] font-bold text-lg gradient-text whitespace-nowrap">
            Professoryx
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary')} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Quick Action */}
      {sidebarOpen && (
        <div className="px-3 pb-3">
          <Link
            href="/aulas/preparar"
            className="btn-accent w-full text-sm py-2.5"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Aula
          </Link>
        </div>
      )}

      {/* User & Logout */}
      <div className="border-t border-border-subtle p-3">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.nome || '...'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-2.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-12 border-t border-border-subtle text-text-muted hover:text-text-primary transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </aside>
  )
}
