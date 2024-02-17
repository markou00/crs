'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getAuthUser() {
  const supabase = createServerComponentClient({ cookies });
  try {
    const data = await supabase.auth.getUser();
    return { data };
  } catch (error) {
    return { error };
  }
}
