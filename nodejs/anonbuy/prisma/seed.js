import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fillWallet(code, balance) {
  await prisma.wallet.upsert({
    where: { code },
    update: {},                       // nothing to update on re-run
    create: { code, balance },
  });

}
async function main() {
  await prisma.item.deleteMany({ where: { active: true } });

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

  await fillWallet('demo', 40);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjk1NjQzLCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjIzNTM0NTc1MzQ2IiwiQW1vdW50IjoiNjAifQ.0qSQKk8Q4qChaT2GXF3djiDJrT85UD2e4k-MrkFBL1U', 60);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjk1NzcxLCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjIzNTM0NTc1MzQ5IiwiQW1vdW50IjoiMjAifQ.xmqcNOtkjlvhOzsFo0uC20HFzNy6gk4gjreVRL1ADCk', 20);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjk1ODEwLCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjIzNTM0NTcxMiIsIkFtb3VudCI6IjIwIn0.EdvLQAbjxYHzilw3xRw4UrsGbQtcY9bOG-kqY9Iu8HM', 20);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjAzNjk3LCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjEiLCJBbW91bnQiOiIxMDAifQ.D1_Og4K8li6iTB2juwteUT94Mm7f-rkZnaxJBhODvdE', 100);
}
main().finally(() => prisma.$disconnect());
