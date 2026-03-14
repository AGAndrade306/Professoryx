import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
        <Icon className="w-8 h-8 text-primary/40" />
      </div>
      <h3 className="font-[family-name:var(--font-orbitron)] text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-text-muted text-sm max-w-md mb-6">{description}</p>
      {action}
    </div>
  )
}
