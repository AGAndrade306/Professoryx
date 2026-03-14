import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')!
    const aula = await prisma.aula.findFirst({
      where: { id, userId },
      include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
    })

    if (!aula) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    return NextResponse.json(aula)
  } catch (error) {
    console.error('Error fetching aula:', error)
    return NextResponse.json({ error: 'Erro ao buscar aula' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')!
    const body = await request.json()

    const existing = await prisma.aula.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    const aula = await prisma.aula.update({
      where: { id },
      data: body,
      include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
    })

    return NextResponse.json(aula)
  } catch (error) {
    console.error('Error updating aula:', error)
    return NextResponse.json({ error: 'Erro ao atualizar aula' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')!

    const existing = await prisma.aula.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    await prisma.aula.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting aula:', error)
    return NextResponse.json({ error: 'Erro ao excluir aula' }, { status: 500 })
  }
}
