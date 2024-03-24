'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Container } from '@prisma/client';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getContainers() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const containers = await prisma.container.findMany({
      where: { tenantId },
      include: { job: true },
    });

    return { containers };
  } catch (error) {
    return { error };
  }
}

export async function getAvailableContainers() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const containers = await prisma.container.findMany({
      where: {
        tenantId,
        job: null,
      },
    });

    return { containers };
  } catch (error) {
    return { error };
  }
}

export async function addContainer(container: Partial<Container>) {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const newContainer = await prisma.container.create({
      data: {
        tenantId,
        rfid: container.rfid!,
        capacity: container.capacity!,
        type: container.type!,
        status: container.status!,
        name: `${container.capacity!} ${container.type!}`,
        availableAt: container.availableAt || undefined,
      },
    });

    return { newContainer };
  } catch (error) {
    return { error };
  }
}

export async function editContainer(container: Partial<Container>) {
  try {
    const modifiedContainer = await prisma.container.update({
      where: { id: container.id },
      data: container,
    });

    return { modifiedContainer };
  } catch (error) {
    return { error };
  }
}

export async function deleteContainer(id: number) {
  try {
    const deletedContainer = await prisma.container.delete({
      where: { id },
    });

    return { deletedContainer };
  } catch (error) {
    return { error };
  }
}
