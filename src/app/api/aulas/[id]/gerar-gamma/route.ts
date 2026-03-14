import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePresentation, checkGenerationStatus } from '@/services/gamma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const aula = await prisma.aula.findUnique({
      where: { id },
      include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
    })

    if (!aula || aula.slides.length === 0) {
      return NextResponse.json({ error: 'Aula sem slides gerados' }, { status: 400 })
    }

    await prisma.aula.update({ where: { id }, data: { status: 'gerando-apresentacao' } })

    // Generate presentation
    const result = await generatePresentation({
      titulo: aula.tituloAula || aula.tema,
      slides: aula.slides.map(s => ({ titulo: s.titulo, conteudo: s.conteudo })),
      estiloVisual: aula.materia.estiloVisualPadrao,
    })

    await prisma.aula.update({
      where: { id },
      data: { gammaGenerationId: result.generationId },
    })

    // Poll for completion (in production, use webhooks or SSE)
    const status = await checkGenerationStatus(result.generationId)

    const updatedAula = await prisma.aula.update({
      where: { id },
      data: {
        status: status.status === 'completed' ? 'apresentacao-pronta' : 'erro',
        gammaPreviewUrl: status.previewUrl || null,
        gammaDownloadUrl: status.downloadUrl || null,
      },
      include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
    })

    return NextResponse.json(updatedAula)
  } catch (error) {
    console.error('Error generating gamma presentation:', error)
    return NextResponse.json({ error: 'Erro ao gerar apresentação' }, { status: 500 })
  }
}
