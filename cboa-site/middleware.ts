import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect /portal routes
  if (!pathname.startsWith('/portal')) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth_token');
  
  if (!token) {
    // Redirect to login page with return URL
    const url = new URL('/', request.url);
    url.searchParams.set('redirect', pathname);
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
  }

  // Note: In production, you would verify the JWT token here
  // For now, we'll trust the client-side auth
  return NextResponse.next();
}

export const config = {
  matcher: '/portal/:path*',
};