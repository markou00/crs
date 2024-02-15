import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/prisma/client';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
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

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const created = await prisma.customer.create({
      data: json,
    });

    return new NextResponse(JSON.stringify(created), { status: 201 });
  } catch (error) {
    console.error('Failed to create customer:', error);
    // Return a generic error message to the client
    // Consider logging the error to a logging service for further investigation
    return new NextResponse(JSON.stringify({ error: 'Failed to create customer' }), {
      status: 500,
    });
  }
}
