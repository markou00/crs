'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getCars() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const cars = await prisma.car.findMany({
      where: { tenantId },
      include: {
        Employee: true,
      },
    });

    return { cars };
  } catch (error) {
    return { error };
  }
}
