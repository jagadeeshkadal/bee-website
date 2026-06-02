import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed user accounts from JSON if database is empty (ensures mock profiles work)
async function seedUsersIfNeeded() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      const filePath = path.join(process.cwd(), 'data', 'accounts_database.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const defaultAccounts = JSON.parse(fileContent);
        
        for (const acc of defaultAccounts) {
          await prisma.user.create({
            data: {
              name: acc.name,
              email: acc.email.trim().toLowerCase(),
              password: acc.password,
              shippingAddress: acc.shippingAddress.trim(),
              registeredAt: acc.registeredAt ? new Date(acc.registeredAt) : new Date(),
            }
          });
        }
        console.log('Successfully seeded SQLite database with default user accounts.');
      }
    }
  } catch (error) {
    console.error('Failed to seed user accounts inside SQLite:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Auto-seed if SQLite is empty
    await seedUsersIfNeeded();

    const trimmedEmail = email.trim().toLowerCase();

    // Authenticate user directly from SQLite using Prisma
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Strip password from returned payload for standard security practices
    const { password: _, ...secureUser } = user;

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful.',
        user: {
          ...secureUser,
          registeredAt: secureUser.registeredAt.toISOString()
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
