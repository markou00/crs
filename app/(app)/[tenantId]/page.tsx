import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export default async function Page({ params }: { params: { tenantId: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const user = await prisma.user.findFirst({ where: { email: authUser?.email } });

  if (params.tenantId === user?.tenantId) {
    redirect(`/${params.tenantId}/dashboard`);
  } else {
    return <h1>PAGE NOT FOUND</h1>;
  }
}
