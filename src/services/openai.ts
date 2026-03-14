import type { RespostaOpenAI, ConteudoConsolidado } from '@/types'
import { buildSlideGenerationPrompt } from '@/prompts/slideGeneration'

// Mock OpenAI service - replace with real OpenAI API calls
export async function generateSlides(
  data: ConteudoConsolidado,
  quantidadeSlides: number,
  perfilPublico: string,
  nivelAula: string
): Promise<{ prompt: string; response: RespostaOpenAI }> {
  const prompt = buildSlideGenerationPrompt(data, quantidadeSlides, perfilPublico, nivelAula)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Generate mock response
  const slides = []
  for (let i = 1; i <= quantidadeSlides; i++) {
    if (i === 1) {
      slides.push({
        numero: i,
        titulo: data.tema,
        conteudo: `Aula preparada com base em pesquisa atualizada e conteúdo programático da disciplina.\n\nObjetivos:\n• Compreender os conceitos fundamentais\n• Analisar aplicações práticas\n• Discutir tendências e perspectivas`,
        observacoes: 'Slide de abertura — apresentar o tema e objetivos da aula.',
      })
    } else if (i === quantidadeSlides) {
      slides.push({
        numero: i,
        titulo: 'Síntese e Reflexão',
        conteudo: `Pontos-chave abordados:\n• Conceitos fundamentais de ${data.tema}\n• Aplicações e exemplos práticos\n• Relação com o conteúdo programático\n\nPerguntas para reflexão:\n1. Como esses conceitos se aplicam na prática?\n2. Quais são os principais desafios?\n3. Qual a relevância para sua formação?`,
        observacoes: 'Slide de encerramento — recapitular e abrir para discussão.',
      })
    } else {
      const topicos = [
        'Conceitos Fundamentais',
        'Contexto Histórico',
        'Metodologias e Abordagens',
        'Análise Detalhada',
        'Estudos de Caso',
        'Aplicações Práticas',
        'Dados e Evidências',
        'Comparação de Perspectivas',
        'Tendências e Inovações',
        'Desafios e Oportunidades',
        'Framework Conceitual',
        'Exemplos do Mundo Real',
        'Debate e Discussão',
        'Exercícios Propostos',
        'Aprofundamento Teórico',
        'Aspectos Técnicos',
        'Impacto e Resultados',
        'Ferramentas e Recursos',
        'Boas Práticas',
        'Perspectivas Futuras',
        'Revisão Crítica',
        'Síntese Parcial',
        'Conexões Interdisciplinares',
        'Análise Comparativa',
        'Conclusões Parciais',
        'Modelo Proposto',
        'Implementação',
        'Avaliação e Métricas',
      ]
      const titulo = topicos[(i - 2) % topicos.length]
      slides.push({
        numero: i,
        titulo: `${titulo}`,
        conteudo: `Conteúdo detalhado sobre ${titulo.toLowerCase()} no contexto de ${data.tema}.\n\n• Ponto principal 1: Descrição e análise\n• Ponto principal 2: Exemplos e aplicações\n• Ponto principal 3: Relação com o contexto geral\n\nDestaque: Este tópico é fundamental para a compreensão do tema.`,
        observacoes: `Explorar ${titulo.toLowerCase()} com exemplos práticos.`,
      })
    }
  }

  const response: RespostaOpenAI = {
    tituloAula: data.tema,
    slides,
  }

  return { prompt, response }
}

export async function regenerateSlide(
  slideAtual: { titulo: string; conteudo: string },
  contextoAula: { tema: string; materia: string }
): Promise<{ titulo: string; conteudo: string; observacoes: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    titulo: slideAtual.titulo + ' (Atualizado)',
    conteudo: slideAtual.conteudo + '\n\n• Conteúdo adicional gerado pela IA\n• Novos exemplos e perspectivas\n• Material complementar atualizado',
    observacoes: 'Slide regenerado com conteúdo aprimorado.',
  }
}
