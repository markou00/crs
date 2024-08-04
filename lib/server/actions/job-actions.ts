'use server';

import { Job } from '@prisma/client';

import prisma from '@/lib/prisma';
import { validateRequest } from './user-actions';

export async function getJobs() {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const jobs = await prisma.job.findMany({
      where: { tenantId },
      include: {
        car: true,
        container: true,
        agreement: {
          include: {
            customer: true,
          },
        },
      },
    });

    return { jobs };
  } catch (error) {
    return { error };
  }
}

export async function getJob(id: number) {
  try {
    const uniqueJob = await prisma.job.findUnique({
      where: { id },
      include: {
        car: true,
        agreement: {
          include: {
            customer: true,
          },
        },
      },
    });

    return { uniqueJob };
  } catch (error) {
    return { error };
  }
}

export async function editJob(job: Partial<Job>) {
  try {
    const modifiedJob = await prisma.job.update({
      where: { id: job.id },
      data: job,
    });

    return { modifiedJob };
  } catch (error) {
    return { error };
  }
}

export async function addJob(job: Partial<Job>) {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const newJob = await prisma.job.create({
      data: {
        tenantId,
        status: job.status!,
        servicetype: job.servicetype!,
        type: job.type!,
        comment: job.comment || null,
        agreementId: job.agreementId!,
        carId: job.carId || null,
        date: job.date!,
        repetition: job.repetition!,
      },
    });

    return { newJob };
  } catch (error) {
    return { error };
  }
}

export async function deleteJob(id: number) {
  try {
    const deletedJob = await prisma.job.delete({
      where: { id },
    });

    return { deletedJob };
  } catch (error) {
    return { error };
  }
}
