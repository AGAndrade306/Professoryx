'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Clock, Eye, Copy, Trash2, GraduationCap, BookOpen, Calendar
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Aula, StatusAula } from '@/types'
import toast from 'react-hot-toast'

export default function HistoricoPage() {
  const router = useRouter()
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchAulas()
  }, [])

  async function fetchAulas() {
    try {
      const res = await fetch('/api/aulas')
      if (res.ok) setAulas(await res.json())
    } catch {
      toast.error('Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta aula permanentemente?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/aulas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAulas(prev => prev.filter(a => a.id !== id))
        toast.success('Aula excluída')
      }
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setDeleting(null)
    }
  }

  async function handleDuplicate(aula: Aula) {
    router.push(`/aulas/preparar?materiaId=${aula.materiaId}`)
    toast.success('Preencha o tema para criar uma nova aula baseada nesta matéria')
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-accent-blue-deep/10 border border-accent-blue-deep/20">
            <Clock className="w-5 h-5 text-accent-blue-light" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-2xl lg:text-3xl font-bold">Histórico</h1>
            <p className="text-text-muted text-sm">Todas as suas aulas geradas.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : aulas.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nenhuma aula no histórico"
            description="Suas aulas aparecerão aqui depois de serem preparadas."
            action={
              <Link href="/aulas/preparar" className="btn-primary">
                <GraduationCap className="w-4 h-4" />
                Preparar Primeira Aula
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {aulas.map((aula) => (
              <div key={aula.id} className="card flex flex-col sm:flex-row sm:items-center gap-4 py-3 animate-slide-up">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold text-text-primary truncate">
                      {aula.tituloAula || aula.tema}
                    </h3>
                    <StatusBadge status={aula.status as StatusAula} />
                  </div>
                  <div className="flex items-center gap-4 text-text-muted text-xs">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {aula.materia?.nome || '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(aula.createdAt)}
                    </span>
                    <span>{aula.slides?.length || aula.quantidadeSlides} slides</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={
                      aula.status === 'apresentacao-pronta'
                        ? `/aulas/${aula.id}/final`
                        : `/aulas/${aula.id}/revisar`
                    }
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Abrir
                  </Link>
                  <button
                    onClick={() => handleDuplicate(aula)}
                    className="btn-secondary text-xs py-1.5 px-3"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(aula.id)}
                    disabled={deleting === aula.id}
                    className="btn-danger text-xs py-1.5 px-3"
                    title="Excluir"
                  >
                    {deleting === aula.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
