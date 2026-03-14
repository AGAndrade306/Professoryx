import { cn } from '@/lib/utils'
import { STATUS_LABELS, type StatusAula } from '@/types'

export default function StatusBadge({ status }: { status: StatusAula }) {
  const colorMap: Record<string, string> = {
    rascunho: 'badge-primary',
    pesquisando: 'badge-primary',
    extraindo: 'badge-primary',
    consolidando: 'badge-primary',
    'gerando-ia': 'badge-warning',
    'conteudo-gerado': 'badge-success',
    'gerando-apresentacao': 'badge-warning',
    'apresentacao-pronta': 'badge-success',
    erro: 'badge-error',
  }

  return (
    <span className={cn('badge', colorMap[status] || 'badge-primary')}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
