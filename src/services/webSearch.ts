import type { FontePesquisa } from '@/types'

interface SerpApiResult {
  title: string
  link: string
  snippet: string
}

interface SerpApiResponse {
  organic_results?: SerpApiResult[]
}

/**
 * Etapa 2 — Pesquisa web via SerpAPI
 * Busca os 6 primeiros resultados relevantes para o tema.
 */
export async function searchWeb(query: string): Promise<FontePesquisa[]> {
  const apiKey = process.env.SERPAPI_KEY

  if (!apiKey || apiKey === 'your-serpapi-key-here') {
    console.warn('[webSearch] SERPAPI_KEY não configurada, usando fallback.')
    return getFallbackResults(query)
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: 'google',
      hl: 'pt-br',
      gl: 'br',
      num: '8',
    })

    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.error(`[webSearch] SerpAPI retornou ${res.status}`)
      return getFallbackResults(query)
    }

    const data: SerpApiResponse = await res.json()
    const results = data.organic_results || []

    // Filtrar resultados ruins (YouTube, redes sociais, PDFs)
    const filtered = results.filter((r) => {
      const url = r.link.toLowerCase()
      return (
        !url.includes('youtube.com') &&
        !url.includes('facebook.com') &&
        !url.includes('instagram.com') &&
        !url.includes('tiktok.com') &&
        !url.endsWith('.pdf')
      )
    })

    // Pegar os 6 primeiros
    const top6 = filtered.slice(0, 6)

    // Etapa 3 — Extrair conteúdo de cada link via Jina Reader
    const fontes = await Promise.allSettled(
      top6.map((r) => extractContent(r.link, r.title))
    )

    return fontes
      .filter((f): f is PromiseFulfilledResult<FontePesquisa> => f.status === 'fulfilled' && f.value.conteudo.length > 100)
      .map((f) => f.value)
  } catch (error) {
    console.error('[webSearch] Erro na busca:', error)
    return getFallbackResults(query)
  }
}

/**
 * Etapa 3 — Extração de conteúdo via Jina Reader
 * Jina Reader (r.jina.ai) extrai o conteúdo textual limpo de qualquer URL.
 * Gratuito, sem necessidade de API key.
 */
async function extractContent(url: string, fallbackTitle: string): Promise<FontePesquisa> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`

    const res = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'text',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      throw new Error(`Jina retornou ${res.status}`)
    }

    let content = await res.text()

    // Limitar tamanho do conteúdo (máx ~6000 chars por fonte)
    if (content.length > 6000) {
      content = content.slice(0, 6000) + '...'
    }

    // Extrair título do conteúdo se disponível (primeira linha geralmente é o título)
    const lines = content.split('\n').filter(Boolean)
    const titulo = lines[0]?.startsWith('#')
      ? lines[0].replace(/^#+\s*/, '')
      : fallbackTitle

    return {
      titulo,
      url,
      conteudo: content,
    }
  } catch (error) {
    console.warn(`[extractContent] Falha ao extrair ${url}:`, error)
    // Retorna ao menos o snippet da busca
    return {
      titulo: fallbackTitle,
      url,
      conteudo: `Não foi possível extrair o conteúdo completo desta fonte. URL: ${url}`,
    }
  }
}

/**
 * Resultados de fallback caso SerpAPI não esteja configurada.
 * Permite testar o fluxo sem API key.
 */
function getFallbackResults(query: string): FontePesquisa[] {
  return [
    {
      titulo: `${query} — Conceitos Fundamentais`,
      url: `https://exemplo.com/artigo-1`,
      conteudo: `Este artigo aborda os conceitos fundamentais sobre ${query}. Os principais tópicos incluem: definições essenciais, contexto histórico, aplicações práticas e tendências atuais. O tema é relevante para o contexto acadêmico por suas implicações teóricas e práticas. Material gerado como fallback — configure a SERPAPI_KEY para busca real.`,
    },
    {
      titulo: `Guia Completo sobre ${query}`,
      url: `https://exemplo.com/artigo-2`,
      conteudo: `Guia completo e atualizado sobre ${query}. Inclui análise detalhada dos principais aspectos, metodologias comumente utilizadas, estudos de caso relevantes e referências bibliográficas. Material gerado como fallback — configure a SERPAPI_KEY para busca real.`,
    },
    {
      titulo: `${query}: Teoria e Prática`,
      url: `https://exemplo.com/artigo-3`,
      conteudo: `Análise aprofundada combinando teoria e prática sobre ${query}. Apresenta framework conceitual, exemplos do mundo real, dados estatísticos relevantes e exercícios para fixação. Material gerado como fallback — configure a SERPAPI_KEY para busca real.`,
    },
  ]
}
