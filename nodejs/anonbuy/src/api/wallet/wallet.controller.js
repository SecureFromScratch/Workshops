import * as svc from "./wallet.service.js";
import { BusinessError } from "../../prisma.js";

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

  try {
    const wallet = await svc.transferAll({ from, to });
    res.status(200).json({
      balance: parseInt(wallet.balance)
    });
  }
  catch (err) {
    if (err instanceof BusinessError) {
      res.status(400).json({ message: err.message });
    }
    else {
      throw err;
    }
  }
}
