'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { BookOpen, Plus, Edit, Trash2, GraduationCap, Palette } from 'lucide-react'
import { truncate } from '@/lib/utils'
import { ESTILOS_VISUAIS, type EstiloVisual } from '@/types'
import type { Materia } from '@/types'
import toast from 'react-hot-toast'

export default function MateriasPage() {
  const router = useRouter()
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchMaterias()
  }, [])

  async function fetchMaterias() {
    try {
      const res = await fetch('/api/materias')
      if (res.ok) setMaterias(await res.json())
    } catch (err) {
      toast.error('Erro ao carregar matérias')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta matéria? Todas as aulas vinculadas também serão excluídas.')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/materias/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMaterias(prev => prev.filter(m => m.id !== id))
        toast.success('Matéria excluída')
      } else {
        toast.error('Erro ao excluir matéria')
      }
    } catch {
      toast.error('Erro ao excluir matéria')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-[family-name:var(--font-orbitron)] text-2xl lg:text-3xl font-bold">
                Minhas Matérias
              </h1>
            </div>
            <p className="text-text-muted text-sm">Gerencie suas disciplinas e configurações.</p>
          </div>
          <Link href="/materias/nova" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nova Matéria
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : materias.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma matéria cadastrada"
            description="Cadastre sua primeira matéria para começar a preparar aulas com IA."
            action={
              <Link href="/materias/nova" className="btn-primary">
                <Plus className="w-4 h-4" />
                Cadastrar Matéria
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materias.map((materia) => (
              <div key={materia.id} className="card group animate-slide-up">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold text-text-primary">
                      {materia.nome}
                    </h3>
                  </div>
                </div>

                <p className="text-text-secondary text-xs mb-3 line-clamp-2">
                  {truncate(materia.ementa, 120)}
                </p>

                <div className="flex items-center gap-1.5 mb-4">
                  <Palette className="w-3 h-3 text-text-muted" />
                  <span className="text-text-muted text-xs">
                    {ESTILOS_VISUAIS[materia.estiloVisualPadrao as EstiloVisual] || materia.estiloVisualPadrao}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                  <button
                    onClick={() => router.push(`/materias/${materia.id}/editar`)}
                    className="btn-secondary text-xs py-1.5 px-3 flex-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(materia.id)}
                    disabled={deleting === materia.id}
                    className="btn-danger text-xs py-1.5 px-3"
                  >
                    {deleting === materia.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                  <Link
                    href={`/aulas/preparar?materiaId=${materia.id}`}
                    className="btn-accent text-xs py-1.5 px-3 flex-1"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Criar Aula
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
