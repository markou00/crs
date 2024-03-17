import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const cars = await prisma.car.findMany({
      where: {
        tenantId: params.tenantId,
        Employee: null,
      },
    });

    return new NextResponse(JSON.stringify(cars), {
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
