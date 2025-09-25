import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.item.createMany({
    data: [
      { name: "Lamp", category: "electricity", price: 20, active: true },
      { name: "Book A", category: "books",       price: 15, active: true },
      { name: "Book B", category: "books",       price: 25, active: false }
    ],
    skipDuplicates: true
  });

  await prisma.coupon.upsert({
  where: { code: 'SAVE10' },
  update: {},                       // nothing to update on re-run
  create: { code: 'SAVE10', active: true },
});

}
main().finally(() => prisma.$disconnect());


