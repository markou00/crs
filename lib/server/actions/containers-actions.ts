'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getContainers() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const containers = await prisma.container.findMany({
      where: { tenantId },
    });

    return { containers };
  } catch (error) {
    return { error };
  }
}
