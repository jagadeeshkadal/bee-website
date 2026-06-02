import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, shippingAddress } = body;

    // Validation
    if (!name || !email || !password || !phone || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'All profile registration fields (Name, Email, Password, Phone, Shipping Address) are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists in SQLite
    const userExists = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (userExists) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Insert new user into SQLite using Prisma
    const newAccount = await prisma.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        password: password, // In production, we'd hash this using bcrypt
        phone: phone.trim(),
        shippingAddress: shippingAddress.trim(),
      }
    });

    // Strip password from returned payload
    const { password: _, ...secureUser } = newAccount;

    return NextResponse.json(
      {
        success: true,
        message: 'Account successfully registered in database!',
        user: {
          ...secureUser,
          registeredAt: secureUser.registeredAt.toISOString()
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
