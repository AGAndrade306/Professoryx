import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken, getTokenCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
    }

    const user = await prisma.usuario.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    const valid = await verifyPassword(senha, user.senha)
    if (!valid) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    const token = await createToken({ id: user.id, nome: user.nome, email: user.email })

    const response = NextResponse.json({
      user: { id: user.id, nome: user.nome, email: user.email },
    })

    response.cookies.set(getTokenCookieOptions(token))

    return response
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 })
  }
}
