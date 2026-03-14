'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, BookOpen, GraduationCap, Sparkles, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { email, senha } : { nome, email, senha }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro inesperado')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-surface relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-secondary-orange rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold gradient-text">
              Professoryx
            </h1>
          </div>

          <p className="text-text-secondary text-lg max-w-md mb-12">
            Prepare aulas completas em minutos com inteligência artificial. Slides profissionais, conteúdo didático e apresentações prontas.
          </p>

          <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
            {[
              { icon: BookOpen, text: 'Organize suas matérias e ementas' },
              { icon: Sparkles, text: 'Gere conteúdo com IA em segundos' },
              { icon: GraduationCap, text: 'Apresentações prontas para a sala de aula' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-card/50 border border-border-subtle">
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-text-secondary">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-dark">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-[family-name:var(--font-orbitron)] text-2xl font-bold gradient-text">Professoryx</span>
          </div>

          <h2 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-text-primary mb-1">
            {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
          </h2>
          <p className="text-text-muted text-sm mb-8">
            {isLogin ? 'Entre para preparar suas aulas com IA.' : 'Crie sua conta e comece agora.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label">Nome completo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
