import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'professoryx-secret-key-change-in-production'
)

const publicPaths = ['/login', '/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static assets
  if (publicPaths.some((p) => pathname.startsWith(p)) || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('professoryx-token')?.value

  if (!token) {
    // API routes return 401, pages redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Add user ID to request headers so API routes can read it
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.id as string)
    response.headers.set('x-user-nome', payload.nome as string)
    response.headers.set('x-user-email', payload.email as string)
    return response
  } catch {
    // Invalid token — clear cookie and redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('professoryx-token', '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
