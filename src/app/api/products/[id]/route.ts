import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    price: Number(p.price),
    stock: p.stock,
    minStock: p.minStock,
    imageUrl: p.imageUrl,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    isActive: p.isActive,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
  }
  return NextResponse.json(serializeProduct(product));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, sku, barcode, price, stock, minStock, imageUrl, categoryId, isActive } = body;

    if (sku) {
      const existing = await prisma.product.findFirst({
        where: { sku, NOT: { id: params.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Товар з таким артикулом вже існує" }, { status: 409 });
      }
    }
    if (barcode) {
      const existing = await prisma.product.findFirst({
        where: { barcode, NOT: { id: params.id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Товар з таким штрих-кодом вже існує" },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(barcode !== undefined && { barcode: barcode || null }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(minStock !== undefined && { minStock }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { category: true },
    });

    return NextResponse.json(serializeProduct(product));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Помилка при оновленні товару" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Якщо товар вже фігурує в продажах - краще деактивувати, а не видаляти,
    // щоб зберегти цілісність історії продажів.
    const usedInSales = await prisma.saleItem.findFirst({ where: { productId: params.id } });
    if (usedInSales) {
      const product = await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
        include: { category: true },
      });
      return NextResponse.json({
        ...serializeProduct(product),
        deactivated: true,
      });
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, deleted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Помилка при видаленні товару" }, { status: 500 });
  }
}
