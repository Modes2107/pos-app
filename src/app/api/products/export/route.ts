import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export async function GET(_request: NextRequest) {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const rows = products.map((p: (typeof products)[number]) => [
    p.sku,
    p.barcode || "",
    p.name,
    p.category?.name || "",
    Number(p.price).toFixed(2),
    p.stock,
    p.minStock,
    p.isActive ? "Активний" : "Неактивний",
  ]);

  const csv = toCsv(
    ["Артикул", "Штрих-код", "Назва", "Категорія", "Ціна", "Залишок", "Мін. залишок", "Статус"],
    rows
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="warehouse-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
