import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

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
