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

  // Authentication checks via cookies have been removed.
  // Client-side wrappers/components or Zustand hydration now fully control access.
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
