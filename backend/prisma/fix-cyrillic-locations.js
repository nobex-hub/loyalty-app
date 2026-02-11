/**
 * One-time script to fix existing Cyrillic store locations in the database.
 * Run with: node prisma/fix-cyrillic-locations.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cyrillicToLatin = {
  'Белград': 'Beograd', 'Нови Сад': 'Novi Sad', 'Ниш': 'Niš',
  'Суботица': 'Subotica', 'Крагујевац': 'Kragujevac', 'Зрењанин': 'Zrenjanin',
  'Панчево': 'Pančevo', 'Чачак': 'Čačak', 'Нови Пазар': 'Novi Pazar',
  'Краљево': 'Kraljevo', 'Смедерево': 'Smederevo', 'Лесковац': 'Leskovac',
  'Ужице': 'Užice', 'Ваљево': 'Valjevo', 'Крушевац': 'Kruševac',
  'Врање': 'Vranje', 'Шабац': 'Šabac', 'Сомбор': 'Sombor',
  'Пожаревац': 'Požarevac', 'Пирот': 'Pirot', 'Зајечар': 'Zaječar',
  'Кикинда': 'Kikinda', 'Сремска Митровица': 'Sremska Mitrovica',
  'Јагодина': 'Jagodina', 'Вршац': 'Vršac', 'Бор': 'Bor',
  'Прокупље': 'Prokuplje', 'Лозница': 'Loznica', 'Кањижа': 'Kanjiža',
  'Сента': 'Senta', 'Ада': 'Ada', 'Бачка Топола': 'Bačka Topola',
};

async function main() {
  const stores = await prisma.store.findMany();
  let updated = 0;

  for (const store of stores) {
    if (store.location && cyrillicToLatin[store.location]) {
      const latinName = cyrillicToLatin[store.location];
      await prisma.store.update({
        where: { id: store.id },
        data: { location: latinName },
      });
      console.log(`Fixed: "${store.name}" location "${store.location}" -> "${latinName}"`);
      updated++;
    }
  }

  console.log(`\nDone. Updated ${updated} store(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
