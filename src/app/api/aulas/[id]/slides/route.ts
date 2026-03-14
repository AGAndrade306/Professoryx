import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { slideId, titulo, conteudo, observacoes } = body

    if (!slideId) {
      return NextResponse.json({ error: 'slideId é obrigatório' }, { status: 400 })
    }

    const slide = await prisma.slide.update({
      where: { id: slideId },
      data: {
        titulo,
        conteudo,
        observacoes,
        editadoManual: true,
      },
    })

    return NextResponse.json(slide)
  } catch (error) {
    console.error('Error updating slide:', error)
    return NextResponse.json({ error: 'Erro ao atualizar slide' }, { status: 500 })
  }
}
