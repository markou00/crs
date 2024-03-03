import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Fetch a single employee
export async function GET(
  request: NextRequest,
  { params: { tenantId, id } }: { params: { tenantId: string; id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id: parseInt(id, 10),
        tenantId,
      },
    });
    return new NextResponse(JSON.stringify(employee), {
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

// Replace an employee
export async function PUT(
  request: NextRequest,
  { params: { id, tenantId } }: { params: { id: string; tenantId: string } }
) {
  try {
    const json = await request.json();

    const updated = await prisma.employee.update({
      where: {
        id: parseInt(id, 10),
        tenantId,
      },
      data: json,
    });

    return new NextResponse(JSON.stringify(updated), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let errorMessage = 'An error occurred while updating the employee.';
    let statusCode = 500;

    if (error instanceof Error && error.name === 'NotFoundError') {
      errorMessage = 'Employee not found.';
      statusCode = 404;
    } else if (error instanceof Error && error.name === 'PrismaClientValidationError') {
      errorMessage = 'Validation error.';
      statusCode = 400;
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// update en employee
export async function PATCH(request: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const json = await request.json();

    const updated = await prisma.employee.update({
      where: {
        id: parseInt(id, 10),
      },
      data: json,
    });

    return new NextResponse(JSON.stringify(updated), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let errorMessage = 'An error occurred while updating the employee.';
    let statusCode = 500;

    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      errorMessage = 'Employee not found.';
      statusCode = 404;
    } else if (error instanceof Error && error.message.includes('ValidationError')) {
      errorMessage = 'Validation error.';
      statusCode = 400;
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Delete an employee
export async function DELETE(
  request: NextRequest,
  { params: { id, tenantId } }: { params: { id: string; tenantId: string } }
) {
  try {
    const deleted = await prisma.employee.delete({
      where: {
        id: parseInt(id, 10),
        tenantId,
      },
    });

    return new NextResponse(JSON.stringify(deleted), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let errorMessage = 'An error occurred while deleting the employee.';
    let statusCode = 500;

    if (error instanceof Error && error.name === 'RecordNotFound') {
      errorMessage = 'Employee not found.';
      statusCode = 404;
    } else if (error instanceof Error && error.name === 'ForeignKeyConstraintViolation') {
      errorMessage = 'Cannot delete the employee because it is referenced by other records.';
      statusCode = 409;
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
