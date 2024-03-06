import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const customers = await prisma.customer.findMany({ where: { tenantId: params.tenantId } });

    return new NextResponse(JSON.stringify(customers), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch customer data' }), {
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

    const created = await prisma.customer.create({
      data: json,
    });

    return new NextResponse(JSON.stringify(created), { status: 201 });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create customer' }), {
      status: 500,
    });
  }
}
