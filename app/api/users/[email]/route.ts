import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { email: string } }) {
  const { email } = params;

  if (!email) {
    return new NextResponse(JSON.stringify({ error: 'User email is not defined' }), {
      status: 400,
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return new NextResponse('User not found', {
        status: 404,
      });
    }

    return new NextResponse(JSON.stringify(user), {
      status: 200,
      statusText: 'User fetched successfully',
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch the user' }), {
      status: 500,
    });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { email: string } }) {
  const { email } = params;

  if (!email) {
    return new NextResponse(JSON.stringify({ error: 'User email is not defined' }), {
      status: 400,
    });
  }

  try {
    const userData = await req.json();
    if (!userData) {
      return new NextResponse(JSON.stringify({ error: 'User data is not defined' }), {
        status: 400,
      });
    }

    const tenant = await prisma.tenant.create({
      data: {
        id: userData.tenantId,
        name: userData.tenantName,
      },
    });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        tenantId: tenant.id,
      },
    });

    return new NextResponse(JSON.stringify(updatedUser), {
      status: 200,
      statusText: 'User created successfully',
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to create a user' }), {
      status: 500,
    });
  }
}
