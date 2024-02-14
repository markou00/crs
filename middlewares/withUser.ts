import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import { MiddlewareFactory } from './stackHandler';

export const withUser: MiddlewareFactory =
  (next) => async (req: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = req.nextUrl;

    if (pathname === '/login' || pathname === '/signup') {
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req, res });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return NextResponse.redirect(new URL('/reknes-as/dashboard', req.url));
      }
    }

    return next(req, _next);
  };
