import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type CartInput = {
  productId: string;
  quantity: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: CartInput[] = body.items;
    const paymentType: "CASH" | "CARD" = body.paymentType;
    const cashGiven: number | undefined = body.cashGiven;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Кошик порожній" }, { status: 400 });
    }
    if (paymentType !== "CASH" && paymentType !== "CARD") {
      return NextResponse.json({ error: "Вкажіть тип оплати" }, { status: 400 });
    }

    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;
      const saleItemsData: {
        productId: string;
        name: string;
        price: Prisma.Decimal | number;
        quantity: number;
        subtotal: number;
      }[] = [];

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw new Error("Некоректна позиція в кошику");
        }
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Товар не знайдено (${item.productId})`);
        }
        if (!product.isActive) {
          throw new Error(`Товар "${product.name}" деактивовано`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Недостатньо залишку для "${product.name}" (в наявності: ${product.stock})`
          );
        }

        const price = Number(product.price);
        const subtotal = Math.round(price * item.quantity * 100) / 100;
        total += subtotal;

        saleItemsData.push({
          productId: product.id,
          name: product.name,
          price,
          quantity: item.quantity,
          subtotal,
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      total = Math.round(total * 100) / 100;

      let changeGiven: number | null = null;
      if (paymentType === "CASH") {
        if (cashGiven === undefined || cashGiven === null || cashGiven < total) {
          throw new Error("Сума готівки менша за суму до сплати");
        }
        changeGiven = Math.round((cashGiven - total) * 100) / 100;
      }

      return tx.sale.create({
        data: {
	  adminId: "admin",
          total,
          paymentType,
          cashGiven: paymentType === "CASH" ? cashGiven : null,
          changeGiven,
          items: {
            create: saleItemsData,
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(
      {
        id: sale.id,
        number: sale.number,
        total: Number(sale.total),
        paymentType: sale.paymentType,
        cashGiven: sale.cashGiven ? Number(sale.cashGiven) : null,
        changeGiven: sale.changeGiven ? Number(sale.changeGiven) : null,
        createdAt: sale.createdAt,
        items: sale.items.map((i) => ({
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Помилка при оформленні продажу";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const paymentType = searchParams.get("paymentType");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") || 30)));

  const where: Prisma.SaleWhereInput = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }
  if (paymentType === "CASH" || paymentType === "CARD") {
    where.paymentType = paymentType;
  }
  if (q) {
    where.OR = [
      { items: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
    const asNumber = Number(q);
    if (!Number.isNaN(asNumber)) {
      where.OR.push({ number: asNumber });
    }
  }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.sale.count({ where }),
  ]);

  return NextResponse.json({
    items: sales.map((s) => ({
      id: s.id,
      number: s.number,
      total: Number(s.total),
      paymentType: s.paymentType,
      cashGiven: s.cashGiven ? Number(s.cashGiven) : null,
      changeGiven: s.changeGiven ? Number(s.changeGiven) : null,
      createdAt: s.createdAt,
      items: s.items.map((i) => ({
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      })),
    })),
    total,
    page,
    pageSize,
  });
}
