import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { regenerateSlide } from '@/services/openai'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { slideId } = body

    const slide = await prisma.slide.findFirst({
      where: { id: slideId, aulaId: id },
      include: { aula: { include: { materia: true } } },
    })

    if (!slide) {
      return NextResponse.json({ error: 'Slide não encontrado' }, { status: 404 })
    }

    const result = await regenerateSlide(
      { titulo: slide.titulo, conteudo: slide.conteudo },
      { tema: slide.aula.tema, materia: slide.aula.materia.nome }
    )

    const updatedSlide = await prisma.slide.update({
      where: { id: slideId },
      data: {
        titulo: result.titulo,
        conteudo: result.conteudo,
        observacoes: result.observacoes,
        editadoManual: false,
      },
    })

    return NextResponse.json(updatedSlide)
  } catch (error) {
    console.error('Error regenerating slide:', error)
    return NextResponse.json({ error: 'Erro ao regenerar slide' }, { status: 500 })
  }
}
