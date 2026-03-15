import PptxGenJS from 'pptxgenjs'

interface SlideData {
  titulo: string
  conteudo: string
}

export async function generatePptx(
  tituloAula: string,
  slides: SlideData[],
): Promise<Buffer> {
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'Professoryx'
  pptx.title = tituloAula

  // Define colors
  const PRIMARY = '0066FF'
  const DARK_BG = '0A0E1A'
  const LIGHT_TEXT = 'E8E8E8'
  const MUTED_TEXT = '9CA3AF'

  // --- Title slide ---
  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: DARK_BG }

  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.06,
    fill: { color: PRIMARY },
  })

  titleSlide.addText(tituloAula, {
    x: 0.8, y: 1.5, w: 11.5, h: 2,
    fontSize: 36,
    fontFace: 'Calibri',
    color: LIGHT_TEXT,
    bold: true,
    align: 'left',
    valign: 'middle',
  })

  titleSlide.addText('Aula preparada com Professoryx', {
    x: 0.8, y: 3.8, w: 11.5, h: 0.5,
    fontSize: 14,
    fontFace: 'Calibri',
    color: MUTED_TEXT,
    align: 'left',
  })

  // --- Content slides ---
  for (const slide of slides) {
    const s = pptx.addSlide()
    s.background = { color: DARK_BG }

    // Top accent bar
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: PRIMARY },
    })

    // Slide title
    s.addText(slide.titulo, {
      x: 0.6, y: 0.3, w: 12, h: 0.7,
      fontSize: 24,
      fontFace: 'Calibri',
      color: PRIMARY,
      bold: true,
      align: 'left',
      valign: 'middle',
    })

    // Divider line
    s.addShape(pptx.ShapeType.rect, {
      x: 0.6, y: 1.05, w: 2, h: 0.03,
      fill: { color: PRIMARY },
    })

    // Content — parse into formatted text runs
    const textRuns = parseContent(slide.conteudo, LIGHT_TEXT, MUTED_TEXT, PRIMARY)

    s.addText(textRuns, {
      x: 0.6, y: 1.3, w: 12, h: 5.7,
      fontSize: 13,
      fontFace: 'Calibri',
      color: LIGHT_TEXT,
      align: 'left',
      valign: 'top',
      lineSpacingMultiple: 1.3,
      wrap: true,
    })
  }

  // Generate as buffer
  const output = await pptx.write({ outputType: 'nodebuffer' })
  return output as Buffer
}

function parseContent(
  content: string,
  textColor: string,
  mutedColor: string,
  accentColor: string,
): PptxGenJS.TextProps[] {
  const lines = content.split('\n')
  const runs: PptxGenJS.TextProps[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      runs.push({ text: '\n', options: { fontSize: 8 } })
      continue
    }

    if (trimmed.startsWith('Exemplo:')) {
      runs.push({
        text: 'Exemplo: ',
        options: { color: accentColor, bold: true, fontSize: 13 },
      })
      runs.push({
        text: trimmed.slice(9).trim() + '\n',
        options: { color: textColor, italic: true, fontSize: 13 },
      })
    } else if (trimmed.startsWith('Dica:') || trimmed.startsWith('Importante:')) {
      const colonIdx = trimmed.indexOf(':')
      runs.push({
        text: trimmed.slice(0, colonIdx + 1) + ' ',
        options: { color: 'FF6600', bold: true, fontSize: 13 },
      })
      runs.push({
        text: trimmed.slice(colonIdx + 1).trim() + '\n',
        options: { color: textColor, fontSize: 13 },
      })
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const bullet = trimmed.startsWith('•') ? '  •  ' : '      -  '
      runs.push({
        text: bullet + trimmed.slice(1).trim() + '\n',
        options: { color: textColor, fontSize: 13 },
      })
    } else {
      runs.push({
        text: trimmed + '\n',
        options: { color: textColor, fontSize: 13 },
      })
    }
  }

  return runs
}
