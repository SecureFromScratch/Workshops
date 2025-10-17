import * as svc from "./wallet.service.js";

export async function balance(req, res) {
  const { code } = req.params;
  if (!code) {
      res.status(400).json({ error: "Not a valid wallet"});
  }

  const wallet = await svc.getWallet({ code });
  if (!wallet) { 
      res.status(400).json({ error: "Not a valid wallet"});
      return;
  }

  res.status(200).json({
    balance: parseInt(wallet.balance)
  });
}

export async function withdraw(req, res) {
  const { from, to } = req.body;
  if (!from || !to) {
      res.status(400).json({ error: "Not valid wallets"});
  }
  if (from === to) {
      res.status(400).json({ error: "Cannot withdraw from same wallet"});
  }

  const wallet = await svc.transferEverything({ from, to });
  if (wallet.error) {
    res.status(400).json({ message: wallet.error });
  }
  else {
    res.status(200).json({
      balance: parseInt(wallet.balance)
    });
  }
}
