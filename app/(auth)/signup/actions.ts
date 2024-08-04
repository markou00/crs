'use server';

import { hash } from '@node-rs/argon2';
import { cookies } from 'next/headers';
import { generateIdFromEntropySize } from 'lucia';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { lucia } from '@/lib/auth';

// eslint-disable-next-line consistent-return
export async function signup({
  firstName,
  lastName,
  organisationName,
  organisationId,
  email,
  password,
}: {
  firstName: string;
  lastName: string;
  organisationName: string;
  organisationId: string;
  email: string;
  password: string;
}) {
  let redirectPath: string | null = null;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }
    // console.log('No existing user');

    const existingOrganisation = await prisma.tenant.findUnique({
      where: { id: organisationId },
    });
    if (existingOrganisation) {
      throw new Error('Organisation does exist');
    }
    // console.log('No existing organisation');

    const passwordHash = await hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    const userId = generateIdFromEntropySize(10); // 16 characters long
    // console.log('Generated user id');

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { id: organisationId, name: organisationName },
      });
      // console.log('Created organisation');

      await tx.user.create({
        data: { id: userId, firstName, lastName, email, passwordHash, tenantId: tenant.id },
      });
      // console.log('Created user');
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    // console.log('Created session');

    redirectPath = `/${organisationId}/dashboard`;
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
