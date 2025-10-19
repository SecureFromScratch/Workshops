// move full balance with pessimistic lock
await prisma.$transaction(async (tx) => {
   const [src] = await tx.$queryRaw<
      { id: number; code: string; balance: any }[]
   >`SELECT id, code, balance FROM "Wallet" WHERE code = ${from} FOR UPDATE`;

   if (!src || Number(src.balance) <= 0) throw new Error("no funds");

   await tx.wallet.update({
      where: { code: to },
      data: { balance: { increment: src.balance } },
   });

   await tx.wallet.update({
      where: { code: from },
      data: { balance: 0 },
   });
});
