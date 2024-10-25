import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (!req.cookies.has('supabase-auth-token') && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (req.cookies.has('supabase-auth-token') && (req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
