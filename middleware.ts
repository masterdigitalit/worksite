import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const userData = request.cookies.get('user_data')?.value;
  
  const { pathname } = request.nextUrl;

  // Защищенные роуты
  const protectedRoutes = ['/admin', '/advertising', '/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Проверка ролей для специфичных роутов
  if (pathname.startsWith('/admin') && userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/advertising') && userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role !== 'MANAGER') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/advertising/:path*', '/dashboard/:path*'],
};