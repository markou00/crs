import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import { MiddlewareFactory } from './stackHandler';

export const withUser: MiddlewareFactory =
  (next) => async (req: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = req.nextUrl;
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Check if the current request should be excluded
    const excludeRegex = /^(\/api|\/_next\/static|\/_next\/image|\/favicon.ico|\/sw.js|\/$)/;
    if (excludeRegex.test(pathname)) {
      // Path matches one of the exclusions, proceed without redirection
      return next(req, _next);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is authenticated, redirect based on tenantId
    if (user) {
      // Define the base redirect URL using tenantId from user metadata
      const redirectUrlBase = `/${user?.user_metadata?.tenantId}/dashboard`;

      // Check for access to /login or /signup, or a different tenant's resources
      if (
        pathname === '/login' ||
        pathname === '/signup' ||
        !pathname.startsWith(`/${user?.user_metadata?.tenantId}`)
      ) {
        return NextResponse.redirect(new URL(redirectUrlBase, req.url));
      }
    }

    // If none of the conditions match, proceed to the next middlewaree
    return next(req, _next);
  };
