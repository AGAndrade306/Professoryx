'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  ArrowLeft, Save, RefreshCw, Sparkles, Edit3, Check, X,
  Presentation, ChevronDown, ChevronUp, BookOpen, Layers
} from 'lucide-react'
import type { Aula, Slide, StatusAula } from '@/types'
import toast from 'react-hot-toast'

export default function RevisarAulaPage() {
  const params = useParams()
  const router = useRouter()
  const [aula, setAula] = useState<Aula | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [regeneratingSlide, setRegeneratingSlide] = useState<string | null>(null)
  const [editingSlide, setEditingSlide] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ titulo: '', conteudo: '', observacoes: '' })
  const [generatingGamma, setGeneratingGamma] = useState(false)

  useEffect(() => {
    fetchAula()
  }, [params.id])

  async function fetchAula() {
    try {
      const res = await fetch(`/api/aulas/${params.id}`)
      if (res.ok) {
        setAula(await res.json())
      } else {
        toast.error('Aula não encontrada')
        router.push('/historico')
      }
    } catch {
      toast.error('Erro ao carregar aula')
    } finally {
      setLoading(false)
    }
  }

  function startEditing(slide: Slide) {
    setEditingSlide(slide.id)
    setEditForm({
      titulo: slide.titulo,
      conteudo: slide.conteudo,
      observacoes: slide.observacoes || '',
    })
  }

  function cancelEditing() {
    setEditingSlide(null)
    setEditForm({ titulo: '', conteudo: '', observacoes: '' })
  }

  async function saveSlide(slideId: string) {
    try {
      const res = await fetch(`/api/aulas/${params.id}/slides`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId, ...editForm }),
      })
      if (res.ok) {
        toast.success('Slide salvo')
        setEditingSlide(null)
        fetchAula()
      } else {
        toast.error('Erro ao salvar slide')
      }
    } catch {
      toast.error('Erro ao salvar slide')
    }
  }

  async function handleRegenerateSlide(slideId: string) {
    setRegeneratingSlide(slideId)
    try {
      const res = await fetch(`/api/aulas/${params.id}/regenerar-slide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId }),
      })
      if (res.ok) {
        toast.success('Slide regenerado')
        fetchAula()
      } else {
        toast.error('Erro ao regenerar slide')
      }
    } catch {
      toast.error('Erro ao regenerar slide')
    } finally {
      setRegeneratingSlide(null)
    }
  }

  async function handleRegenerateAll() {
    if (!confirm('Regenerar todos os slides? As edições manuais serão perdidas.')) return
    setRegenerating(true)
    try {
      const res = await fetch(`/api/aulas/${params.id}/regenerar`, { method: 'POST' })
      if (res.ok) {
        toast.success('Todos os slides foram regenerados')
        fetchAula()
      } else {
        toast.error('Erro ao regenerar slides')
      }
    } catch {
      toast.error('Erro ao regenerar slides')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleGenerateGamma() {
    setGeneratingGamma(true)
    try {
      const res = await fetch(`/api/aulas/${params.id}/gerar-gamma`, { method: 'POST' })
      if (res.ok) {
        const blob = await res.blob()
        const disposition = res.headers.get('Content-Disposition') || ''
        const filenameMatch = disposition.match(/filename="?(.+?)"?$/)
        const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : `${aula?.tituloAula || aula?.tema || 'apresentacao'}.pptx`

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Apresentação baixada com sucesso!')
        fetchAula()
      } else {
        toast.error('Erro ao gerar apresentação')
      }
    } catch {
      toast.error('Erro ao gerar apresentação')
    } finally {
      setGeneratingGamma(false)
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

  if (!aula) {
    return (
      <AppShell>
        <p className="text-text-muted py-20 text-center">Aula não encontrada.</p>
      </AppShell>
    )
  }

  const slides = aula.slides || []

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-5 h-5 text-text-muted" />
              </button>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-[family-name:var(--font-orbitron)] text-xl lg:text-2xl font-bold">
                Revisar Aula
              </h1>
            </div>
            <div className="flex items-center gap-3 ml-[52px]">
              <p className="text-text-secondary text-sm">{aula.tituloAula || aula.tema}</p>
              <StatusBadge status={aula.status as StatusAula} />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-[52px] lg:ml-0">
            <button
              onClick={handleRegenerateAll}
              disabled={regenerating}
              className="btn-secondary text-xs"
            >
              {regenerating ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Regenerar Todos
            </button>
            <button
              onClick={handleGenerateGamma}
              disabled={generatingGamma || slides.length === 0}
              className="btn-success text-xs"
            >
              {generatingGamma ? <LoadingSpinner size="sm" /> : <Presentation className="w-3.5 h-3.5" />}
              Gerar Apresentação
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="card flex flex-wrap items-center gap-6 mb-6 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-text-secondary text-sm">{aula.materia?.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary-orange" />
            <span className="text-text-secondary text-sm">{aula.tema}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-text-muted" />
            <span className="text-text-secondary text-sm">{slides.length} slides</span>
          </div>
        </div>

        {/* Slides */}
        <div className="space-y-4">
          {slides.map((slide) => {
            const isEditing = editingSlide === slide.id
            const isRegenerating = regeneratingSlide === slide.id

            return (
              <div key={slide.id} className="card animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-primary">
                        {slide.numero}
                      </span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input-field text-sm font-semibold py-1"
                        value={editForm.titulo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, titulo: e.target.value }))}
                      />
                    ) : (
                      <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold text-text-primary">
                        {slide.titulo}
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveSlide(slide.id)} className="p-1.5 rounded-lg hover:bg-secondary-green/10 text-secondary-green transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditing} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(slide)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegenerateSlide(slide.id)}
                          disabled={isRegenerating}
                          className="p-1.5 rounded-lg hover:bg-secondary-orange/10 text-text-muted hover:text-secondary-orange transition-colors"
                          title="Regenerar slide"
                        >
                          {isRegenerating ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                    {slide.editadoManual && (
                      <span className="badge badge-warning text-[10px]">Editado</span>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      className="textarea-field text-sm"
                      rows={6}
                      value={editForm.conteudo}
                      onChange={(e) => setEditForm(prev => ({ ...prev, conteudo: e.target.value }))}
                    />
                    <div>
                      <label className="label text-xs">Observações</label>
                      <textarea
                        className="textarea-field text-sm"
                        rows={2}
                        value={editForm.observacoes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, observacoes: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-text-secondary text-sm whitespace-pre-line pl-11">
                      {slide.conteudo}
                    </div>
                    {slide.observacoes && (
                      <div className="mt-3 pl-11 pt-3 border-t border-border-subtle">
                        <p className="text-text-muted text-xs italic">
                          <span className="text-secondary-orange font-medium not-italic">Obs:</span> {slide.observacoes}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom actions */}
        {slides.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
            <button onClick={() => router.back()} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              onClick={handleGenerateGamma}
              disabled={generatingGamma}
              className="btn-success py-3 px-6 text-base font-bold"
            >
              {generatingGamma ? (
                <>
                  <LoadingSpinner size="sm" />
                  Gerando apresentação...
                </>
              ) : (
                <>
                  <Presentation className="w-5 h-5" />
                  Gerar Apresentação Final
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
