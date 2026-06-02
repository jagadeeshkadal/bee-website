import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });

    const formattedOrders = orders.map(o => ({
      ...o,
      timestamp: o.timestamp.toISOString()
    }));

    return NextResponse.json(
      {
        success: true,
        orders: formattedOrders
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin Fetch Orders Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve allocations ledger.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, status } = body;

    if (!orderNumber || !status) {
      return NextResponse.json(
        { success: false, error: 'Order Number and Status parameters are required.' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: { status }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Order successfully updated to ${status}.`,
        order: {
          ...updatedOrder,
          timestamp: updatedOrder.timestamp.toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin Update Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Order Number parameter is required.' },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { orderNumber }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order reservation banished successfully from database.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin Delete Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete order.' },
      { status: 500 }
    );
  }
}
