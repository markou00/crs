import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const cars = await prisma.car.findMany({
      where: { tenantId: params.tenantId },
      include: {
        Employee: true,
      },
    });

    const response = cars.map((car) => ({
      ...car,
      car: car.Employee?.name || 'Ingen sjåfør',
    }));

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch car data' }), {
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

    const created = await prisma.car.create({
      data: json,
    });

    return new NextResponse(JSON.stringify(created), { status: 201 });
  } catch (error) {
    console.error('Failed to create car:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create car' }), {
      status: 500,
    });
  }
}
