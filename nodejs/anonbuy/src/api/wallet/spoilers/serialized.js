import { Prisma } from '@prisma/client';

async function transferAllOptimistic({ from, to }, maxRetries = 3) {
   for (let attempt = 1; attempt <= maxRetries; ++attempt) {
      try {
         return await prisma.$transaction(async (tx) => {
            // 1) Read current balance (no lock)
            const w = await tx.wallet.findUnique({
               where: { code: from },
               select: { balance: true }
            });
            if (!w || w.balance.lte(0)) throw new Error("no funds");

            const amount = w.balance as Prisma.Decimal; // Decimal(8,2) exact, equality OK

            // 2) Conditional debit (compare-and-swap)
            const debit = await tx.wallet.updateMany({
               where: { code: from, balance: amount }, // only if unchanged
               data:  { balance: new Prisma.Decimal(0) }
            });
            if (debit.count !== 1) throw new Error("conflict"); // someone changed it → retry

            // 3) Credit destination using the exact amount we debited
            await tx.wallet.update({
               where: { code: to },
               data:  { balance: { increment: amount } }
            });

            // optional: insert ledger row here
            return { ok: true, amount: amount.toString() };
         });
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
