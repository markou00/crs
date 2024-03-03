'use server';

import prisma from '@/lib/prisma';

export async function getAgreements() {
  try {
    const agreements = await prisma.agreement.findMany({
      include: {
        customer: true,
        container: true,
      },
    });

    return { agreements };
  } catch (error) {
    return { error };
  }
}
