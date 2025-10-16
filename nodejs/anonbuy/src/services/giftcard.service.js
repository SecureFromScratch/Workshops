import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function redeemGiftCard({ code }) {
   return prisma.$transaction(async (tx) => {
      const card = await tx.giftCards.findUnique({
         where: { cardCode: code },
         select: { id: true, amount: true, redeemedBy: true }
      });

      if (!card) return -1;

      if (card.redeemedBy == null) {
         // simple new user id (no Users table): next integer after current max
         const agg = await tx.wallet.aggregate({ _max: { userId: true } });
         const userId = (agg._max.userId ?? 0) + 1;

         await tx.wallet.create({
            data: {
               userId,
               balance: new Prisma.Decimal(card.amount) // Decimal expects string/Decimal
            }
         });

         await tx.giftCards.update({
            where: { id: card.id },
            data: { redeemedBy: userId }
         });

         return userId;
      }

      return card.redeemedBy;
   });
}

export async function getWallet({ userId }) {
    const existing = await prisma.wallet.findMany({ where: { userId } });
    return existing && existing[0];
}

