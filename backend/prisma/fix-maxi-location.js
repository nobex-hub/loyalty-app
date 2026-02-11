const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany({ where: { name: 'Maxi', location: null } });
  for (const store of stores) {
    await prisma.store.update({ where: { id: store.id }, data: { location: 'Subotica' } });
    console.log(`Updated Maxi (${store.fiscalId}) -> Subotica`);
  }
  console.log(`Done. Updated ${stores.length} store(s).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
