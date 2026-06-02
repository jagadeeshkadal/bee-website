import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Seed orders from JSON if database is empty (ensures mock purchase history works)
async function seedOrdersIfNeeded() {
  try {
    const count = await prisma.order.count();
    if (count === 0) {
      const filePath = path.join(process.cwd(), 'data', 'orders_database.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const defaultOrders = JSON.parse(fileContent);
        
        for (const order of defaultOrders) {
          await prisma.order.create({
            data: {
              orderNumber: order.orderNumber,
              productId: order.productId,
              productName: order.productName,
              quantity: parseInt(order.quantity),
              unitPrice: parseFloat(order.unitPrice),
              totalAmount: parseFloat(order.totalAmount),
              customerName: order.customerName,
              customerEmail: order.customerEmail.trim().toLowerCase(),
              shippingAddress: order.shippingAddress.trim(),
              timestamp: order.timestamp ? new Date(order.timestamp) : new Date(),
              status: order.status || 'Confirmed',
            }
          });
        }
        console.log('Successfully seeded SQLite database with default orders.');
      }
    }
  } catch (error) {
    console.error('Failed to seed orders inside SQLite:', error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required.' },
        { status: 400 }
      );
    }

    // Auto-seed if SQLite is empty
    await seedOrdersIfNeeded();

    const trimmedEmail = email.trim().toLowerCase();

    // Query orders directly from SQLite using Prisma
    const ordersDb = await prisma.order.findMany({
      where: {
        customerEmail: {
          equals: trimmedEmail
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const formattedOrders = ordersDb.map(o => ({
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
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving order history.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, quantity, price, customerName, customerEmail, customerPhone, shippingAddress } = body;

    // Validation
    if (!productId || !productName || !quantity || !price || !customerName || !customerEmail || !customerPhone || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'All order fields (Product, Qty, Price, Name, Email, Phone, Shipping Address) are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    const orderQty = parseInt(quantity);
    if (isNaN(orderQty) || orderQty <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a positive integer.' },
        { status: 400 }
      );
    }

    const trimmedEmail = customerEmail.trim().toLowerCase();

    // Step 1: Verify & update stock inside SQLite database via Prisma in an atomic transaction
    const resolvedProduct = await prisma.$transaction(async (tx) => {
      // Find product by database integer ID or slug key
      let dbProduct = null;
      const idNum = parseInt(productId);
      
      if (!isNaN(idNum)) {
        dbProduct = await tx.product.findUnique({
          where: { id: idNum }
        });
      } else {
        dbProduct = await tx.product.findUnique({
          where: { idKey: productId }
        });
      }

      if (!dbProduct) {
        throw new Error('Product not found in catalog.');
      }

      const currentStock = dbProduct.stock;
      if (currentStock < orderQty) {
        throw new Error(`Insufficient inventory. Only ${currentStock} jars remaining.`);
      }

      // Deduct stock
      const updated = await tx.product.update({
        where: { id: dbProduct.id },
        data: {
          stock: currentStock - orderQty
        }
      });

      return updated;
    });

    // Step 2: Create luxury order receipt and save directly to SQLite Order table
    const parsedPrice = parseFloat(price.toString().replace('$', ''));
    const totalAmount = parsedPrice * orderQty;
    const orderNumber = `BEE-${Math.floor(100000 + Math.random() * 900000)}-GOLD`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        productId,
        productName,
        quantity: orderQty,
        unitPrice: parsedPrice,
        totalAmount,
        customerName: customerName.trim(),
        customerEmail: trimmedEmail,
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Luxury nectar allocation successfully confirmed!',
        order: {
          ...newOrder,
          timestamp: newOrder.timestamp.toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing allocation.' },
      { status: 500 }
    );
  }
}
