'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'orange' | 'green' | 'deep-blue'
  subtitle?: string
}

const colorMap = {
  blue: {
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: 'text-primary',
    glow: 'hover:shadow-[0_0_30px_rgba(0,102,255,0.12)]',
  },
  orange: {
    bg: 'bg-secondary-orange/10',
    border: 'border-secondary-orange/20',
    icon: 'text-secondary-orange',
    glow: 'hover:shadow-[0_0_30px_rgba(255,102,0,0.12)]',
  },
  green: {
    bg: 'bg-secondary-green/10',
    border: 'border-secondary-green/20',
    icon: 'text-secondary-green',
    glow: 'hover:shadow-[0_0_30px_rgba(102,255,51,0.12)]',
  },
  'deep-blue': {
    bg: 'bg-accent-blue-deep/10',
    border: 'border-accent-blue-deep/20',
    icon: 'text-accent-blue-light',
    glow: 'hover:shadow-[0_0_30px_rgba(0,51,170,0.12)]',
  },
}

export default function MetricCard({ label, value, icon: Icon, color = 'blue', subtitle }: MetricCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn('card group cursor-default', c.glow)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-text-primary">{value}</p>
          {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-2.5 rounded-lg', c.bg)}>
          <Icon className={cn('w-5 h-5', c.icon)} />
        </div>
      </div>
    </div>
  )
}
