'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Agreement } from '@prisma/client';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getAgreements() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

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
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

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
