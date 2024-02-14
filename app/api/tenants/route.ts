import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany();

    if (!tenants) {
      return new NextResponse('Tenants not found', {
        status: 404,
      });
    }

    return new NextResponse(JSON.stringify(tenants), {
      status: 200,
      statusText: 'Tenants fetched successfully',
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch tenants' }), {
      status: 500,
    });
  }
}
