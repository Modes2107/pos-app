import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId");
  const lowStockOnly = searchParams.get("lowStock") === "1";
  const includeInactive = searchParams.get("includeInactive") === "1";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") || 50)));

  const where: Prisma.ProductWhereInput = {};
  if (!includeInactive) where.isActive = true;
  if (categoryId) where.categoryId = categoryId;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { barcode: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  let filtered = items;
  if (lowStockOnly) {
    filtered = items.filter((p) => p.stock <= p.minStock);
  }

  return NextResponse.json({
    items: filtered.map(serializeProduct),
    total,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sku, barcode, price, stock, minStock, imageUrl, categoryId } = body;

    if (!name || !sku || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Заповніть обов'язкові поля: назва, артикул, ціна" },
        { status: 400 }
      );
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json({ error: "Товар з таким артикулом вже існує" }, { status: 409 });
    }

    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode } });
      if (existingBarcode) {
        return NextResponse.json(
          { error: "Товар з таким штрих-кодом вже існує" },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        price,
        stock: stock ?? 0,
        minStock: minStock ?? 0,
        imageUrl: imageUrl || null,
        categoryId: categoryId || null,
      },
      include: { category: true },
    });

    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Помилка при створенні товару" }, { status: 500 });
  }
}
