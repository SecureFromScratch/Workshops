const debit = await tx.wallet.updateMany({
    where: { code: from, balance: { gte: amount } },
    data: { balance: { decrement: amount } },
});
if (debit.count !== 1) throw new Error("Insufficient funds");
await tx.wallet.update(
    { where: { code: to }, 
    data: { balance: { increment: amount } } 
});
