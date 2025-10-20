import { prisma, Prisma } from "../../../prisma.js";

export async function transferAll({ from, to }, maxRetries = 3) {
   for (let attempt = 1; attempt <= maxRetries; ++attempt) {
      try {
        const result = await transferAllAux({ from, to });
        return result; // end retry
      }
      catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError 
            && e.code === "P2034") {
            continue; // safe to retry
        } else {
            throw e;
        }
      }
   }
   throw new Error("retry limit reached");
}

// TRANSACTION IS MOVED TO AN AUXILIARY METHOD
// SO IT CAN BE RETRIED IS COMMIT THROWS AN EXCEPTION
async function transferAllAux({ from, to }) {
   return prisma.$transaction(async (tx) => {
      const fromWallet = await prisma.wallet.findUnique({ where: { code: from } });
      if (!fromWallet) {
         throw new BusinessError("Wallet to withdraw from not found");
      }

      const transferAmount = fromWallet.balance;
      if (transferAmount <= 0) {
         throw new BusinessError("Wallet to withdraw from doesn't have any funds");
      }

      const result = await prisma.wallet.update({
         where: { code: to }, 
         data: { balance: { increment: transferAmount } },
      });
  
      await prisma.wallet.update({
         where: { code: from }, 
         data: { balance: 0 }
      });
    }
    // BELOW IS THE ONLY CHANGE TO THE TRANSACTION
    , { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
