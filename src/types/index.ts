export interface Usuario {
  id: string
  nome: string
  email: string
  createdAt: string
}

export interface Materia {
  id: string
  userId: string
  nome: string
  ementa: string
  conteudoProgramatico: string
  estiloVisualPadrao: string
  estiloVisualCustom?: string | null
  createdAt: string
  updatedAt: string
}

export interface Aula {
  id: string
  userId: string
  materiaId: string
  tema: string
  quantidadeSlides: number
  linksExtras?: string | null
  materialExtraTexto?: string | null
  observacoesIA?: string | null
  perfilPublico: string
  nivelAula: string
  status: string
  resultadoPesquisa?: string | null
  promptFinalEnviado?: string | null
  respostaOpenAI?: string | null
  tituloAula?: string | null
  gammaGenerationId?: string | null
  gammaPreviewUrl?: string | null
  gammaDownloadUrl?: string | null
  createdAt: string
  updatedAt: string
  materia?: Materia
  slides?: Slide[]
}

export interface Slide {
  id: string
  aulaId: string
  numero: number
  titulo: string
  conteudo: string
  observacoes?: string | null
  editadoManual: boolean
  createdAt: string
  updatedAt: string
}

export interface FontePesquisa {
  titulo: string
  url: string
  conteudo: string
}

export interface ConteudoConsolidado {
  tema: string
  fontes: FontePesquisa[]
  linksExtrasUsuario: string[]
  materialExtraUsuario: string
  ementaMateria: string
  conteudoProgramaticoMateria: string
  estiloVisualPadraoMateria: string
}

export interface SlideGerado {
  numero: number
  titulo: string
  conteudo: string
  observacoes: string
}

export interface RespostaOpenAI {
  tituloAula: string
  slides: SlideGerado[]
}

export type StatusAula =
  | 'rascunho'
  | 'pesquisando'
  | 'extraindo'
  | 'consolidando'
  | 'gerando-ia'
  | 'conteudo-gerado'
  | 'gerando-apresentacao'
  | 'apresentacao-pronta'
  | 'erro'

export type PerfilPublico = 'ensino-medio' | 'graduacao' | 'pos-graduacao' | 'curso-tecnico'

export type NivelAula = 'introdutoria' | 'intermediaria' | 'avancada'

export type EstiloVisual =
  | 'tech-academico'
  | 'minimalista-futurista'
  | 'sofisticado-institucional'
  | 'visual-dinamico'
  | 'clean-legibilidade'
  | 'custom'

export const ESTILOS_VISUAIS: Record<EstiloVisual, string> = {
  'tech-academico': 'Tech Acadêmico',
  'minimalista-futurista': 'Minimalista Futurista',
  'sofisticado-institucional': 'Sofisticado Institucional',
  'visual-dinamico': 'Visual Dinâmico com Destaques',
  'clean-legibilidade': 'Clean com Foco em Legibilidade',
  'custom': 'Personalizado',
}

export const PERFIS_PUBLICO: Record<PerfilPublico, string> = {
  'ensino-medio': 'Ensino Médio',
  'graduacao': 'Graduação',
  'pos-graduacao': 'Pós-Graduação',
  'curso-tecnico': 'Curso Técnico',
}

export const NIVEIS_AULA: Record<NivelAula, string> = {
  'introdutoria': 'Aula Introdutória',
  'intermediaria': 'Aula Intermediária',
  'avancada': 'Aula Avançada',
}

export const STATUS_LABELS: Record<StatusAula, string> = {
  'rascunho': 'Rascunho',
  'pesquisando': 'Pesquisando referências...',
  'extraindo': 'Extraindo conteúdo...',
  'consolidando': 'Consolidando material...',
  'gerando-ia': 'Gerando estrutura com IA...',
  'conteudo-gerado': 'Conteúdo gerado',
  'gerando-apresentacao': 'Gerando apresentação...',
  'apresentacao-pronta': 'Apresentação pronta',
  'erro': 'Erro na geração',
}

export const ETAPAS_GERACAO = [
  { key: 'pesquisando', label: 'Pesquisando referências na web' },
  { key: 'extraindo', label: 'Extraindo conteúdo das fontes' },
  { key: 'consolidando', label: 'Consolidando material' },
  { key: 'gerando-ia', label: 'Gerando estrutura da aula com IA' },
  { key: 'conteudo-gerado', label: 'Conteúdo gerado com sucesso' },
]
