import { prisma, Prisma } from "../../prisma.js";

export async function getWallet({ code }) {
   const existing = await prisma.wallet.findUnique({ where: { code } });
   return existing;
}

export async function transferEverything({ from, to }) {
   return prisma.$transaction(async (tx) => {
      const fromWallet = await prisma.wallet.findUnique({ where: { code: from } });
      if (!fromWallet) {
         return { error: "Wallet to withdraw from not found" };
      }

      const transferAmount = fromWallet.balance;
      if (transferAmount <= 0) {
         return { error: "Wallet to withdraw from doesn't have any funds" };
      }

      const result = await prisma.wallet.update({
         where: { code: to }, 
         data: { balance: { increment: transferAmount } },
      });

      await prisma.wallet.update({
         where: { code: from }, 
         data: { balance: 0 }
      });

      return result;
   });
}
