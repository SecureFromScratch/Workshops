import * as svc from "./wallet.service.js";

export async function redeem(req, res) {
   const { code } = req.body;
   if (!code) {
      res.status(400).json({ error: "Must include non-empty code"});
      return;
  }

  const userId = await svc.redeemGiftCard({ code });
  if (userId === -1) { 
      res.status(400).json({ error: "Failed to redeem wallet/gift card" });
      return;
  }

  res.status(200).json({ userId, next: "./main.html" });
}

export async function balance(req, res) {
  const userId = parseInt(req.params.userId);
  if (Number.isNaN(userId) || userId <= 0) {
      res.status(400).json({ error: "No current wallet/giftcard wallet. Try going to index.html"});
      return;
  }

  const wallet = await svc.getWallet({ userId });
  if (!wallet) { 
      res.status(400).json({ error: "Not a valid wallet/giftcard wallet. Try going to index.html"});
      return;
  }

  res.status(200).json({
    balance: parseInt(wallet.balance)
  });
}
