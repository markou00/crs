'use server';

import { Customer } from '@prisma/client';

import prisma from '@/lib/prisma';
import { validateRequest } from './user-actions';

export async function getCustomers() {
  try {
    const { user } = await validateRequest();
    const tenantId = user?.tenantId ?? '';

    const customers = await prisma.customer.findMany({
      where: { tenantId },
    });

    return { customers };
  } catch (error) {
    return { error };
  }
}

export async function editCustomer(customer: Partial<Customer>) {
  try {
    const modifiedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: customer,
    });

    return { modifiedCustomer };
  } catch (error) {
    return { error };
  }
}

export async function deleteCustomer(id: number) {
  try {
    const deletedCustomer = await prisma.customer.delete({
      where: { id },
    });

    return { deletedCustomer };
  } catch (error) {
    return { error };
  }
}
