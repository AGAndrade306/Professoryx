import type { RespostaOpenAI, ConteudoConsolidado } from '@/types'
import { buildSlideGenerationPrompt, buildSlideRegenerationPrompt } from '@/prompts/slideGeneration'

/**
 * Gera slides via OpenAI API.
 * Faz a chamada real se OPENAI_API_KEY estiver configurada,
 * caso contrário usa mock para desenvolvimento.
 */
export async function generateSlides(
  data: ConteudoConsolidado,
  quantidadeSlides: number,
  perfilPublico: string,
  nivelAula: string
): Promise<{ prompt: string; response: RespostaOpenAI }> {
  const prompt = buildSlideGenerationPrompt(data, quantidadeSlides, perfilPublico, nivelAula)
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey === 'sk-your-openai-key-here') {
    console.warn('[openai] OPENAI_API_KEY não configurada, usando mock.')
    return { prompt, response: getMockResponse(data.tema, quantidadeSlides) }
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em criar aulas acadêmicas. Sempre responda em JSON válido, sem markdown.

REGRA CRÍTICA: O campo "conteudo" de cada slide (exceto o primeiro e o último) DEVE conter obrigatoriamente estas 4 seções nesta ordem:
1. Parágrafo explicativo (2-3 frases em texto corrido)
2. Pontos-chave (linhas começando com •)
3. Exemplo prático (linha começando com "Exemplo:")
4. Dica ou destaque (linha começando com "Dica:" ou "Importante:")

Se um slide não contiver essas 4 seções, ele é INVÁLIDO. Siga o formato exato do exemplo fornecido no prompt.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 10000,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error(`[openai] API retornou ${res.status}:`, error)
      throw new Error(`OpenAI API error: ${res.status}`)
    }

    const result = await res.json()
    const content = result.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da OpenAI')
    }

    const response: RespostaOpenAI = JSON.parse(content)

    // Validar estrutura
    if (!response.tituloAula || !Array.isArray(response.slides)) {
      throw new Error('Estrutura de resposta inválida')
    }

    // Garantir numeração
    response.slides = response.slides.map((s, i) => ({
      ...s,
      numero: i + 1,
    }))

    return { prompt, response }
  } catch (error) {
    console.error('[openai] Erro ao gerar slides:', error)
    throw error
  }
}

/**
 * Regenera um único slide via OpenAI API.
 */
export async function regenerateSlide(
  slideAtual: { titulo: string; conteudo: string },
  contextoAula: { tema: string; materia: string }
): Promise<{ titulo: string; conteudo: string; observacoes: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  const prompt = buildSlideRegenerationPrompt(slideAtual, contextoAula)

  if (!apiKey || apiKey === 'sk-your-openai-key-here') {
    console.warn('[openai] OPENAI_API_KEY não configurada, usando mock.')
    return {
      titulo: slideAtual.titulo + ' (Atualizado)',
      conteudo: slideAtual.conteudo + '\n\n• Conteúdo adicional gerado pela IA\n• Novos exemplos e perspectivas',
      observacoes: 'Slide regenerado com conteúdo aprimorado.',
    }
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em criar conteúdo acadêmico para slides. Sempre responda em JSON válido, sem markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`)
    }

    const result = await res.json()
    const content = result.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da OpenAI')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('[openai] Erro ao regenerar slide:', error)
    throw error
  }
}

/**
 * Mock para desenvolvimento sem API key.
 */
function getMockResponse(tema: string, quantidadeSlides: number): RespostaOpenAI {
  const slides = []
  const topicos = [
    'Conceitos Fundamentais', 'Contexto Histórico', 'Metodologias e Abordagens',
    'Análise Detalhada', 'Estudos de Caso', 'Aplicações Práticas',
    'Dados e Evidências', 'Comparação de Perspectivas', 'Tendências e Inovações',
    'Desafios e Oportunidades', 'Framework Conceitual', 'Exemplos do Mundo Real',
    'Debate e Discussão', 'Exercícios Propostos', 'Aprofundamento Teórico',
    'Aspectos Técnicos', 'Impacto e Resultados', 'Ferramentas e Recursos',
    'Boas Práticas', 'Perspectivas Futuras', 'Revisão Crítica', 'Síntese Parcial',
    'Conexões Interdisciplinares', 'Análise Comparativa', 'Conclusões Parciais',
    'Modelo Proposto', 'Implementação', 'Avaliação e Métricas',
  ]

  for (let i = 1; i <= quantidadeSlides; i++) {
    if (i === 1) {
      slides.push({
        numero: i,
        titulo: tema,
        conteudo: `Aula preparada com base em pesquisa atualizada.\n\nObjetivos:\n• Compreender os conceitos fundamentais\n• Analisar aplicações práticas\n• Discutir tendências e perspectivas`,
        observacoes: 'Slide de abertura — apresentar o tema e objetivos.',
      })
    } else if (i === quantidadeSlides) {
      slides.push({
        numero: i,
        titulo: 'Síntese e Reflexão',
        conteudo: `Pontos-chave:\n• Conceitos fundamentais de ${tema}\n• Aplicações e exemplos práticos\n\nPerguntas para reflexão:\n1. Como esses conceitos se aplicam na prática?\n2. Quais são os principais desafios?`,
        observacoes: 'Slide de encerramento.',
      })
    } else {
      const titulo = topicos[(i - 2) % topicos.length]
      slides.push({
        numero: i,
        titulo,
        conteudo: `Conteúdo sobre ${titulo.toLowerCase()} no contexto de ${tema}.\n\n• Ponto 1: Descrição e análise\n• Ponto 2: Exemplos e aplicações\n• Ponto 3: Relação com o contexto geral\n\n⚠️ Mock — configure OPENAI_API_KEY para conteúdo real.`,
        observacoes: `Explorar ${titulo.toLowerCase()} com exemplos práticos.`,
      })
    }
  }

  return { tituloAula: tema, slides }
}
