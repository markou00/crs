'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getAuthUser() {
  const supabase = createServerComponentClient({ cookies });
  try {
    const data = await supabase.auth.getUser();

    return { data };
  } catch (error) {
    return { error };
  }
}

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    return { user };
  } catch (error) {
    return { error };
  }
}
