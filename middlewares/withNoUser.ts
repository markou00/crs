import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import { MiddlewareFactory } from './stackHandler';

export const withNoUser: MiddlewareFactory =
  (next) => async (req: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = req.nextUrl;

    const excludePathsRegex =
      /^(?!\/api|\/_next\/static|\/_next\/image|\/favicon.ico|\/sw.js|\/signup|\/login|\/$).*/;

    if (excludePathsRegex.test(pathname)) {
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req, res });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        const loginUrl = new URL('/login', req.url);
        res.cookies.delete('sb-access-token');
        return NextResponse.redirect(loginUrl);
      }
    }

    return next(req, _next);
  };
