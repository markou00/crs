'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { generateIdFromEntropySize, Session, User } from 'lucia';
import { redirect } from 'next/navigation';

import { getHash, lucia } from '@/lib/auth';

import prisma from '@/lib/prisma';

const nodemailer = require('nodemailer');

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
    } catch {
      // ignore
    }
    return result;
  }
);

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    return { user };
  } catch (error) {
    return { error };
  }
}

export async function inviteUser(email: string) {
  try {
    const { user: authUser } = await validateRequest();
    const tenantId = authUser?.tenantId;

    if (!tenantId) {
      throw new Error('No tenant found');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PW,
      },
    });

    const id = generateIdFromEntropySize(10);
    const password = Math.random().toString(36);
    const passwordHash = await getHash(password);

    const user = await prisma.user.create({
      data: { id, email, passwordHash, tenantId },
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Inviatation',
      text: `Du ble invitert til CRS:\n Epost: ${email}\n Passord: ${password}`,
    };

    transporter.sendMail(mailOptions, (error: Error) => {
      if (error) {
        throw new Error(error.message);
      }
    });

    return { user };
  } catch (error) {
    return { error };
  }
}

export async function getAllUsers() {
  try {
    const { user: authUser } = await validateRequest();
    const tenantId = authUser?.tenantId;

    if (!tenantId) {
      throw new Error('No tenant found');
    }

    const tenantUsers = await prisma.user.findMany({
      where: { tenantId },
    });

    return { tenantUsers };
  } catch (error) {
    return { error };
  }
}

export async function deleteUser(id: string) {
  try {
    const data = await prisma.user.delete({
      where: { id },
    });

    return { data };
  } catch (error) {
    return { error };
  }
}

export async function logout() {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect('/login');
}
