'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ESTILOS_VISUAIS, type EstiloVisual } from '@/types'
import type { Materia } from '@/types'
import toast from 'react-hot-toast'

interface MateriaFormProps {
  materia?: Materia | null
  isEditing?: boolean
}

export default function MateriaForm({ materia, isEditing }: MateriaFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(!!materia?.estiloVisualCustom)

  const [form, setForm] = useState({
    nome: materia?.nome || '',
    ementa: materia?.ementa || '',
    conteudoProgramatico: materia?.conteudoProgramatico || '',
    estiloVisualPadrao: materia?.estiloVisualPadrao || 'tech-academico',
    estiloVisualCustom: materia?.estiloVisualCustom || '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.nome || !form.ementa || !form.conteudoProgramatico) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      const url = isEditing ? `/api/materias/${materia!.id}` : '/api/materias'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Matéria atualizada!' : 'Matéria cadastrada!')
        router.push('/materias')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar matéria')
      }
    } catch {
      toast.error('Erro ao salvar matéria')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <label className="label">Nome da Matéria *</label>
        <input
          type="text"
          className="input-field"
          placeholder="Ex: Engenharia de Software"
          value={form.nome}
          onChange={(e) => update('nome', e.target.value)}
        />
      </div>

      <div>
        <label className="label">Ementa *</label>
        <textarea
          className="textarea-field"
          placeholder="Descreva a ementa da disciplina..."
          rows={4}
          value={form.ementa}
          onChange={(e) => update('ementa', e.target.value)}
        />
      </div>

      <div>
        <label className="label">Conteúdo Programático *</label>
        <textarea
          className="textarea-field"
          placeholder="Liste os tópicos do conteúdo programático..."
          rows={6}
          value={form.conteudoProgramatico}
          onChange={(e) => update('conteudoProgramatico', e.target.value)}
        />
      </div>

      <div>
        <label className="label">Estilo Visual Padrão</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.entries(ESTILOS_VISUAIS) as [EstiloVisual, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => update('estiloVisualPadrao', key)}
              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                form.estiloVisualPadrao === key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-subtle text-text-secondary hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-text-muted text-sm hover:text-text-primary transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Modo Avançado — Style Guide Personalizado
        </button>

        {showAdvanced && (
          <div className="mt-3">
            <textarea
              className="textarea-field"
              placeholder={`Descreva o style guide da matéria com texto livre. Exemplos:\n- Cores predominantes: azul e branco\n- Visual clean e minimalista\n- Pouco texto por slide\n- Uso frequente de diagramas e tabelas\n- Tom formal e institucional\n- Ícones discretos e modernos`}
              rows={6}
              value={form.estiloVisualCustom}
              onChange={(e) => update('estiloVisualCustom', e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
          {isEditing ? 'Salvar Alterações' : 'Cadastrar Matéria'}
        </button>
      </div>
    </form>
  )
}
