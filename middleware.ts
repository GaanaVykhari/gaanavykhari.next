import { NextResponse } from 'next/server';

export function middleware(request: any) {
  const { pathname } = request.nextUrl;
  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/user/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/health');
  const hasToken = Boolean(request.cookies.get('token')?.value);
  const hasNextAuthSession = Boolean(
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
      request.cookies.get('next-auth.session-token')?.value
  );
  if (!isPublic && !hasToken && !hasNextAuthSession) {
    const url = request.nextUrl.clone();
    url.searchParams.set('redirect', pathname);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (isPublic && hasToken && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
