import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fillWallet(code, balance) {
  await prisma.wallet.upsert({
    where: { code },
    update: { balance },                       // nothing to update on re-run
    create: { code, balance },
  });
}

async function addItem({ name, category, price, fileName, mimeType, active }) {
  await prisma.item.upsert({
    where: { name },
    update: { price, active, filePath: fileName },                       // nothing to update on re-run
    create: { name, category, price, fileName, filePath: fileName, mimeType, active },
  });
}

async function main() {
  addItem({ name: "Flat Earth Map Lamp", category: "electricity", price: 20, fileName: "lamp.png", mimeType: "image/png", active: true });
  addItem({ name: "Romeo & Juliet - Free Masons Edition", category: "books", price: 15, fileName: "romeo.png", mimeType: "image/png", active: true });
  addItem({ name: "The secret plan of AI", category: "books", fileName: "i_robot.png", mimeType: "image/png", price: 25, active: true });
  addItem({ name: "Flat Earth 3d Model", category: "model", fileName: "flatearth.png", mimeType: "image/png", price: 25, active: true });
  addItem({ name: "Lizard Man Figurine", category: "model", fileName: "lizard.png", mimeType: "image/png", price: 25, active: true });
  addItem({ name: "Moon-landing Is Fake Poster", category: "poster", fileName: "moonlanding.png", mimeType: "image/png", price: 25, active: true });

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

  await fillWallet('demo', 32);
  await fillWallet('demo1', 1);
  await fillWallet('demo2', 2);
  await fillWallet('demo3', 4);
  await fillWallet('demo4', 8);
  await fillWallet('demo5', 16);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjk1NjQzLCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjIzNTM0NTc1MzQ2IiwiQW1vdW50IjoiNjAifQ.0qSQKk8Q4qChaT2GXF3djiDJrT85UD2e4k-MrkFBL1U', 60);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjk1NzcxLCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjIzNTM0NTc1MzQ5IiwiQW1vdW50IjoiMjAifQ.xmqcNOtkjlvhOzsFo0uC20HFzNy6gk4gjreVRL1ADCk', 20);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjk1ODEwLCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjIzNTM0NTcxMiIsIkFtb3VudCI6IjIwIn0.EdvLQAbjxYHzilw3xRw4UrsGbQtcY9bOG-kqY9Iu8HM', 20);
  await fillWallet('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBbm9uQnV5IiwiaWF0IjoxNzYwNjAzNjk3LCJleHAiOjE3OTIxMzk2OTcsImF1ZCI6Ind3dy5hbm9uYnV5LmNvbSIsInN1YiI6IjEiLCJBbW91bnQiOiIxMDAifQ.D1_Og4K8li6iTB2juwteUT94Mm7f-rkZnaxJBhODvdE', 100);
}
main().finally(() => prisma.$disconnect());
