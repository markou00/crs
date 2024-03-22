'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getJobs() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const jobs = await prisma.job.findMany({
      where: { tenantId },
      include: {
        car: true,
        agreement: {
          include: {
            customer: true,
          },
        },
      },
    });

    return { jobs };
  } catch (error) {
    return { error };
  }
}
