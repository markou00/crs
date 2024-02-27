'use server';

import prisma from '@/lib/prisma';

export async function getAgreements() {
  try {
    const agreements = await prisma.agreement.findMany();

    return { agreements };
  } catch (error) {
    return { error };
  }
}
