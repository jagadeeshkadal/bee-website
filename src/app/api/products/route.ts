import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export function enrichProduct(p: any) {
  return {
    id: p.idKey,          // String ID for frontend animations
    dbId: p.id,           // Numeric ID for database updates
    name: p.name,
    subName: p.subName,
    color: p.color,
    gradient: p.gradient,
    price: p.price,
    description: p.description,
    characteristics: typeof p.characteristics === 'string' 
      ? p.characteristics.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0)
      : p.characteristics || [],
    rarity: p.rarity,
    bgGlow: p.bgGlow,
    stock: p.stock,
    image: p.image || null,
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString(),
  };
}

// Seed products from JSON if database is empty
async function seedProductsIfNeeded() {
  try {
    const count = await prisma.product.count();
    if (count === 0) {
      const filePath = path.join(process.cwd(), 'data', 'products_database.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const defaultProducts = JSON.parse(fileContent);
        
        for (const prod of defaultProducts) {
          const charsStr = Array.isArray(prod.characteristics) 
            ? prod.characteristics.join(', ') 
            : prod.characteristics || '100% Organic, Raw';

          await prisma.product.create({
            data: {
              idKey: prod.id,
              name: prod.name,
              subName: prod.subName,
              color: prod.color,
              gradient: prod.gradient,
              price: parseFloat(prod.price),
              description: prod.description,
              characteristics: charsStr,
              rarity: prod.rarity,
              bgGlow: prod.bgGlow,
              stock: parseInt(prod.stock || 0),
              image: prod.image || '',
            }
          });
        }
        console.log('Successfully seeded SQLite database with default products.');
      }
    }
  } catch (error) {
    console.error('Failed to seed products inside SQLite:', error);
  }
}

export async function GET() {
  try {
    await seedProductsIfNeeded();
    const productsDb = await prisma.product.findMany({
      orderBy: {
        createdAt: 'asc',
      }
    });

    const products = productsDb.map(p => enrichProduct(p));
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error('GET products API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      subName,
      color,
      gradient,
      price,
      stock,
      description,
      characteristics,
      rarity,
      bgGlow,
      image
    } = body;

    // Strict validation
    if (!name || price === undefined || stock === undefined || !description) {
      return NextResponse.json(
        { success: false, error: 'Required fields (Name, Price, Stock, Description) are missing.' },
        { status: 400 }
      );
    }

    const customIdKey = id ? id.trim().toLowerCase() : name.trim().toLowerCase().replace(/\s+/g, '-');

    const charsStr = Array.isArray(characteristics) 
      ? characteristics.join(', ') 
      : characteristics || 'Craft Raw Nectar';

    const newProduct = await prisma.product.create({
      data: {
        idKey: customIdKey,
        name: name.trim(),
        subName: subName ? subName.trim() : 'Artisanal Nectar Expression',
        color: color ? color.trim() : '#ffb703',
        gradient: gradient ? gradient.trim() : 'from-[#ffb703] to-[#e85d04]',
        price: parseFloat(price.toString()),
        description: description.trim(),
        characteristics: charsStr,
        rarity: rarity ? rarity.trim() : 'Limited Release',
        bgGlow: bgGlow ? bgGlow.trim() : 'rgba(255, 183, 3, 0.12)',
        stock: parseInt(stock.toString()),
        image: image ? image.trim() : '',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product successfully crafted and stored in database!',
      product: enrichProduct(newProduct)
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST product API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error creating product' },
      { status: 500 }
    );
  }
}
