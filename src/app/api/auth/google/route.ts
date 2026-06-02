import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and Name are required from Google auth.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists in SQLite
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    let message = 'Welcome back!';
    if (!user) {
      // Automatically register a new user in SQLite for this Google account
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: trimmedEmail,
          password: `google-oauth-${Math.random().toString(36).substring(2)}`, // dummy password
          phone: '',
          shippingAddress: '',
        }
      });
      message = 'Google account successfully linked and registered in database!';
    }

    // Strip password from returned payload
    const { password: _, ...secureUser } = user;

    return NextResponse.json(
      {
        success: true,
        message,
        user: {
          ...secureUser,
          registeredAt: secureUser.registeredAt.toISOString()
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Google link database auth error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal database error during Google link auth.' },
      { status: 500 }
    );
  }
}
