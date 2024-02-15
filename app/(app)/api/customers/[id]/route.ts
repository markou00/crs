import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/prisma/client';

export async function GET(request: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const customers = await prisma.customer.findUnique({
      where: {
        id: parseInt(id, 10),
      },
    });
    return new NextResponse(JSON.stringify(customers), {
      status: 200, // HTTP 200 OK
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch customer data' }), {
      status: 500, // HTTP 500 Internal Server Error
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
