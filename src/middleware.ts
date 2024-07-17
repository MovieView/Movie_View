import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    if (req.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse('Authentication Error', { status: 401 });
    }

    const { pathname, search, origin, basePath } = req.nextUrl;
    const signInUrl = new URL(`${basePath}/login`, origin);
    signInUrl.searchParams.append(
      'callbackUrl',
      `${basePath}${pathname}${search}`
    );
    return NextResponse.redirect(signInUrl);
  }
  if (req.method === 'PUT' && req.nextUrl.pathname.startsWith('/api/my-page')) {
    req.headers.delete('Content-Type');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/detail/:path*',
    '/api/review/:path*',
    '/api/like/:path*',
    '/api/movies/:id(\\d+)/review',
    '/api/my-page',
    '/api/users/:path*',
    '/api/movies/:id(\\d+)/:path*',
    '/api/notifications/:path*',
    '/recentReview',
    '/my-page',
    '/api/reviews/:id((?!.*recent)\\w)/:path*',
  ],
};
