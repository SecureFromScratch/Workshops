      await prisma.wallet.update({
         where: { code: from }, 
         data: { balance: 0 }
      });
