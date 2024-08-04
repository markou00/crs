'use server';

import { Car } from '@prisma/client';

import prisma from '@/lib/prisma';
import { validateRequest } from './user-actions';

export async function getCars() {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const cars = await prisma.car.findMany({
      where: { tenantId },
      include: {
        employee: true,
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
