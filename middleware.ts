import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId');
  
  // If trying to access protected routes without auth
  if (!userId && request.nextUrl.pathname.startsWith('/buyers')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If authenticated and trying to access login
  if (userId && request.nextUrl.pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/buyers', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/buyers/:path*', '/auth/login'],
};