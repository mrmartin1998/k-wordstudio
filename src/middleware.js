import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    return NextResponse.rewrite(new URL(request.nextUrl.pathname, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/uploads/:path*',
}; 