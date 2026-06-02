import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { enrichProduct } from '../route';

async function findProductByIdOrSlug(id: string) {
  let idNum = parseInt(id);
  if (!isNaN(idNum)) {
    return await prisma.product.findUnique({
      where: { id: idNum }
    });
  }

  // If slug is provided (like 'wild-forest'), resolve it to the database entry by name matching
  const stringToNameMap: Record<string, string> = {
    'wild-forest': 'WILD FOREST',
    'clover-blossom': 'CLOVER BLOSSOM',
    'black-truffle': 'ROYAL BLACK',
  };
  const resolvedName = stringToNameMap[id] || id.replace('-', ' ').toUpperCase();
  
  return await prisma.product.findFirst({
    where: {
      name: {
        equals: resolvedName
      }
    }
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, subName, color, gradient, price, description, characteristics, rarity, bgGlow, stock, image } = body;

    const existing = await findProductByIdOrSlug(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    const charsStr = Array.isArray(characteristics)
      ? characteristics.join(', ')
      : characteristics !== undefined ? characteristics : existing.characteristics;

    const updatedProduct = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: name !== undefined ? name : existing.name,
        subName: subName !== undefined ? subName : existing.subName,
        color: color !== undefined ? color : existing.color,
        gradient: gradient !== undefined ? gradient : existing.gradient,
        price: price !== undefined ? parseFloat(price) : existing.price,
        description: description !== undefined ? description : existing.description,
        characteristics: charsStr,
        rarity: rarity !== undefined ? rarity : existing.rarity,
        bgGlow: bgGlow !== undefined ? bgGlow : existing.bgGlow,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        image: image !== undefined ? image : existing.image,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product successfully updated!',
      product: enrichProduct(updatedProduct)
    }, { status: 200 });

  } catch (error: any) {
    console.error('PUT product API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await findProductByIdOrSlug(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found in database.' },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Product successfully banished from the database!'
    }, { status: 200 });

  } catch (error: any) {
    console.error('DELETE product API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error deleting product' },
      { status: 500 }
    );
  }
}
