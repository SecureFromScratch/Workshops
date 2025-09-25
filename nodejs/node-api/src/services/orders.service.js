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

    try {
      return await tx.couponRedemption.create({
        data: { userId, couponId: coupon.id }
      });
    } catch (e) {
      // P2002 = unique violation (already redeemed)
      if (e.code === "P2002") throw new Error("Already used");
      throw e;
    }
  });
}


