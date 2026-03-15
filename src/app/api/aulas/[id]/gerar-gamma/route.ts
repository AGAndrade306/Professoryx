import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePptx } from '@/services/pptx'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')!

    const aula = await prisma.aula.findFirst({
      where: { id, userId },
      include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
    })

    if (!aula || aula.slides.length === 0) {
      return NextResponse.json({ error: 'Aula sem slides gerados' }, { status: 400 })
    }

    await prisma.aula.update({ where: { id }, data: { status: 'gerando-apresentacao' } })

    const buffer = await generatePptx(
      aula.tituloAula || aula.tema,
      aula.slides.map(s => ({ titulo: s.titulo, conteudo: s.conteudo })),
    )

    await prisma.aula.update({
      where: { id },
      data: { status: 'apresentacao-pronta' },
    })

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(aula.tituloAula || aula.tema)}.pptx"`,
      },
    })
  } catch (error) {
    console.error('Error generating presentation:', error)

    try {
      const { id } = await params
      await prisma.aula.update({ where: { id }, data: { status: 'erro' } })
    } catch {}

    return NextResponse.json({ error: 'Erro ao gerar apresentação' }, { status: 500 })
  }
}
