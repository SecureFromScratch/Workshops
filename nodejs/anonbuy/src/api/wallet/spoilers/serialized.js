import { Prisma } from '@prisma/client';

async function transferAll({ from, to }, maxRetries = 3) {
   for (let attempt = 1; attempt <= maxRetries; ++attempt) {
      try {
        transferAllAux({ from, to });
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
    }
    // BELOW IS THE ONLY CHANGE TO THE TRANSACTION
    , { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
