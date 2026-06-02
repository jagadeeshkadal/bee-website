import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, shippingAddress } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user exists in SQLite
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found.' },
        { status: 404 }
      );
    }

    // Update fields directly in SQLite using Prisma
    const updatedUser = await prisma.user.update({
      where: { email: trimmedEmail },
      data: {
        shippingAddress: shippingAddress !== undefined ? shippingAddress.trim() : user.shippingAddress,
        phone: phone !== undefined ? phone.trim() : user.phone,
      }
    });

    // Strip password from returned payload
    const { password: _, ...secureUser } = updatedUser;

    return NextResponse.json(
      {
        success: true,
        message: 'Profile details successfully updated in database!',
        user: {
          ...secureUser,
          registeredAt: secureUser.registeredAt.toISOString()
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating profile.' },
      { status: 500 }
    );
  }
}
