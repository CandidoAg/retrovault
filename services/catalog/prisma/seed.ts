import { PrismaClient } from '../src/infrastructure/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const initialProducts = [
    { name: 'Metroid Dread', price: 59.99, stock: 1000, year: 2021, brand: 'Nintendo' },
    { name: 'Castlevania: SoTN', price: 45.00, stock: 1000, year: 1997, brand: 'Konami' },
    { name: 'Zelda: Ocarina', price: 60.00, stock: 1000, year: 1998, brand: 'Nintendo' },
    { name: 'Sonic Frontiers', price: 40.00, stock: 1000, year: 2022, brand: 'Sega' },
    { name: 'Final Fantasy VII', price: 30.00, stock: 1000, year: 1997, brand: 'Square Enix' },
  ];

  for (const product of initialProducts) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {}, 
      create: product,
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });