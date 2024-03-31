'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Employee } from '@prisma/client';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';

export async function getEmployees() {
  try {
    const supabase = createServerActionClient({ cookies });

    const authUser = await supabase.auth.getUser();
    const tenantId = authUser.data.user?.user_metadata.tenantId;

    const employees = await prisma.employee.findMany({
      where: { tenantId },
      include: {
        Car: true,
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
