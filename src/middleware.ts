import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  // Check session via cookie
  const hasSession = request.cookies.getAll().some(
    c => c.name.includes('auth-token') || c.name.includes('sb-') 
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