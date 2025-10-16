import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.item.createMany({
    data: [
      { name: "Flat Earth Map Lamp", category: "electricity", price: 20, fileName: "lamp.png", mimeType: "image/png", active: true },
      { name: "Romeo & Juliet - Free Masons Edition", category: "books", price: 15, fileName: "romeo.png", mimeType: "image/png", active: true },
      { name: "The secret plan of AI", category: "books", fileName: "i_robot.png", mimeType: "image/png", price: 25, active: true },
      { name: "Flat Earth 3d Model", category: "model", fileName: "flatearth.png", mimeType: "image/png", price: 25, active: true },
      { name: "Lizard Man Figurine", category: "model", fileName: "lizard.png", mimeType: "image/png", price: 25, active: true },
      { name: "Moon-landing Is Fake Poster", category: "poster", fileName: "moonlanding.png", mimeType: "image/png", price: 25, active: true },
    ],
    skipDuplicates: true
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE10' },
    update: { percent: 10}, // ensure correct percentage
    create: { code: 'SAVE10', percent: 10, active: true },
  });

  await prisma.coupon.upsert({
    where: { code: 'FRIENDS' },
    update: {},                       // nothing to update on re-run
    create: { code: 'FRIENDS', percent: 5, active: true },
  });

  await prisma.giftCards.upsert({
    where: { cardCode: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjAzNjk3LCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjEiLCJBbW91bnQiOiIxMDAifQ.D1_Og4K8li6iTB2juwteUT94Mm7f-rkZnaxJBhODvdE' },
    update: {},                       // nothing to update on re-run
    create: { cardCode: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjAzNjk3LCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjEiLCJBbW91bnQiOiIxMDAifQ.D1_Og4K8li6iTB2juwteUT94Mm7f-rkZnaxJBhODvdE', amount: 60 },
  });
  
}
main().finally(() => prisma.$disconnect());
