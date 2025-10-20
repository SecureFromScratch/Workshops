import { prisma, Prisma, BusinessError } from "../../../prisma.js";

export async function transferAll({ from, to }, maxRetries = 3) {
   for (let attempt = 1; attempt <= maxRetries; ++attempt) {
      try {
        const result = await transferAllAux({ from, to });
        return result; // end retry
      }
      catch (e) {
        if (e.message === "conflict") {
            continue; // safe to retry
        } else {
            throw e;
        }
      }
   }
   throw new Error("retry limit reached");
}

async function transferAllAux({ from, to }) {
  return await prisma.$transaction(async (tx) => {
    const fromWallet = await prisma.wallet.findUnique({ where: { code: from } });
    if (!fromWallet) {
      throw new BusinessError("Wallet to withdraw from not found");
    }

    const transferAmount = fromWallet.balance;
    if (transferAmount <= 0) {
      throw new BusinessError("Wallet to withdraw from doesn't have any funds");
    }

    // THIS IS THE BIG CHANGE
    // Conditional debit (compare-and-swap)
    const debit = await tx.wallet.updateMany({
        where: { code: from, balance: transferAmount }, // only if unchanged
        data:  { balance: { decrement: transferAmount } }
    });
    if (debit.count !== 1) throw new Error("conflict"); // someone changed it → retry

    const result = await prisma.wallet.update({
      where: { code: to }, 
      data: { balance: { increment: transferAmount } },
    });

    return result;
  });
}
