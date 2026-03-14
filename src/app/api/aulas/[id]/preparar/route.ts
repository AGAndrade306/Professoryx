import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchWeb } from '@/services/webSearch'
import { generateSlides } from '@/services/openai'
import type { ConteudoConsolidado, FontePesquisa } from '@/types'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const aula = await prisma.aula.findUnique({
      where: { id },
      include: { materia: true },
    })

    if (!aula) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    // ETAPA 1 — Coletar contexto
    await prisma.aula.update({ where: { id }, data: { status: 'pesquisando' } })

    // ETAPA 2 — Pesquisa web
    let fontes: FontePesquisa[] = []
    try {
      fontes = await searchWeb(aula.tema)
    } catch (err) {
      console.error('Erro na pesquisa web:', err)
      // Continue with empty sources
    }

    // ETAPA 3 — Extração (handled within searchWeb mock)
    await prisma.aula.update({ where: { id }, data: { status: 'extraindo' } })
    // In production: scrape each URL, extract content, clean text
    await new Promise(r => setTimeout(r, 1000)) // Simulate extraction time

    // ETAPA 4 — Consolidação
    await prisma.aula.update({ where: { id }, data: { status: 'consolidando' } })

    const linksExtras = aula.linksExtras ? aula.linksExtras.split('\n').filter(Boolean) : []

    const consolidado: ConteudoConsolidado = {
      tema: aula.tema,
      fontes,
      linksExtrasUsuario: linksExtras,
      materialExtraUsuario: aula.materialExtraTexto || '',
      ementaMateria: aula.materia.ementa,
      conteudoProgramaticoMateria: aula.materia.conteudoProgramatico,
      estiloVisualPadraoMateria: aula.materia.estiloVisualPadrao,
    }

    await prisma.aula.update({
      where: { id },
      data: {
        status: 'gerando-ia',
        resultadoPesquisa: JSON.stringify(consolidado),
      },
    })

    // ETAPA 5 — Gerar com OpenAI
    const { prompt, response } = await generateSlides(
      consolidado,
      aula.quantidadeSlides,
      aula.perfilPublico,
      aula.nivelAula
    )

    // ETAPA 6 — Persistência
    // Delete existing slides
    await prisma.slide.deleteMany({ where: { aulaId: id } })

    // Create new slides
    await prisma.slide.createMany({
      data: response.slides.map((s) => ({
        aulaId: id,
        numero: s.numero,
        titulo: s.titulo,
        conteudo: s.conteudo,
        observacoes: s.observacoes || null,
      })),
    })

    const updatedAula = await prisma.aula.update({
      where: { id },
      data: {
        status: 'conteudo-gerado',
        tituloAula: response.tituloAula,
        promptFinalEnviado: prompt,
        respostaOpenAI: JSON.stringify(response),
      },
      include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
    })

    return NextResponse.json(updatedAula)
  } catch (error) {
    console.error('Error preparing aula:', error)

    try {
      const { id } = await params
      await prisma.aula.update({ where: { id }, data: { status: 'erro' } })
    } catch {}

    return NextResponse.json({ error: 'Erro ao preparar aula' }, { status: 500 })
  }
}
