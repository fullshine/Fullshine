import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'

  // Verificar si hay cookie de sesión de Supabase
  const hasSession = request.cookies.getAll().some(c =>
    c.name.startsWith('sb-') && c.name.includes('auth-token')
  )

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