'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

const nodemailer = require('nodemailer');

export async function getAuthUser() {
  try {
    const supabase = createServerActionClient({ cookies });

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

export async function inviteUser(email: string) {
  try {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET!
    );
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PW,
      },
    });

    const password = Math.random().toString(36);
    const user = await adminSupabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        tenantId,
      },
      email_confirm: true,
    });

    await prisma.user.update({
      where: { id: user.data.user?.id! },
      data: {
        tenantId,
      },
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

export async function confirmInvitation(
  email: string,
  firstName: string,
  lastName: string,
  newPassword: string
) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        firstName,
        lastName,
      },
    });

    const supabase = createServerActionClient({ cookies });
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error("Couldn't change user's password!");

    return { user };
  } catch (error) {
    return { error };
  }
}

export async function getAllUsers() {
  try {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET!
    );
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const {
      data: { users },
      error,
    } = await adminSupabase.auth.admin.listUsers();

    if (error) throw new Error("Couldn't get users!");

    const tenantUsers = users.filter((user) => user.user_metadata.tenantId === tenantId);

    return { tenantUsers };
  } catch (error) {
    return { error };
  }
}

export async function deleteUser(id: string) {
  try {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET!
    );

    const { data, error } = await adminSupabase.auth.admin.deleteUser(id);

    if (error) throw new Error("Couldn't delete user!");

    return { data };
  } catch (error) {
    return { error };
  }
}
