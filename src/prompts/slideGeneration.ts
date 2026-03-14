import type { ConteudoConsolidado } from '@/types'

export function buildSlideGenerationPrompt(data: ConteudoConsolidado, quantidadeSlides: number, perfilPublico: string, nivelAula: string): string {
  const fontesTexto = data.fontes
    .map((f, i) => `--- Fonte ${i + 1}: ${f.titulo} (${f.url}) ---\n${f.conteudo.slice(0, 3000)}`)
    .join('\n\n')

  const perfilMap: Record<string, string> = {
    'ensino-medio': 'estudantes do ensino médio (linguagem acessível, exemplos do cotidiano)',
    'graduacao': 'estudantes de graduação (linguagem acadêmica, fundamentação teórica)',
    'pos-graduacao': 'estudantes de pós-graduação (linguagem avançada, análise crítica, estado da arte)',
    'curso-tecnico': 'estudantes de curso técnico (linguagem prática, foco em aplicação profissional)',
  }

  const nivelMap: Record<string, string> = {
    'introdutoria': 'Aula introdutória — apresentar conceitos fundamentais, definições e contexto geral.',
    'intermediaria': 'Aula intermediária — aprofundar conceitos, explorar relações e exemplos detalhados.',
    'avancada': 'Aula avançada — análise crítica, debates, fronteiras do conhecimento e aplicações complexas.',
  }

  return `Você é um assistente especializado em criar estruturas de aulas acadêmicas de alta qualidade.

CONTEXTO DA MATÉRIA:
- Matéria: ${data.ementaMateria ? 'Ver ementa abaixo' : 'Não informada'}
- Ementa: ${data.ementaMateria || 'Não informada'}
- Conteúdo Programático: ${data.conteudoProgramaticoMateria || 'Não informado'}

TEMA DA AULA: ${data.tema}

PÚBLICO-ALVO: ${perfilMap[perfilPublico] || perfilMap['graduacao']}

NÍVEL: ${nivelMap[nivelAula] || nivelMap['intermediaria']}

MATERIAL DE REFERÊNCIA COLETADO:
${fontesTexto || 'Nenhuma fonte externa disponível.'}

${data.linksExtrasUsuario.length > 0 ? `LINKS EXTRAS DO PROFESSOR:\n${data.linksExtrasUsuario.join('\n')}` : ''}

${data.materialExtraUsuario ? `MATERIAL ADICIONAL DO PROFESSOR:\n${data.materialExtraUsuario}` : ''}

INSTRUÇÕES:
1. Crie exatamente ${quantidadeSlides} slides para esta aula.
2. O primeiro slide deve ser o slide de título/abertura da aula.
3. Os slides centrais devem desenvolver o tema de forma progressiva e lógica.
4. O último slide deve conter uma síntese, conclusão ou perguntas para reflexão.
5. Cada slide deve ter um título claro e conteúdo bem estruturado.
6. Use tópicos, definições, exemplos práticos, comparações e fluxos quando adequado.
7. Evite texto excessivo — cada slide deve ser conciso e didático.
8. Use terminologia correta quando a matéria for técnica.
9. NÃO invente informações — baseie-se apenas no material fornecido.
10. Adapte a linguagem ao perfil do público-alvo.
11. Mantenha coerência e progressão entre os slides.

ESTILO VISUAL DESEJADO: ${data.estiloVisualPadraoMateria || 'tech acadêmico'}

Retorne SOMENTE um JSON válido no seguinte formato (sem markdown, sem comentários):
{
  "tituloAula": "Título da aula",
  "slides": [
    {
      "numero": 1,
      "titulo": "Título do slide",
      "conteudo": "Conteúdo do slide com formatação em tópicos quando adequado",
      "observacoes": "Observações para o professor (ex: mencionar exemplo X, fazer pergunta Y)"
    }
  ]
}`
}

export function buildSlideRegenerationPrompt(
  slideAtual: { titulo: string; conteudo: string },
  contextoAula: { tema: string; materia: string },
  instrucoes?: string
): string {
  return `Você é um assistente especializado em criar conteúdo acadêmico para slides.

Regenere o conteúdo do slide abaixo, melhorando a qualidade e clareza.

CONTEXTO:
- Tema da aula: ${contextoAula.tema}
- Matéria: ${contextoAula.materia}

SLIDE ATUAL:
- Título: ${slideAtual.titulo}
- Conteúdo: ${slideAtual.conteudo}

${instrucoes ? `INSTRUÇÕES ADICIONAIS: ${instrucoes}` : ''}

INSTRUÇÕES:
1. Mantenha o mesmo tema/assunto do slide.
2. Melhore a clareza, organização e didática.
3. Use tópicos, exemplos e definições quando adequado.
4. Seja conciso mas completo.

Retorne SOMENTE um JSON válido:
{
  "titulo": "Novo título do slide",
  "conteudo": "Novo conteúdo do slide",
  "observacoes": "Observações atualizadas"
}`
}

export function buildGammaPayloadPrompt(
  tituloAula: string,
  slides: Array<{ titulo: string; conteudo: string }>,
  estiloVisual: string
): string {
  return `Converta esta estrutura de aula em um texto otimizado para geração de apresentação.

Título: ${tituloAula}

Slides:
${slides.map((s, i) => `## Slide ${i + 1}: ${s.titulo}\n${s.conteudo}`).join('\n\n')}

Estilo visual desejado: ${estiloVisual}
- Identidade visual futurista e acadêmica
- Títulos com presença forte e tecnológica
- Tipografia principal de títulos inspirada em Orbitron
- Corpo de texto limpo e altamente legível
- Cor principal azul vibrante (#0066FF)
- Detalhes energéticos em laranja (#FF6600) e verde (#66FF33)
- Composição clean com alto contraste
- Elementos visuais modernos, grids elegantes, ícones discretos
- Evitar poluição visual
- Priorizar clareza e refinamento`
}
