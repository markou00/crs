import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const employees = await prisma.employee.findMany({
      where: { tenantId: params.tenantId },
      include: {
        car: true,
      },
    });

    const response = employees.map((employee) => ({
      ...employee,
      car: employee.car?.regnr || 'Ingen bil',
    }));

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch employee data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const created = await prisma.employee.create({
      data: json,
    });

    return new NextResponse(JSON.stringify(created), { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create employee' }), {
      status: 500,
    });
  }
}
