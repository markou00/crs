'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Customer } from '@prisma/client';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getCustomers() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

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
