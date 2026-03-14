'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  ArrowLeft, Download, ExternalLink, PlusCircle, RefreshCw,
  CheckCircle2, Presentation, Sparkles, Eye
} from 'lucide-react'
import type { Aula, StatusAula } from '@/types'
import toast from 'react-hot-toast'

export default function FinalAulaPage() {
  const params = useParams()
  const router = useRouter()
  const [aula, setAula] = useState<Aula | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/aulas/${params.id}`)
        if (res.ok) setAula(await res.json())
      } catch {
        toast.error('Erro ao carregar aula')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

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

  const isReady = aula.status === 'apresentacao-pronta'
  const isGenerating = aula.status === 'gerando-apresentacao'
  const isError = aula.status === 'erro'

  return (
    <AppShell>
      <div className="animate-fade-in max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {isReady ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary-green/10 border border-secondary-green/20 mb-4">
              <CheckCircle2 className="w-10 h-10 text-secondary-green" />
            </div>
          ) : isGenerating ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-pulse-slow">
              <Presentation className="w-10 h-10 text-primary" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary-orange/10 border border-secondary-orange/20 mb-4">
              <Sparkles className="w-10 h-10 text-secondary-orange" />
            </div>
          )}

          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl lg:text-3xl font-bold mb-2">
            {isReady ? 'Apresentação Pronta!' : isGenerating ? 'Gerando Apresentação...' : 'Apresentação'}
          </h1>
          <p className="text-text-muted text-sm">
            {aula.tituloAula || aula.tema}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <StatusBadge status={aula.status as StatusAula} />
          </div>
        </div>

        {/* Info Card */}
        <div className="card mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-muted text-xs mb-1">Matéria</p>
              <p className="text-text-primary font-medium">{aula.materia?.nome}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Tema</p>
              <p className="text-text-primary font-medium">{aula.tema}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Slides</p>
              <p className="text-text-primary font-medium">{aula.slides?.length || aula.quantidadeSlides}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs mb-1">Status</p>
              <StatusBadge status={aula.status as StatusAula} />
            </div>
          </div>
        </div>

        {/* Actions */}
        {isReady && (
          <div className="space-y-3 mb-8">
            {aula.gammaPreviewUrl && (
              <a
                href={aula.gammaPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-3.5 text-base justify-center"
              >
                <Eye className="w-5 h-5" />
                Visualizar Apresentação
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {aula.gammaDownloadUrl && (
              <a
                href={aula.gammaDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent w-full py-3.5 text-base justify-center"
              >
                <Download className="w-5 h-5" />
                Baixar Apresentação
              </a>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="card text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-text-secondary text-sm mt-4">
              Gerando sua apresentação com a identidade visual Professoryx...
            </p>
            <p className="text-text-muted text-xs mt-2">
              Isso pode levar alguns segundos.
            </p>
          </div>
        )}

        {isError && (
          <div className="card text-center py-8 border-red-500/20">
            <p className="text-red-400 text-sm mb-4">
              Ocorreu um erro ao gerar a apresentação.
            </p>
            <button
              onClick={() => router.push(`/aulas/${params.id}/revisar`)}
              className="btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
          <button
            onClick={() => router.push(`/aulas/${params.id}/revisar`)}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Slides
          </button>
          <button
            onClick={() => router.push('/aulas/preparar')}
            className="btn-primary"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Aula
          </button>
        </div>
      </div>
    </AppShell>
  )
}
