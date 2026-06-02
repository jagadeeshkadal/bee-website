import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        registeredAt: 'desc'
      }
    });

    // Strip passwords before returning
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(
      {
        success: true,
        users: safeUsers
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin Fetch Users Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve registered foragers.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID parameter is required.' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid User ID format.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Forager registry item deleted successfully.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin Delete User Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user profile.' },
      { status: 500 }
    );
  }
}
