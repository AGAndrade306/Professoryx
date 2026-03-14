import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken, getTokenCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json()

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
    }

    if (senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(senha)

    const user = await prisma.usuario.create({
      data: { nome, email, senha: hashedPassword },
    })

    const token = await createToken({ id: user.id, nome: user.nome, email: user.email })

    const response = NextResponse.json({
      user: { id: user.id, nome: user.nome, email: user.email },
    }, { status: 201 })

    response.cookies.set(getTokenCookieOptions(token))

    return response
  } catch (error) {
    console.error('Error registering:', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
