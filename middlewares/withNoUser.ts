import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import { MiddlewareFactory } from './stackHandler';

export const withNoUser: MiddlewareFactory =
  (next) => async (req: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = req.nextUrl;

    // Regex to match any pathname that does not start with the specified paths
    const excludePathsRegex =
      /^(?!\/api|\/_next\/static|\/_next\/image|\/favicon.ico|\/sw.js|\/signup|\/login|\/$).*/;

    if (excludePathsRegex.test(pathname)) {
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req, res });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return next(req, _next);
  };
