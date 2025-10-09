import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './src/lib/auth'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/checkout',
  '/bookings',
  '/profile',
  '/dashboard',
  '/admin',
  '/host',
]

// Routes that require specific roles
const ADMIN_ROUTES = ['/admin']
const HOST_ROUTES = ['/host']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers
  const response = NextResponse.next()
  
  // Set security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  // Check if the current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const session = await auth()
    
    // Redirect to signin if not authenticated
    if (!session?.user) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check admin routes
    const isAdminRoute = ADMIN_ROUTES.some(route => 
      pathname.startsWith(route)
    )
    if (isAdminRoute && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check host routes
    const isHostRoute = HOST_ROUTES.some(route => 
      pathname.startsWith(route)
    )
    if (isHostRoute && !['host', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}