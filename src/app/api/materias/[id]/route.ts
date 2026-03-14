import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MOCK_USER } from '@/lib/mock-user'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const materia = await prisma.materia.findFirst({
      where: { id, userId: MOCK_USER.id },
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
    const body = await request.json()
    const { nome, ementa, conteudoProgramatico, estiloVisualPadrao, estiloVisualCustom } = body

    const materia = await prisma.materia.update({
      where: { id },
      data: {
        nome,
        ementa,
        conteudoProgramatico,
        estiloVisualPadrao,
        estiloVisualCustom,
      },
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
    await prisma.materia.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting materia:', error)
    return NextResponse.json({ error: 'Erro ao excluir matéria' }, { status: 500 })
  }
}
