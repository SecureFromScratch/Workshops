import { prisma, Prisma, BusinessError } from "../../prisma.js";

export async function getOrder({ walletCode }) {
   const existing = await prisma.order.findUnique({ 
      where: { walletCode }, 
      include: { lines: true, coupons: true } 
   });
   return existing;
}

export async function setOrder({ lines, walletCode, buyerIp }) {
   return prisma.$transaction(async (tx) => {
      // 1) Validate all items in ONE query
      const itemIds = [...new Set(lines.map(l => l.itemId))];
      const items = await tx.item.findMany({
         where: { id: { in: itemIds }, active: true },
         select: { id: true, price: true }
      });
      if (items.length !== itemIds.length) {
         throw new BusinessError("One or more items not found or inactive");
      }
      const priceById = new Map(items.map(i => [i.id, i.price]));

      // 2) Build line payload with computed prices
      const lineData = lines.map(({ itemId, quantity }) => {
         if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new BusinessError(`Invalid quantity for item ${itemId}`);
         }
         const unitPrice = priceById.get(itemId); // TODO: Price should have been Decimal, but is currently float. Should fix.
         const totalPrice = unitPrice * quantity;
         if (!(totalPrice > 0)) {
            throw new BusinessError(`Invalid total price for ${itemId}`);
         }
         return { itemId, quantity, unitPrice, totalPrice };
      });

      const existing = await tx.order.findUnique({ where: { walletCode } })

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
            include: { lines: true, coupons: true }
         });
      }

      // create new
      return tx.order.create({
         data: {
            status: "PENDING",
            walletCode: walletCode,
            buyerIp: buyerIp ?? null,
            lines: { create: lineData }
         },
         include: { lines: true, coupons: true }
      });
   });
}

export async function redeemCoupon({ walletCode, couponCode }) {
  return prisma.$transaction(async (tx) => {
    // USING findFirst IS BAD - DO YOU KNOW WHY?
    const coupon = await tx.coupon.findFirst({ where: { code: couponCode, active: true } });
    if (!coupon) throw new BusinessError("Coupon invalid");

    const order = await tx.order.findUnique({ where: { walletCode } });
    if (!order) throw new BusinessError("No current order");

    const used = await tx.couponRedemption.findFirst({
      where: { orderId: order.id, couponId: coupon.id }
    });
    if (used) throw new BusinessError("Already used");

    // widen race window
    await new Promise(r => setTimeout(r, 300));

    return tx.couponRedemption.create({
      data: { couponId: coupon.id, couponCode: coupon.code, orderId: order.id, percent: coupon.percent },
    });
  });
}

export async function removeCoupon({ walletCode, couponId }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { walletCode } });
    if (!order) throw new BusinessError("No current order");

    return tx.couponRedemption.deleteMany({
      where: { orderId: order.id, couponId }
    });
  });
}

