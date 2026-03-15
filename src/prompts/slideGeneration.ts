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
9. Extraia e incorpore dados concretos, estatísticas, datas, nomes e exemplos reais do material de referência.

⚠️ REGRA OBRIGATÓRIA — FORMATO DO CONTEÚDO DE CADA SLIDE:
TODO slide (exceto o primeiro e o último) DEVE conter OBRIGATORIAMENTE estas 4 seções nesta exata ordem. Um slide que não contenha essas 4 seções será considerado INVÁLIDO:

SEÇÃO 1 — PARÁGRAFO EXPLICATIVO:
2-3 frases em texto corrido contextualizando o conceito. SEM bullet points aqui, apenas texto fluido.

SEÇÃO 2 — PONTOS-CHAVE:
Lista de 3-6 itens usando o marcador "•" no início de cada linha. Sub-itens usam "- " (travessão). Um ponto por linha, objetivo e direto.

SEÇÃO 3 — EXEMPLO PRÁTICO:
Obrigatoriamente começar com a palavra "Exemplo:" seguida de um cenário concreto e realista com dados, nomes ou situações do mundo real.

SEÇÃO 4 — DICA OU DESTAQUE:
Obrigatoriamente começar com "Dica:" ou "Importante:" seguido de uma observação prática e útil.

ESTILO VISUAL DESEJADO: ${data.estiloVisualPadraoMateria || 'tech acadêmico'}

Retorne SOMENTE um JSON válido no seguinte formato (sem markdown, sem comentários):
{
  "tituloAula": "Título da aula",
  "slides": [
    {
      "numero": 1,
      "titulo": "Introdução ao Orçamento Empresarial",
      "conteudo": "Aula sobre Orçamento Empresarial.\\n\\nObjetivos:\\n• Compreender o conceito de orçamento empresarial\\n• Conhecer os tipos de orçamento\\n• Aplicar ferramentas de controle orçamentário",
      "observacoes": "Slide de abertura — apresentar o tema e os objetivos da aula."
    },
    {
      "numero": 2,
      "titulo": "O que é Orçamento Empresarial",
      "conteudo": "O orçamento empresarial é uma ferramenta de planejamento financeiro que projeta receitas, custos e despesas para um período futuro. Ele permite que gestores antecipem cenários, aloquem recursos de forma eficiente e tomem decisões baseadas em dados.\\n\\n• Projeção de receitas e despesas para o próximo período\\n• Definição de metas financeiras mensuráveis\\n• Alocação estratégica de recursos entre departamentos\\n• Monitoramento de desvios entre planejado e realizado\\n• Base para tomada de decisão gerencial\\n\\nExemplo: Uma rede varejista projeta faturamento de R$ 2 milhões para o trimestre, distribui 40% para compras, 25% para folha de pagamento e 15% para marketing — e acompanha mensalmente se os números reais estão dentro do planejado.\\n\\nDica: Orçamentos devem ser revisados periodicamente (mensal ou trimestralmente) para refletir mudanças no cenário econômico e corrigir desvios antes que se tornem problemas graves.",
      "observacoes": "Explicar o conceito com linguagem acessível. Perguntar aos alunos se já tiveram contato com orçamento pessoal."
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
