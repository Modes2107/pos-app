import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Помилка при видаленні" }, { status: 500 });
  }
}