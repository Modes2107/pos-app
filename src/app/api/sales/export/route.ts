import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const paymentType = searchParams.get("paymentType");

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

  const sales = await prisma.sale.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: (string | number)[][] = [];
  for (const sale of sales) {
    const date = new Date(sale.createdAt);
    const dateStr = date.toLocaleDateString("uk-UA");
    const timeStr = date.toLocaleTimeString("uk-UA");
    for (const item of sale.items) {
      rows.push([
        sale.number,
        dateStr,
        timeStr,
        sale.paymentType === "CASH" ? "Готівка" : "Картка",
        item.name,
        Number(item.price).toFixed(2),
        item.quantity,
        Number(item.subtotal).toFixed(2),
        Number(sale.total).toFixed(2),
      ]);
    }
  }

  const csv = toCsv(
    [
      "№ чека",
      "Дата",
      "Час",
      "Тип оплати",
      "Товар",
      "Ціна",
      "Кількість",
      "Сума позиції",
      "Сума чека",
    ],
    rows
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
