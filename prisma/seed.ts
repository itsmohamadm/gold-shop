import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'انگشتر طلای کلاسیک',
        weight: 3.2,
        karat: 18,
        laborPercent: 20,
        profitPercent: 7,
        taxPercent: 10,
        stock: 5,
      },
      {
        name: 'گردنبند طلای ظریف',
        weight: 8.5,
        karat: 18,
        laborPercent: 20,
        profitPercent: 7,
        taxPercent: 10,
        stock: 3,
      },
    ],
  });

  console.log('Products seeded successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });