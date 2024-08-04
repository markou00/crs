'use server';

import { Employee } from '@prisma/client';

import prisma from '@/lib/prisma';
import { validateRequest } from './user-actions';

export async function getEmployees() {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const employees = await prisma.employee.findMany({
      where: { tenantId },
      include: {
        car: true,
      },
    });

    return { employees };
  } catch (error) {
    return { error };
  }
}

export async function editEmployee(employee: Partial<Employee>) {
  try {
    const modifiedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: employee,
    });

    return { modifiedEmployee };
  } catch (error) {
    return { error };
  }
}

export async function deleteEmployee(id: number) {
  try {
    const deletedEmployee = await prisma.employee.delete({
      where: { id },
    });

    return { deletedEmployee };
  } catch (error) {
    return { error };
  }
}
