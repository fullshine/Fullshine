import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'

  // En Edge Runtime no podemos llamar a Supabase directamente.
  // Verificamos que exista la cookie de sesión con valor no vacío.
  // La verificación real de token ocurre en requireAuth() dentro de cada server action.
  const sessionCookie = request.cookies.getAll().find(c =>
    c.name.startsWith('sb-') && c.name.includes('auth-token')
  )
  const hasSession = !!sessionCookie?.value

  if (!isLoginPage && !hasSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && hasSession) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
