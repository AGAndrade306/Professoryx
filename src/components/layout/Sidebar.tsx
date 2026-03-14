'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Clock,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
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
  const { sidebarOpen, toggleSidebar } = useStore()

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full bg-bg-card border-r border-border-subtle z-40 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border-subtle">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
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
