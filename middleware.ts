import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    pathname === '/akshat' ||
    pathname.startsWith('/akshat/') ||
    pathname === '/locked' ||
    pathname.startsWith('/api/lock') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Leave the public site untouched until the required server-side credentials are configured.
  if (!url || !key) return NextResponse.next();

  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/site_lock?id=eq.1&select=locked`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    if (!response.ok) return NextResponse.next();
    const rows = await response.json() as Array<{ locked: boolean }>;
    if (rows[0]?.locked) return NextResponse.redirect(new URL('/locked', request.url));
  } catch {
    // A temporary database issue must not accidentally lock visitors out.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
