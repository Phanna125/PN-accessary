import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (
    process.env.SEED_ADMIN_EMAIL ??
    process.env.ADMIN_EMAIL ??
    'phanna38254@gmail.com'
  )
    .trim()
    .toLowerCase();
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? 'Phanna8$';

  const customerEmail =
    process.env.SEED_CUSTOMER_EMAIL ?? 'customer@store.local';
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD ?? 'Customer12345!';

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const customerPasswordHash = await bcrypt.hash(customerPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, passwordHash: adminPasswordHash },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: { role: Role.CUSTOMER, passwordHash: customerPasswordHash },
    create: {
      email: customerEmail,
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const categoryNames = ['Mouse', 'Keyboard', 'Monitor'];
  const categories = new Map<string, { id: string; name: string }>();

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.set(name, category);
  }

  const products = [
    {
      title: 'Logitech Mouse M90',
      description: 'Wired USB mouse',
      priceCents: 599,
      sku: 'M90-001',
      stock: 50,
      imageUrl: 'https://example.com/mouse.png',
      categoryName: 'Mouse',
    },
    {
      title: 'Mechanical Keyboard K120',
      description: 'Compact mechanical keyboard',
      priceCents: 2999,
      sku: 'K120-001',
      stock: 30,
      imageUrl: 'https://example.com/keyboard.png',
      categoryName: 'Keyboard',
    },
    {
      title: '24-inch Monitor FHD',
      description: '1080p IPS display',
      priceCents: 12999,
      sku: 'MON-24FHD',
      stock: 15,
      imageUrl: 'https://example.com/monitor.png',
      categoryName: 'Monitor',
    },
  ];

  for (const product of products) {
    const category = categories.get(product.categoryName);
    if (!category) continue;

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        title: product.title,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: true,
        category: { connect: { id: category.id } },
      },
      create: {
        title: product.title,
        description: product.description,
        priceCents: product.priceCents,
        sku: product.sku,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: true,
        category: { connect: { id: category.id } },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    admin: { email: admin.email, password: adminPassword },
    customer: { email: customer.email, password: customerPassword },
  });
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
