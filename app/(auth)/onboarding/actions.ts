'use server';

import { redirect } from 'next/navigation';

import { getHash } from '@/lib/auth';
import { validateRequest } from '@/lib/server/actions/user-actions';
import prisma from '@/lib/prisma';

export async function confirmInvitation(firstName: string, lastName: string, newPassword: string) {
  let redirectPath: string | null = null;
  try {
    const { user: authUser } = await validateRequest();

    if (!authUser) {
      throw new Error('Unauthorized');
    }

    const passwordHash = await getHash(newPassword);
    const user = await prisma.user.update({
      where: { email: authUser.email },
      data: {
        firstName,
        lastName,
        passwordHash,
      },
    });

    redirectPath = `/${user.tenantId}/dashboard`;
    return { error: false, errorMessage: '' };
  } catch (error) {
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { error: true, errorMessage };
  } finally {
    if (redirectPath) {
      redirect(redirectPath);
    }
  }
}
