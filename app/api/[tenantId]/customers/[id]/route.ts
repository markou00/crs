import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Get a specific customer
export async function GET(
  request: NextRequest,
  { params: { tenantId, id } }: { params: { tenantId: string; id: string } }
) {
  try {
    const customers = await prisma.customer.findUnique({
      where: {
        id: parseInt(id, 10),
        tenantId,
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

// PUT function for a specific customer
export async function PUT(request: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const json = await request.json();

    const updated = await prisma.customer.update({
      where: {
        id: parseInt(id, 10),
      },
      data: json,
    });

    return new NextResponse(JSON.stringify(updated), {
      status: 200, // HTTP status code 200 OK
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let errorMessage = 'An error occurred while updating the customer.';
    let statusCode = 500; // Internal Server Error

    // Needs adjustment to fit Prisma error codes
    if (error instanceof Error && error.name === 'NotFoundError') {
      errorMessage = 'Customer not found.';
      statusCode = 404; // Not Found
    } else if (error instanceof Error && error.name === 'PrismaClientValidationError') {
      errorMessage = 'Validation error.';
      statusCode = 400; // Bad Request
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// PATCH function for a specific customer
export async function PATCH(request: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const json = await request.json();

    const updated = await prisma.customer.update({
      where: {
        id: parseInt(id, 10),
      },
      data: json,
    });

    return new NextResponse(JSON.stringify(updated), {
      status: 200, // HTTP status code 200 OK
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let errorMessage = 'An error occurred while updating the customer.';
    let statusCode = 500; // Internal Server Error

    // Needs adjustment to fit Prisma error codes
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      errorMessage = 'Customer not found.';
      statusCode = 404; // Not Found
    } else if (error instanceof Error && error.message.includes('ValidationError')) {
      errorMessage = 'Validation error.';
      statusCode = 400; // Bad Request
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// DELETE function for a specific customer
export async function DELETE(request: NextRequest, { params: { id } }: { params: { id: string } }) {
  try {
    const deleted = await prisma.customer.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    return new NextResponse(JSON.stringify(deleted), {
      status: 200, // HTTP status code 200 OK
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let errorMessage = 'An error occurred while deleting the customer.';
    let statusCode = 500; // Internal Server Error

    // Needs adjustment to fit Prisma error codes
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      errorMessage = 'Customer not found.';
      statusCode = 404; // Not Found
    } else if (error instanceof Error && error.message.includes('ForeignKeyConstraintViolation')) {
      errorMessage = 'Cannot delete the customer because it is referenced by other records.';
      statusCode = 409; // Conflict
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
