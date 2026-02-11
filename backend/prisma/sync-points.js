const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const txns = await prisma.transaction.findMany({
      where: { userId: user.id },
      select: { totalPoints: true },
    });
    const earned = txns.reduce((sum, t) => sum + t.totalPoints, 0);
    console.log(`${user.name}: balance=${user.pointsBalance}, earned=${earned}`);

    if (user.pointsBalance !== earned) {
      await prisma.user.update({
        where: { id: user.id },
        data: { pointsBalance: earned },
      });
      console.log(`  -> Updated balance from ${user.pointsBalance} to ${earned}`);
    }
  }

  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
