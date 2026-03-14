import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlides } from '@/services/openai'
import type { ConteudoConsolidado } from '@/types'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const aula = await prisma.aula.findUnique({
      where: { id },
      include: { materia: true },
    })

    if (!aula || !aula.resultadoPesquisa) {
      return NextResponse.json({ error: 'Aula não encontrada ou sem dados de pesquisa' }, { status: 404 })
    }

    await prisma.aula.update({ where: { id }, data: { status: 'gerando-ia' } })

    const consolidado: ConteudoConsolidado = JSON.parse(aula.resultadoPesquisa)
    const { prompt, response } = await generateSlides(
      consolidado,
      aula.quantidadeSlides,
      aula.perfilPublico,
      aula.nivelAula
    )

    await prisma.slide.deleteMany({ where: { aulaId: id } })
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
    console.error('Error regenerating:', error)
    return NextResponse.json({ error: 'Erro ao regenerar slides' }, { status: 500 })
  }
}
