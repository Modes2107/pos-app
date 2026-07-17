import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Вкажіть назву" }, { status: 400 });
    }
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Помилка при оновленні" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Помилка при видаленні" }, { status: 500 });
  }
}