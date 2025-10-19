import * as svc from "./orders.service.js";

export async function currentOrder(req, res) {
  const { walletCode } = req.params;
  if (!walletCode) {
      res.status(200).json({ });
      return;
  }

  const order = await svc.getOrder({ walletCode });
  if (!order) { 
      res.status(200).json({ });
      return;
  }

  res.status(200).json({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    lines: order.lines.map(({ itemId, quantity, unitPrice, totalPrice }) => ({
      itemId,
      quantity,
      unitPrice,
      totalPrice
    })),
    coupons: order.coupons.map(
      ({ id, orderId, couponId, couponCode, percent }) => 
      ({ id ,orderId, couponId, couponCode, percent })
    )
  });
}

// lines: Array<{ itemId: number, quantity: number }>
// order-level fields: { idempotencyKey?: string, buyerIp?: string }
export async function setOrder(req, res) {
  const { lines, walletCode } = res.locals.data;
  const buyerIp = (req.ip || req.socket?.remoteAddress || "").replace(/^::ffff:/, "");

  if (!Array.isArray(lines)) {
      throw new Error("lines must be an array");
  }

  const order = await svc.setOrder({ lines, walletCode, buyerIp });
  res.status(201).json({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    lines: order.lines.map(({ itemId, quantity, unitPrice, totalPrice }) => ({
      itemId,
      quantity,
      unitPrice,
      totalPrice
    })),
    coupons: order.coupons.map(
      ({ id, orderId, couponId, couponCode, percent }) => 
      ({ id ,orderId, couponId, couponCode, percent })
    )
  });
}

export async function redeemCoupon(req, res) {
  // THERE'S A VULNERABILITY HERE - CAN YOU FIND IT?
  const { walletCode, code } = res.locals.couponReq;
  const r = await svc.redeemCoupon({ walletCode, couponCode: code });
  if (r.error) {
    res.status(400).json({ message: r.error });
  }
  else {
    res.status(201).json({ 
      id: r.id, couponCode: code, couponId: r.couponId, percent: r.percent });
  }
}

export async function removeCoupon(req, res) {
  const { walletCode, couponId } = res.locals.couponReq;
  const r = await svc.removeCoupon({ walletCode, couponId });
  console.log(r);
  if (r.error) {
    res.status(400).json({ message: r.error });
  }
  else {
    res.status(200).json({ });
  }
}
