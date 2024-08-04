'use server';

import { verify } from '@node-rs/argon2';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { lucia } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function login({ email, password }: { email: string; password: string }) {
  let redirectPath: string | null = null;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!existingUser) {
      throw new Error('Incorrect username or password');
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      throw new Error('Incorrect username or password');
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    redirectPath = `/${existingUser.tenantId}/dashboard`;

    if (!existingUser.firstName && !existingUser.lastName) {
      redirectPath = `/${existingUser.tenantId}/onboarding`;
    }
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
