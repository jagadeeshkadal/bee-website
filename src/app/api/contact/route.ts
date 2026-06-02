import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve contact messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve contact messages.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Server-side validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields (Name, Email, Subject, Message) are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Save to SQLite database using Prisma with autoincrement integer ID
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been successfully harvested and saved!',
        data: savedMessage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Backend contact submission error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error occurred' },
      { status: 500 }
    );
  }
}

// Support DELETE method for individual message cleanup inside Admin Panel
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { success: false, error: 'Message ID must be an integer.' },
        { status: 400 }
      );
    }

    await prisma.contactMessage.delete({
      where: { id: idNum }
    });

    return NextResponse.json(
      { success: true, message: 'Message successfully deleted.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Backend contact deletion error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error occurred' },
      { status: 500 }
    );
  }
}
