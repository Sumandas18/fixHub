import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rolePaths = {
  admin: '/admin/dashboard',
  provider: '/provider/dashboard',
  user: '/dashboard'
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Unauthenticated users trying to access protected routes
  const isProtectedRoute = 
    (pathname.startsWith('/admin') && !pathname.includes('/login') && !pathname.includes('/register')) ||
    (pathname.startsWith('/provider') && !pathname.includes('/login') && !pathname.includes('/register')) ||
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') ||
    pathname.startsWith('/bookings');

  if (isProtectedRoute && !token) {
    // Redirect unauthenticated requests to the appropriate login page
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/provider')) {
      return NextResponse.redirect(new URL('/provider/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated users trying to access auth/login pages
  const isAuthPage = 
    pathname === '/login' || pathname === '/register' || 
    pathname === '/admin/login' || pathname === '/admin/register' ||
    pathname === '/provider/login' || pathname === '/provider/register';

  if (isAuthPage && token && role) {
    // Redirect to their respective dashboard using the mapping
    const dashboardUrl = rolePaths[role as keyof typeof rolePaths] || '/';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // 3. Cross-role access prevention
  if (token && role) {
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(rolePaths[role as keyof typeof rolePaths] || '/', request.url));
    }
    if (pathname.startsWith('/provider') && role !== 'provider') {
      return NextResponse.redirect(new URL(rolePaths[role as keyof typeof rolePaths] || '/', request.url));
    }
    
    // List of routes only 'user' role should access
    const userOnlyRoutes = ['/dashboard', '/profile', '/bookings'];
    const isUserOnlyRoute = userOnlyRoutes.some(route => pathname.startsWith(route) && !pathname.startsWith('/admin/bookings') && !pathname.startsWith('/provider/bookings'));

    if (isUserOnlyRoute && role !== 'user') {
      return NextResponse.redirect(new URL(rolePaths[role as keyof typeof rolePaths] || '/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
