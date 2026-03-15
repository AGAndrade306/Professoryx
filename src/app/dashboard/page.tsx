'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import MetricCard from '@/components/ui/MetricCard'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Image from 'next/image'
import { BookOpen, GraduationCap, Clock, PlusCircle, ArrowRight, Sparkles } from 'lucide-react'
import { formatDate, truncate } from '@/lib/utils'
import type { Materia, Aula, StatusAula } from '@/types'

export default function DashboardPage() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [matRes, aulaRes] = await Promise.all([
          fetch('/api/materias'),
          fetch('/api/aulas'),
        ])
        if (matRes.ok) setMaterias(await matRes.json())
        if (aulaRes.ok) setAulas(await aulaRes.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const aulasFinalizadas = aulas.filter(a => a.status === 'conteudo-gerado' || a.status === 'apresentacao-pronta')
  const ultimasAulas = aulas.slice(0, 5)

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/icon-192.png" alt="Professoryx" width={36} height={36} className="rounded-lg" />
            <h1 className="font-[family-name:var(--font-orbitron)] text-2xl lg:text-3xl font-bold">
              Dashboard
            </h1>
          </div>
          <p className="text-text-muted text-sm">
            Bem-vindo ao Professoryx. Prepare aulas incríveis com inteligência artificial.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Matérias" value={materias.length} icon={BookOpen} color="blue" />
              <MetricCard label="Aulas Criadas" value={aulas.length} icon={GraduationCap} color="orange" />
              <MetricCard label="Finalizadas" value={aulasFinalizadas.length} icon={Sparkles} color="green" />
              <MetricCard label="Esta Semana" value={aulas.filter(a => {
                const d = new Date(a.createdAt)
                const now = new Date()
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return d >= weekAgo
              }).length} icon={Clock} color="deep-blue" subtitle="últimos 7 dias" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Link href="/aulas/preparar" className="card group flex items-center gap-4 hover:border-secondary-orange/30 hover:shadow-[0_0_30px_rgba(255,102,0,0.08)] transition-all">
                <div className="p-3 rounded-xl bg-secondary-orange/10 border border-secondary-orange/20 group-hover:bg-secondary-orange/15 transition-colors">
                  <PlusCircle className="w-6 h-6 text-secondary-orange" />
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold text-text-primary">
                    Nova Aula
                  </h3>
                  <p className="text-text-muted text-xs">Prepare uma aula com IA em minutos</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-secondary-orange transition-colors" />
              </Link>

              <Link href="/materias/nova" className="card group flex items-center gap-4 hover:border-primary/30 transition-all">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold text-text-primary">
                    Nova Matéria
                  </h3>
                  <p className="text-text-muted text-xs">Cadastre uma disciplina para suas aulas</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
              </Link>
            </div>

            {/* Recent lessons */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-semibold">Últimas Aulas</h2>
                {aulas.length > 0 && (
                  <Link href="/historico" className="text-primary text-sm hover:underline flex items-center gap-1">
                    Ver todas <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {ultimasAulas.length === 0 ? (
                <div className="card text-center py-12">
                  <GraduationCap className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted text-sm">Nenhuma aula criada ainda.</p>
                  <Link href="/aulas/preparar" className="btn-primary mt-4 inline-flex">
                    Criar primeira aula
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {ultimasAulas.map((aula) => (
                    <Link
                      key={aula.id}
                      href={aula.status === 'conteudo-gerado' || aula.status === 'apresentacao-pronta' ? `/aulas/${aula.id}/revisar` : `/aulas/${aula.id}/revisar`}
                      className="card flex items-center gap-4 py-3 hover:bg-bg-card-hover"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-text-primary truncate">{aula.tituloAula || aula.tema}</p>
                        <p className="text-text-muted text-xs">{aula.materia?.nome} · {formatDate(aula.createdAt)}</p>
                      </div>
                      <StatusBadge status={aula.status as StatusAula} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
