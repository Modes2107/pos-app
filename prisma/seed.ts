import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`✔ Адміністратор готовий: ${username} / ${password}`);

  const categories = ["Напої", "Снеки", "Бакалея", "Молочні продукти", "Побутова хімія"];
  const categoryRecords: Record<string, string> = {};
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryRecords[name] = cat.id;
  }

  const demoProducts = [
    { name: "Вода мінеральна 0.5л", sku: "SKU-0001", barcode: "4820000000010", price: 15.5, stock: 120, category: "Напої" },
    { name: "Кола 0.5л", sku: "SKU-0002", barcode: "4820000000027", price: 28.0, stock: 80, category: "Напої" },
    { name: "Чіпси зі смаком сиру 130г", sku: "SKU-0003", barcode: "4820000000034", price: 45.9, stock: 40, category: "Снеки" },
    { name: "Шоколадний батончик", sku: "SKU-0004", barcode: "4820000000041", price: 22.0, stock: 100, category: "Снеки" },
    { name: "Гречка 900г", sku: "SKU-0005", barcode: "4820000000058", price: 52.3, stock: 60, category: "Бакалея" },
    { name: "Молоко 2.5% 1л", sku: "SKU-0006", barcode: "4820000000065", price: 38.0, stock: 30, category: "Молочні продукти" },
    { name: "Йогурт полуничний 130г", sku: "SKU-0007", barcode: "4820000000072", price: 19.5, stock: 50, category: "Молочні продукти" },
    { name: "Порошок пральний 1кг", sku: "SKU-0008", barcode: "4820000000089", price: 110.0, stock: 15, category: "Побутова хімія" },
  ];

  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        price: p.price,
        stock: p.stock,
        minStock: 10,
        categoryId: categoryRecords[p.category],
      },
    });
  }

  console.log(`✔ Додано ${demoProducts.length} демо-товарів`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
