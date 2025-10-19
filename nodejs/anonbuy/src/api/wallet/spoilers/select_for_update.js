// move full balance with pessimistic lock
export async function transferAll({ from, to }) {
    return prisma.$transaction(async (tx) => {
        // THIS IS THE MAJOR CHANGE - MUST WRITE SQL MANUALLY
        const [fromWallet] = await tx.$queryRaw
        `SELECT id, code, balance FROM "Wallet" WHERE code = ${from} FOR UPDATE`;
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

        await tx.wallet.update({
            where: { code: from },
            data: { balance: { decrement: transferAmount } },
        });

        return result;
    });
}
