import { NextRequest, NextResponse } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


function startOfDay(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);  // Змінено з setHours на setUTCHours
  return x;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tzOffset = Number(searchParams.get("tzOffset") || 0);
  
  const now = new Date();
  now.setMinutes(now.getMinutes() - tzOffset);
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 29);

  const [todaySales, weekSales, monthSales] = await Promise.all([
    prisma.sale.findMany({ where: { createdAt: { gte: todayStart } } }),
    prisma.sale.findMany({ where: { createdAt: { gte: weekStart } } }),
    prisma.sale.findMany({
      where: { createdAt: { gte: monthStart } },
      include: { items: true },
    }),
  ]);

  const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
  const weekTotal = weekSales.reduce((sum, s) => sum + Number(s.total), 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + Number(s.total), 0);
  const cashTotal = monthSales
    .filter((s) => s.paymentType === "CASH")
    .reduce((sum, s) => sum + Number(s.total), 0);
  const cardTotal = monthSales
    .filter((s) => s.paymentType === "CARD")
    .reduce((sum, s) => sum + Number(s.total), 0);

  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const sale of monthSales) {
    for (const item of sale.items) {
      const existing = productMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.subtotal);
      productMap.set(item.name, existing);
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() + i);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const sale of monthSales) {
    const key = new Date(sale.createdAt).toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(sale.total));
  }
  const dailyTotals = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }));

  const allProducts = await prisma.product.findMany({ where: { isActive: true } });
  const lowStock = allProducts
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock, minStock: p.minStock }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 20);

  return NextResponse.json({
    todayTotal: Math.round(todayTotal * 100) / 100,
    todayCount: todaySales.length,
    weekTotal: Math.round(weekTotal * 100) / 100,
    monthTotal: Math.round(monthTotal * 100) / 100,
    cashTotal: Math.round(cashTotal * 100) / 100,
    cardTotal: Math.round(cardTotal * 100) / 100,
    topProducts,
    dailyTotals,
    lowStock,
  });
}
