import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!

    const materias = await prisma.materia.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(materias)
  } catch (error) {
    console.error('Error fetching materias:', error)
    return NextResponse.json({ error: 'Erro ao buscar matérias' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!
    const body = await request.json()
    const { nome, ementa, conteudoProgramatico, estiloVisualPadrao, estiloVisualCustom } = body

    if (!nome || !ementa || !conteudoProgramatico) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    const materia = await prisma.materia.create({
      data: {
        userId,
        nome,
        ementa,
        conteudoProgramatico,
        estiloVisualPadrao: estiloVisualPadrao || 'tech-academico',
        estiloVisualCustom: estiloVisualCustom || null,
      },
    })

    return NextResponse.json(materia, { status: 201 })
  } catch (error) {
    console.error('Error creating materia:', error)
    return NextResponse.json({ error: 'Erro ao criar matéria' }, { status: 500 })
  }
}
