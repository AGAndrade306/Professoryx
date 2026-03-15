const GAMMA_API_URL = 'https://public-api.gamma.app/v1.0'

export interface GammaGenerationResult {
  generationId: string
  status: 'pending' | 'completed' | 'failed'
  gammaUrl?: string
  exportUrl?: string
  credits?: { deducted: number; remaining: number }
  error?: string
}

/**
 * Envia o conteúdo dos slides para o Gamma gerar uma apresentação com design.
 * Usa textMode "preserve" para manter o conteúdo que já geramos via OpenAI.
 * Usa cardSplit "inputTextBreaks" para que cada seção "---" vire um card/slide.
 */
export async function generatePresentation(payload: {
  titulo: string
  slides: Array<{ titulo: string; conteudo: string }>
  estiloVisual: string
  exportAs?: 'pptx' | 'pdf'
}): Promise<GammaGenerationResult> {
  const apiKey = process.env.GAMMA_API_KEY

  if (!apiKey || apiKey === 'your-gamma-api-key-here') {
    throw new Error('GAMMA_API_KEY não configurada. Adicione sua chave do Gamma nas variáveis de ambiente.')
  }

  // Formatar conteúdo: cada slide vira uma seção separada por "---"
  // O Gamma usa cardSplit "inputTextBreaks" para respeitar as quebras
  const inputText = payload.slides
    .map((s) => `# ${s.titulo}\n\n${s.conteudo}`)
    .join('\n\n---\n\n')

  const body: Record<string, unknown> = {
    inputText,
    textMode: 'preserve',
    format: 'presentation',
    numCards: payload.slides.length,
    cardSplit: 'inputTextBreaks',
    textOptions: {
      amount: 'medium',
      tone: 'Profissional e acadêmico, claro e didático',
      audience: 'Estudantes universitários e professores',
      language: 'pt-br',
    },
    imageOptions: {
      source: 'webFreeToUse',
    },
    cardOptions: {
      dimensions: '16x9',
    },
    additionalInstructions: `Esta é uma aula acadêmica intitulada "${payload.titulo}".
Mantenha o conteúdo de cada card exatamente como fornecido.
Use um design limpo, profissional e moderno.
Adicione imagens relevantes ao tema de cada slide quando possível.`,
  }

  if (payload.exportAs) {
    body.exportAs = payload.exportAs
  }

  const res = await fetch(`${GAMMA_API_URL}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(`Gamma API error: ${error.message || res.status}`)
  }

  const data = await res.json()

  return {
    generationId: data.generationId,
    status: 'pending',
  }
}

/**
 * Verifica o status da geração no Gamma.
 * Faz polling até completar ou falhar.
 */
export async function checkGenerationStatus(generationId: string): Promise<GammaGenerationResult> {
  const apiKey = process.env.GAMMA_API_KEY!

  const res = await fetch(`${GAMMA_API_URL}/generations/${generationId}`, {
    headers: { 'X-API-KEY': apiKey },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`Gamma status check failed: ${res.status}`)
  }

  const data = await res.json()

  return {
    generationId: data.generationId,
    status: data.status,
    gammaUrl: data.gammaUrl,
    exportUrl: data.exportUrl,
    credits: data.credits,
    error: data.error?.message,
  }
}

/**
 * Faz polling do status da geração até completar ou falhar.
 * Tenta no máximo 60 vezes (2 minutos com intervalo de 2s).
 */
export async function waitForGeneration(generationId: string): Promise<GammaGenerationResult> {
  const maxAttempts = 60
  const intervalMs = 2000

  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkGenerationStatus(generationId)

    if (result.status === 'completed') {
      return result
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Gamma generation failed')
    }

    // Still pending — wait before next poll
    await new Promise((r) => setTimeout(r, intervalMs))
  }

  throw new Error('Gamma generation timed out after 2 minutes')
}
