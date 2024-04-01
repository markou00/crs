'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Car } from '@prisma/client';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getCars() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const cars = await prisma.car.findMany({
      where: { tenantId },
      include: {
        Employee: true,
      },
    });

    return { cars };
  } catch (error) {
    return { error };
  }
}

export async function editCar(car: Partial<Car>) {
  try {
    const modifiedCar = await prisma.car.update({
      where: { id: car.id },
      data: car,
    });

    return { modifiedCar };
  } catch (error) {
    return { error };
  }
}
