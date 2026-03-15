import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePresentation, waitForGeneration } from '@/services/gamma'
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

    const titulo = aula.tituloAula || aula.tema
    const slides = aula.slides.map(s => ({ titulo: s.titulo, conteudo: s.conteudo }))

    // Tentar Gamma API primeiro, fallback para PPTX local
    const gammaKey = process.env.GAMMA_API_KEY
    const useGamma = gammaKey && gammaKey !== 'your-gamma-api-key-here'

    if (useGamma) {
      // === Gamma API ===
      const generation = await generatePresentation({
        titulo,
        slides,
        estiloVisual: aula.materia.estiloVisualPadrao,
      })

      await prisma.aula.update({
        where: { id },
        data: { gammaGenerationId: generation.generationId },
      })

      // Poll until completed
      const result = await waitForGeneration(generation.generationId)

      const updatedAula = await prisma.aula.update({
        where: { id },
        data: {
          status: 'apresentacao-pronta',
          gammaPreviewUrl: result.gammaUrl || null,
          gammaDownloadUrl: result.exportUrl || null,
        },
        include: { materia: true, slides: { orderBy: { numero: 'asc' } } },
      })

      return NextResponse.json(updatedAula)
    } else {
      // === Fallback: PPTX local ===
      const buffer = await generatePptx(titulo, slides)

      await prisma.aula.update({
        where: { id },
        data: { status: 'apresentacao-pronta' },
      })

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(titulo)}.pptx"`,
          'X-Fallback': 'pptx',
        },
      })
    }
  } catch (error) {
    console.error('Error generating presentation:', error)

    try {
      const { id } = await params
      await prisma.aula.update({ where: { id }, data: { status: 'erro' } })
    } catch {}

    const message = error instanceof Error ? error.message : 'Erro ao gerar apresentação'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
