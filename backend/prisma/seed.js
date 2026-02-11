const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@loyalty.com' },
    update: {},
    create: {
      email: 'admin@loyalty.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      pointsBalance: 0,
    },
  });
  console.log('Admin created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@loyalty.com' },
    update: {},
    create: {
      email: 'test@loyalty.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
      pointsBalance: 100,
    },
  });
  console.log('Test user created:', user.email);

  // Create sample stores
  const stores = [
    { name: 'Maxi', fiscalId: 'MAXI001', location: 'Belgrade' },
    { name: 'Idea', fiscalId: 'IDEA001', location: 'Novi Sad' },
    { name: 'Roda', fiscalId: 'RODA001', location: 'Nis' },
    { name: 'Univerexport', fiscalId: 'UNIV001', location: 'Subotica' },
    { name: 'Lidl', fiscalId: 'LIDL001', location: 'Belgrade' },
  ];

  for (const store of stores) {
    await prisma.store.upsert({
      where: { fiscalId: store.fiscalId },
      update: {},
      create: store,
    });
  }
  console.log('Stores created:', stores.length);

  // Create sample products
  const products = [
    { name: 'Mleko 1L', identifier: 'MLEKO-1L', pointsValue: 5 },
    { name: 'Hleb beli', identifier: 'HLEB-BELI', pointsValue: 3 },
    { name: 'Jogurt 500g', identifier: 'JOGURT-500', pointsValue: 4 },
    { name: 'Coca Cola 2L', identifier: 'COCA-2L', pointsValue: 8 },
    { name: 'Jaja 10kom', identifier: 'JAJA-10', pointsValue: 6 },
    { name: 'Banane 1kg', identifier: 'BANANE-1KG', pointsValue: 5 },
    { name: 'Pilece grudi 1kg', identifier: 'PILETINA-1KG', pointsValue: 15 },
    { name: 'Cokolada Milka 100g', identifier: 'MILKA-100', pointsValue: 7 },
    { name: 'Voda Knjaz 1.5L', identifier: 'KNJAZ-1.5L', pointsValue: 2 },
    { name: 'Kafa Grand 200g', identifier: 'GRAND-200', pointsValue: 10 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { identifier: product.identifier },
      update: {},
      create: { ...product, status: 'KNOWN' },
    });
  }
  console.log('Products created:', products.length);

  console.log('Seeding complete!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@loyalty.com / admin123');
  console.log('  User:  test@loyalty.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
