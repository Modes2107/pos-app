import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Видалити старі дані
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.admin.deleteMany({});

  // Створити адмінів
  const adminPassword = await bcrypt.hash("admin123", 10);
  const polinaPassword = await bcrypt.hash("123", 10);

  const admin = await prisma.admin.create({
    data: { username: "admin", passwordHash: adminPassword },
  });

  const polina = await prisma.admin.create({
    data: { username: "Polina", passwordHash: polinaPassword },
  });

  console.log(`✔ Адміністратор: admin / admin123`);
  console.log(`✔ Polina: Polina / 123`);

  // Категорії
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Одноразові пристрої" } }),
    prisma.category.create({ data: { name: "Перезарядні пристрої" } }),
    prisma.category.create({ data: { name: "Картриджі/Поди" } }),
    prisma.category.create({ data: { name: "Рідини" } }),
  ]);

  // Товари
  const products = [
    { name: "Elfbar 1500", sku: "ELFBAR-1500", price: 440, stock: 10, category: 0 },
    { name: "Elfbar 2000", sku: "ELFBAR-2000", price: 550, stock: 10, category: 0 },
    { name: "Elfbar 18000", sku: "ELFBAR-18000", price: 900, stock: 10, category: 0 },
    { name: "Elfbar 23000", sku: "ELFBAR-23000", price: 950, stock: 10, category: 0 },
    { name: "Elfbar 25000", sku: "ELFBAR-25000", price: 999, stock: 10, category: 0 },
    { name: "Elfbar combo 25000", sku: "ELFBAR-COMBO-25000", price: 999, stock: 10, category: 0 },
    { name: "Elfbar Planet 25000", sku: "ELFBAR-PLANET-25000", price: 999, stock: 10, category: 0 },
    { name: "Elfbar Ice King 30000", sku: "ELFBAR-ICE-KING-30000", price: 1200, stock: 10, category: 0 },
    { name: "Elfbar Nic King 30000", sku: "ELFBAR-NIC-KING-30000", price: 1200, stock: 10, category: 0 },
    { name: "Elfbar Sour/Sweet King 30000", sku: "ELFBAR-SOUR-SWEET-30000", price: 1200, stock: 10, category: 0 },
    { name: "Elfbar 33000", sku: "ELFBAR-33000", price: 1200, stock: 10, category: 0 },
    { name: "Elfbar 40000", sku: "ELFBAR-40000", price: 1250, stock: 10, category: 0 },
    { name: "Elfbar 45000", sku: "ELFBAR-45000", price: 1350, stock: 10, category: 0 },
    { name: "Flona 12000", sku: "FLONA-12000", price: 900, stock: 10, category: 0 },
    { name: "Vaporesso xros 3mini", sku: "VAPORESSO-XROS-3MINI", price: 700, stock: 10, category: 1 },
    { name: "Vaporesso xros 4mini", sku: "VAPORESSO-XROS-4MINI", price: 800, stock: 10, category: 1 },
    { name: "Vaporesso xros 5mini", sku: "VAPORESSO-XROS-5MINI", price: 900, stock: 10, category: 1 },
    { name: "Vaporesso xros pro 2", sku: "VAPORESSO-XROS-PRO2", price: 1200, stock: 10, category: 1 },
    { name: "Vaporesso xros 5", sku: "VAPORESSO-XROS-5", price: 1100, stock: 10, category: 1 },
    { name: "Oxvo xlim pro 2", sku: "OXVO-XLIM-PRO2", price: 1100, stock: 10, category: 1 },
    { name: "Elfbar Elfx mini", sku: "ELFBAR-ELFX-MINI", price: 600, stock: 10, category: 1 },
    { name: "RF pod", sku: "RF-POD", price: 140, stock: 20, category: 2 },
    { name: "Vaporesso xros pod", sku: "VAPORESSO-POD", price: 140, stock: 20, category: 2 },
    { name: "Oxvo xlim pod", sku: "OXVO-POD", price: 140, stock: 20, category: 2 },
    { name: "Voopoo Vmate pod", sku: "VOOPOO-VMATE-POD", price: 140, stock: 20, category: 2 },
    { name: "Voopoo Argus pod", sku: "VOOPOO-ARGUS-POD", price: 140, stock: 20, category: 2 },
    { name: "Voopoo Vinci pod", sku: "VOOPOO-VINCI-POD", price: 140, stock: 20, category: 2 },
    { name: "Lost vape Ursa pod", sku: "LOSTVAPE-URSA-POD", price: 140, stock: 20, category: 2 },
    { name: "Elfbar Elfx pod", sku: "ELFBAR-ELFX-POD", price: 140, stock: 20, category: 2 },
    { name: "Geek Vape pod", sku: "GEEKVAPE-POD", price: 140, stock: 20, category: 2 },
    { name: "Chaser 10 мл самозаміс", sku: "CHASER-10ML", price: 170, stock: 15, category: 3 },
    { name: "Elfliq 10 мл", sku: "ELFLIQ-10ML", price: 230, stock: 15, category: 3 },
    { name: "Elix 10 мл", sku: "ELIX-10ML", price: 190, stock: 15, category: 3 },
    { name: "Lucky 15 мл", sku: "LUCKY-15ML", price: 250, stock: 15, category: 3 },
    { name: "Chaser 30 мл самозаміс", sku: "CHASER-30ML", price: 370, stock: 15, category: 3 },
    { name: "Elfliq 30 мл", sku: "ELFLIQ-30ML", price: 450, stock: 15, category: 3 },
    { name: "Elix 30 мл", sku: "ELIX-30ML", price: 390, stock: 15, category: 3 },
    { name: "Lucky 30 мл", sku: "LUCKY-30ML", price: 390, stock: 15, category: 3 },
    { name: "In bottle 30 мл", sku: "INBOTTLE-30ML", price: 390, stock: 15, category: 3 },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        minStock: 5,
        categoryId: categories[p.category].id,
      },
    });
  }

  console.log(`✔ Додано ${products.length} товарів`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });