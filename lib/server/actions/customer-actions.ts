'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getCustomers() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const customers = await prisma.customer.findMany({
      where: { tenantId },
    });

    return { customers };
  } catch (error) {
    return { error };
  }
}
