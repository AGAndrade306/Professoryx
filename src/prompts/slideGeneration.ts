import type { ConteudoConsolidado } from '@/types'

export function buildSlideGenerationPrompt(data: ConteudoConsolidado, quantidadeSlides: number, perfilPublico: string, nivelAula: string): string {
  const fontesTexto = data.fontes
    .map((f, i) => `--- Fonte ${i + 1}: ${f.titulo} (${f.url}) ---\n${f.conteudo.slice(0, 5000)}`)
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
4. O último slide deve conter uma síntese, conclusão, atividade prática ou perguntas para reflexão.
5. Adapte a linguagem ao perfil do público-alvo.
6. Mantenha coerência e progressão entre os slides.
7. Use terminologia correta quando a matéria for técnica.
8. NÃO invente informações — baseie-se no material fornecido, mas elabore e explique os conceitos com profundidade.
ESTRUTURA DE CADA SLIDE:
Cada slide deve seguir esta estrutura (nesta ordem):

a) PARÁGRAFO INTRODUTÓRIO: 1-2 frases em texto corrido que contextualizem o conceito do slide de forma clara e direta.

b) PONTOS-CHAVE: Liste os pontos principais em tópicos com marcadores (•). Seja objetivo — cada tópico deve ter 1 linha, no máximo 2. Use sub-itens com travessão (-) apenas quando realmente necessário.

c) EXEMPLO PRÁTICO: Inclua um exemplo concreto introduzido por "Exemplo:" — use situações reais, dados ou cenários profissionais.

d) DICA OU DESTAQUE (quando aplicável): Uma "Dica:" ou "Importante:" curta e prática.

IMPORTANTE: Extraia e incorpore dados concretos, estatísticas, datas, nomes, exemplos reais e citações do material de referência coletado acima. Não generalize — use as informações específicas das fontes.

EXEMPLO DE SLIDE BEM ESTRUTURADO:
---
Título: "Risco de Crédito"
Conteúdo:
"O risco de crédito ocorre quando um cliente ou devedor não paga suas obrigações financeiras. Este é um dos riscos mais comuns em empresas que trabalham com vendas a prazo, financiamento ou parcelamentos, e pode impactar diretamente o fluxo de caixa da organização.

Esse risco é comum em empresas que:
• Vendem a prazo
• Oferecem financiamento próprio
• Trabalham com parcelamentos longos
• Possuem alta concentração de receita em poucos clientes

Exemplo: Uma empresa que vende produtos em 30 ou 60 dias pode enfrentar perdas significativas se o cliente não pagar. Em 2023, a taxa de inadimplência de empresas no Brasil atingiu 6,5 milhões de CNPJs, segundo a Serasa.

Dica: Por isso muitas empresas utilizam análise de crédito antes de conceder prazos de pagamento — ferramentas como Serasa, SPC e scoring bancário ajudam a reduzir esse risco."
---

ESTILO VISUAL DESEJADO: ${data.estiloVisualPadraoMateria || 'tech acadêmico'}

Retorne SOMENTE um JSON válido no seguinte formato (sem markdown, sem comentários):
{
  "tituloAula": "Título da aula",
  "slides": [
    {
      "numero": 1,
      "titulo": "Título do slide",
      "conteudo": "Conteúdo do slide seguindo a estrutura obrigatória: parágrafo explicativo + pontos-chave + exemplo prático + dica",
      "observacoes": "Observações para o professor (ex: mencionar exemplo X, fazer pergunta Y, propor atividade Z)"
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
