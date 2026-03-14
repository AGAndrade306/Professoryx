import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MOCK_USER } from '@/lib/mock-user'

export async function GET() {
  try {
    // Ensure mock user exists
    await prisma.usuario.upsert({
      where: { id: MOCK_USER.id },
      update: {},
      create: { id: MOCK_USER.id, nome: MOCK_USER.nome, email: MOCK_USER.email, senha: 'mock' },
    })

    const materias = await prisma.materia.findMany({
      where: { userId: MOCK_USER.id },
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
    const body = await request.json()
    const { nome, ementa, conteudoProgramatico, estiloVisualPadrao, estiloVisualCustom } = body

    if (!nome || !ementa || !conteudoProgramatico) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Ensure mock user exists
    await prisma.usuario.upsert({
      where: { id: MOCK_USER.id },
      update: {},
      create: { id: MOCK_USER.id, nome: MOCK_USER.nome, email: MOCK_USER.email, senha: 'mock' },
    })

    const materia = await prisma.materia.create({
      data: {
        userId: MOCK_USER.id,
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
