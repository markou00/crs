'use server';

import { Agreement } from '@prisma/client';

import prisma from '@/lib/prisma';
import { validateRequest } from './user-actions';

export async function getAgreements() {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const agreements = await prisma.agreement.findMany({
      where: { tenantId },
      include: {
        customer: true,
      },
    });

    return { agreements };
  } catch (error) {
    return { error };
  }
}

export async function editAgreement(agreement: Partial<Agreement>) {
  try {
    const modifiedAgreement = await prisma.agreement.update({
      where: { id: agreement.id },
      data: agreement,
    });

    return { modifiedAgreement };
  } catch (error) {
    return { error };
  }
}

export async function addAgreement(agreement: Partial<Agreement>) {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const newAgreement = await prisma.agreement.create({
      data: {
        tenantId,
        type: agreement.type!,
        status: agreement.status!,
        validFrom: agreement.validFrom!,
        customerId: agreement.customerId!,
        validTo: agreement.validTo || null,
        comment: agreement.comment || null,
        containerName: agreement.containerName!,
      },
    });

    return { newAgreement };
  } catch (error) {
    return { error };
  }
}

export async function deleteAgreement(id: number) {
  try {
    const deletedAgreement = await prisma.agreement.delete({
      where: { id },
    });

    return { deletedAgreement };
  } catch (error) {
    return { error };
  }
}
