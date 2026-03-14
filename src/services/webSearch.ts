import type { FontePesquisa } from '@/types'

// Mock web search - replace with real search API (SerpAPI, Bing API, etc.)
export async function searchWeb(query: string): Promise<FontePesquisa[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Return mock results for prototyping
  const mockResults: FontePesquisa[] = [
    {
      titulo: `${query} — Conceitos Fundamentais`,
      url: `https://exemplo.com/artigo-1-${encodeURIComponent(query)}`,
      conteudo: `Este artigo aborda os conceitos fundamentais sobre ${query}. Os principais tópicos incluem: definições essenciais, contexto histórico, aplicações práticas e tendências atuais. O tema é relevante para o contexto acadêmico por suas implicações teóricas e práticas.`,
    },
    {
      titulo: `Guia Completo sobre ${query}`,
      url: `https://exemplo.com/guia-${encodeURIComponent(query)}`,
      conteudo: `Guia completo e atualizado sobre ${query}. Inclui análise detalhada dos principais aspectos, metodologias comumente utilizadas, estudos de caso relevantes e referências bibliográficas. Ideal para uso em contexto educacional e preparação de materiais didáticos.`,
    },
    {
      titulo: `${query}: Teoria e Prática`,
      url: `https://exemplo.com/teoria-pratica-${encodeURIComponent(query)}`,
      conteudo: `Análise aprofundada combinando teoria e prática sobre ${query}. Apresenta framework conceitual, exemplos do mundo real, dados estatísticos relevantes e exercícios para fixação. Material adequado para diferentes níveis de formação acadêmica.`,
    },
    {
      titulo: `Tendências Atuais em ${query}`,
      url: `https://exemplo.com/tendencias-${encodeURIComponent(query)}`,
      conteudo: `As principais tendências e desenvolvimentos recentes em ${query}. Inovações tecnológicas, novas metodologias, impactos no mercado e na academia. Perspectivas futuras e desafios a serem enfrentados pela comunidade acadêmica e profissional.`,
    },
    {
      titulo: `${query} — Perspectiva Acadêmica`,
      url: `https://exemplo.com/academico-${encodeURIComponent(query)}`,
      conteudo: `Perspectiva acadêmica sobre ${query} com revisão de literatura, análise de pesquisas recentes, debates contemporâneos e contribuições de diferentes áreas do conhecimento. Inclui referências a autores seminais e publicações de impacto.`,
    },
    {
      titulo: `Aplicações Práticas de ${query}`,
      url: `https://exemplo.com/aplicacoes-${encodeURIComponent(query)}`,
      conteudo: `Compilação de aplicações práticas e estudos de caso sobre ${query}. Demonstra como os conceitos teóricos se traduzem em situações reais, com exemplos de implementação, resultados obtidos e lições aprendidas em diferentes contextos.`,
    },
  ]

  return mockResults
}
