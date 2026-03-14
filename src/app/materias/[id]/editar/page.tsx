'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import MateriaForm from '@/components/materias/MateriaForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { BookOpen } from 'lucide-react'
import type { Materia } from '@/types'

export default function EditarMateriaPage() {
  const params = useParams()
  const [materia, setMateria] = useState<Materia | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/materias/${params.id}`)
        if (res.ok) setMateria(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold">Editar Matéria</h1>
            <p className="text-text-muted text-sm">Atualize as informações da disciplina.</p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : materia ? (
          <MateriaForm materia={materia} isEditing />
        ) : (
          <p className="text-text-muted">Matéria não encontrada.</p>
        )}
      </div>
    </AppShell>
  )
}
