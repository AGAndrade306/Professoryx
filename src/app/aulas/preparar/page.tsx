'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import SlideQuantitySelector from '@/components/ui/SlideQuantitySelector'
import ProgressStepper from '@/components/ui/ProgressStepper'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { GraduationCap, BookOpen, Sparkles, Link as LinkIcon, FileText, MessageSquare, Plus, Users, BarChart3 } from 'lucide-react'
import { PERFIS_PUBLICO, NIVEIS_AULA, ETAPAS_GERACAO, type PerfilPublico, type NivelAula } from '@/types'
import type { Materia, StatusAula } from '@/types'
import toast from 'react-hot-toast'

export default function PrepararAulaPage() {
  return (
    <Suspense fallback={<AppShell><div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div></AppShell>}>
      <PrepararAulaContent />
    </Suspense>
  )
}

function PrepararAulaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedMateriaId = searchParams.get('materiaId')

  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [preparing, setPreparing] = useState(false)
  const [currentStep, setCurrentStep] = useState<StatusAula | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const [form, setForm] = useState({
    materiaId: preselectedMateriaId || '',
    tema: '',
    quantidadeSlides: 10,
    linksExtras: '',
    materialExtraTexto: '',
    observacoesIA: '',
    perfilPublico: 'graduacao' as PerfilPublico,
    nivelAula: 'intermediaria' as NivelAula,
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/materias')
        if (res.ok) {
          const data = await res.json()
          setMaterias(data)
          if (preselectedMateriaId && data.some((m: Materia) => m.id === preselectedMateriaId)) {
            setForm(prev => ({ ...prev, materiaId: preselectedMateriaId }))
          }
        }
      } catch (err) {
        toast.error('Erro ao carregar matérias')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [preselectedMateriaId])

  function update(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handlePrepare(e: React.FormEvent) {
    e.preventDefault()

    if (!form.materiaId) {
      toast.error('Selecione uma matéria')
      return
    }
    if (!form.tema.trim()) {
      toast.error('Informe o tema da aula')
      return
    }

    setPreparing(true)
    setCompletedSteps([])

    try {
      // Step 1: Create the aula record
      const createRes = await fetch('/api/aulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!createRes.ok) {
        throw new Error('Erro ao criar aula')
      }

      const aula = await createRes.json()

      // Step 2: Start the preparation pipeline
      setCurrentStep('pesquisando')

      // Simulate step progression for UX
      const stepTimers = [
        { step: 'pesquisando', delay: 0 },
        { step: 'extraindo', delay: 2000 },
        { step: 'consolidando', delay: 4000 },
        { step: 'gerando-ia', delay: 5500 },
      ]

      for (const { step, delay } of stepTimers) {
        await new Promise(r => setTimeout(r, delay === 0 ? 0 : delay - (stepTimers[stepTimers.indexOf({ step, delay }) - 1]?.delay || 0)))
        if (step !== 'pesquisando') {
          setCompletedSteps(prev => [...prev, stepTimers[stepTimers.indexOf({ step, delay }) - 1]?.step || 'pesquisando'])
        }
        setCurrentStep(step as StatusAula)
      }

      // Actually call the pipeline
      const prepRes = await fetch(`/api/aulas/${aula.id}/preparar`, {
        method: 'POST',
      })

      if (!prepRes.ok) {
        throw new Error('Erro no pipeline de preparação')
      }

      setCompletedSteps(['pesquisando', 'extraindo', 'consolidando', 'gerando-ia', 'conteudo-gerado'])
      setCurrentStep('conteudo-gerado')
      toast.success('Aula preparada com sucesso!')

      // Redirect to review page after a brief moment
      setTimeout(() => {
        router.push(`/aulas/${aula.id}/revisar`)
      }, 1500)
    } catch (err) {
      toast.error('Erro ao preparar aula. Tente novamente.')
      setCurrentStep(null)
    } finally {
      setPreparing(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-secondary-orange/10 border border-secondary-orange/20">
            <GraduationCap className="w-5 h-5 text-secondary-orange" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-2xl lg:text-3xl font-bold">
              Preparar Aula
            </h1>
            <p className="text-text-muted text-sm">Defina o tema e deixe a IA fazer o resto.</p>
          </div>
        </div>

        {materias.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma matéria cadastrada"
            description="Você precisa cadastrar uma matéria antes de preparar uma aula."
            action={
              <button onClick={() => router.push('/materias/nova')} className="btn-primary">
                <Plus className="w-4 h-4" />
                Cadastrar Matéria
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePrepare} className="space-y-6">
                {/* Matéria */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold">Matéria</h2>
                  </div>
                  <select
                    className="input-field"
                    value={form.materiaId}
                    onChange={(e) => update('materiaId', e.target.value)}
                  >
                    <option value="">Selecione a matéria...</option>
                    {materias.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Tema */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-secondary-orange" />
                    <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold">Tema da Aula</h2>
                  </div>
                  <input
                    type="text"
                    className="input-field text-base"
                    placeholder="Ex: Padrões de Projeto em Engenharia de Software"
                    value={form.tema}
                    onChange={(e) => update('tema', e.target.value)}
                  />
                </div>

                {/* Slide Quantity */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold">Quantidade de Slides</h2>
                  </div>
                  <SlideQuantitySelector
                    value={form.quantidadeSlides}
                    onChange={(v) => update('quantidadeSlides', v)}
                  />
                </div>

                {/* Perfil e Nível */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-primary" />
                    <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold">Público e Nível</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Perfil do Público</label>
                      <select
                        className="input-field"
                        value={form.perfilPublico}
                        onChange={(e) => update('perfilPublico', e.target.value)}
                      >
                        {(Object.entries(PERFIS_PUBLICO) as [PerfilPublico, string][]).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Nível da Aula</label>
                      <select
                        className="input-field"
                        value={form.nivelAula}
                        onChange={(e) => update('nivelAula', e.target.value)}
                      >
                        {(Object.entries(NIVEIS_AULA) as [NivelAula, string][]).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Optional fields */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <LinkIcon className="w-4 h-4 text-text-muted" />
                    <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold text-text-secondary">
                      Material Complementar <span className="text-text-muted font-normal">(opcional)</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label">Links extras (um por linha)</label>
                      <textarea
                        className="textarea-field"
                        placeholder="https://exemplo.com/artigo-relevante&#10;https://outro-site.com/material"
                        rows={3}
                        value={form.linksExtras}
                        onChange={(e) => update('linksExtras', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Material extra em texto</label>
                      <textarea
                        className="textarea-field"
                        placeholder="Cole aqui qualquer material adicional, resumos ou anotações que possam enriquecer a aula..."
                        rows={4}
                        value={form.materialExtraTexto}
                        onChange={(e) => update('materialExtraTexto', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        Observações para a IA
                      </label>
                      <textarea
                        className="textarea-field"
                        placeholder="Ex: Foque mais em exemplos práticos, use analogias simples, inclua dados estatísticos recentes..."
                        rows={3}
                        value={form.observacoesIA}
                        onChange={(e) => update('observacoesIA', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={preparing}
                  className="btn-accent w-full py-4 text-base font-bold glow-orange"
                >
                  {preparing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Preparando aula...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Preparar Aula com IA
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar: Progress */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold mb-4">
                  {preparing ? 'Progresso' : 'Etapas da Geração'}
                </h3>

                {currentStep ? (
                  <ProgressStepper
                    steps={ETAPAS_GERACAO}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                  />
                ) : (
                  <div className="space-y-3">
                    {ETAPAS_GERACAO.map((step, i) => (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-border-subtle text-text-muted">
                          <span className="text-xs font-medium">{i + 1}</span>
                        </div>
                        <span className="text-text-muted text-sm">{step.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {preparing && (
                  <div className="mt-6 pt-4 border-t border-border-subtle">
                    <p className="text-text-muted text-xs">
                      Pesquisando referências na web, consolidando material e gerando conteúdo com inteligência artificial...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
