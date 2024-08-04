'use server';

import { Container } from '@prisma/client';

import prisma from '@/lib/prisma';
import { validateRequest } from './user-actions';

export async function getContainers() {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const containers = await prisma.container.findMany({
      where: { tenantId },
      include: { job: true },
    });

    return { containers };
  } catch (error) {
    return { error };
  }
}

export async function addContainer(container: Partial<Container>) {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

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
