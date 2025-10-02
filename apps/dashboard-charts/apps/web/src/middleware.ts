// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Temporary bypass: let everyone in
  return NextResponse.next();

  /*
  // Original logic (probably looks like this):
  const isLoggedIn = checkAuthCookieOrSession(req);
  if (!isLoggedIn && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(
      new URL(`/login?next=${req.nextUrl.pathname}`, req.url)
    );
  }
  return NextResponse.next();
  */
}
