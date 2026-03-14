import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!

    const aulas = await prisma.aula.findMany({
      where: { userId },
      include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(aulas)
  } catch (error) {
    console.error('Error fetching aulas:', error)
    return NextResponse.json({ error: 'Erro ao buscar aulas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!
    const body = await request.json()
    const { materiaId, tema, quantidadeSlides, linksExtras, materialExtraTexto, observacoesIA, perfilPublico, nivelAula } = body

    if (!materiaId || !tema) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    const aula = await prisma.aula.create({
      data: {
        userId,
        materiaId,
        tema,
        quantidadeSlides: quantidadeSlides || 10,
        linksExtras: linksExtras || null,
        materialExtraTexto: materialExtraTexto || null,
        observacoesIA: observacoesIA || null,
        perfilPublico: perfilPublico || 'graduacao',
        nivelAula: nivelAula || 'intermediaria',
        status: 'rascunho',
      },
      include: { materia: true },
    })

    return NextResponse.json(aula, { status: 201 })
  } catch (error) {
    console.error('Error creating aula:', error)
    return NextResponse.json({ error: 'Erro ao criar aula' }, { status: 500 })
  }
}
