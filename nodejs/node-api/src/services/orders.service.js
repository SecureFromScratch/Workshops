import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createOrder({ itemId, quantity, idempotencyKey, buyerIp }) {
  if (idempotencyKey) {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
    if (existing) return existing;
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findFirst({ where: { id: itemId, active: true } });
    if (!item) throw new Error("Item not found or inactive");

    const unitPrice = item.price;
    const totalPrice = unitPrice * quantity;

    return tx.order.create({
      data: {
        status: "PAID",
        idempotencyKey: idempotencyKey ?? null,
        buyerIp: buyerIp ?? null,
        lines: {
          create: [
            { itemId, quantity, unitPrice, totalPrice }
          ]
        }
      },
      include: { lines: true }
    });
  });
}

export async function redeemCoupon({ userId, code }) {
  return prisma.$transaction(async (tx) => {
    const coupon = await tx.coupon.findFirst({ where: { code, active: true } });
    if (!coupon) throw new Error("Coupon invalid");

    const used = await tx.couponRedemption.findFirst({
      where: { userId, couponId: coupon.id }
    });
    if (used) throw new Error("Already used");

    // widen race window
    await new Promise(r => setTimeout(r, 300));

    return tx.couponRedemption.create({
      data: { userId, couponId: coupon.id }
    });
  });
}


