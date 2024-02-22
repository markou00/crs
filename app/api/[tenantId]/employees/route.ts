import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const employees = await prisma.employee.findMany({
      where: { tenantId: params.tenantId },
      include: {
        Car: true,
      },
    });

    const response = employees.map((employee) => ({
      ...employee,
      car: employee.Car?.regnr || 'Ingen bil',
    }));

    return new NextResponse(JSON.stringify(response), {
      status: 200, // HTTP 200 OK
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch employee data' }), {
      status: 500, // HTTP 500 Internal Server Error
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
      data: {
        ...json,
        carId: json.carId ? parseInt(json.carId, 10) : null,
      },
    });

    return new NextResponse(JSON.stringify(created), { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create employee' }), {
      status: 500,
    });
  }
}
