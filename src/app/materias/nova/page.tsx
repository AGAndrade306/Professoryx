'use client'

import AppShell from '@/components/layout/AppShell'
import MateriaForm from '@/components/materias/MateriaForm'
import { BookOpen } from 'lucide-react'

export default function NovaMateriaPage() {
  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold">Nova Matéria</h1>
            <p className="text-text-muted text-sm">Cadastre uma nova disciplina.</p>
          </div>
        </div>
        <MateriaForm />
      </div>
    </AppShell>
  )
}
