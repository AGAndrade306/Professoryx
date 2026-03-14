import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')!
    const materia = await prisma.materia.findFirst({
      where: { id, userId },
    })

    if (!materia) {
      return NextResponse.json({ error: 'Matéria não encontrada' }, { status: 404 })
    }

    return NextResponse.json(materia)
  } catch (error) {
    console.error('Error fetching materia:', error)
    return NextResponse.json({ error: 'Erro ao buscar matéria' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')!
    const body = await request.json()
    const { nome, ementa, conteudoProgramatico, estiloVisualPadrao, estiloVisualCustom } = body

    // Verify ownership
    const existing = await prisma.materia.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Matéria não encontrada' }, { status: 404 })
    }

    const materia = await prisma.materia.update({
      where: { id },
      data: { nome, ementa, conteudoProgramatico, estiloVisualPadrao, estiloVisualCustom },
    })

    return NextResponse.json(materia)
  } catch (error) {
    console.error('Error updating materia:', error)
    return NextResponse.json({ error: 'Erro ao atualizar matéria' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')!

    const existing = await prisma.materia.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Matéria não encontrada' }, { status: 404 })
    }

    await prisma.materia.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting materia:', error)
    return NextResponse.json({ error: 'Erro ao excluir matéria' }, { status: 500 })
  }
}
