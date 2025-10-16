import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getOrder({ idempotencyKey }) {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey }, include: { lines: true } });
    return existing;
}

export async function setOrder({ lines, idempotencyKey, buyerIp }) {
  return prisma.$transaction(async (tx) => {
      // 1) Validate all items in ONE query
      const itemIds = [...new Set(lines.map(l => l.itemId))];
      const items = await tx.item.findMany({
         where: { id: { in: itemIds }, active: true },
         select: { id: true, price: true }
      });
      if (items.length !== itemIds.length) {
         throw new Error("One or more items not found or inactive");
      }
      const priceById = new Map(items.map(i => [i.id, i.price]));

      // 2) Build line payload with computed prices
      const lineData = lines.map(({ itemId, quantity }) => {
         if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity for item ${itemId}`);
         }
         const unitPrice = priceById.get(itemId); // Decimal or number depending on schema
         const totalPrice = Prisma.Decimal
            ? new Prisma.Decimal(unitPrice).mul(quantity)
            : unitPrice * quantity;
         return { itemId, quantity, unitPrice, totalPrice };
      });

      // 3) Create new or reset existing-by-idempotency
      const existing = idempotencyKey
         ? await tx.order.findUnique({ where: { idempotencyKey } })
         : null;

      if (existing) {
         // reset lines
         return tx.order.update({
            where: { id: existing.id },
            data: {
               status: "PENDING",
               buyerIp: buyerIp ?? existing.buyerIp ?? null,
               lines: {
                  deleteMany: {},            // delete all prior lines
                  create: lineData
               }
            },
            include: { lines: true }
         });
      }

      // create new
      return tx.order.create({
         data: {
            status: "PENDING",
            idempotencyKey: idempotencyKey ?? null,
            buyerIp: buyerIp ?? null,
            lines: { create: lineData }
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


