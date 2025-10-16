import * as svc from "../services/orders.service.js";
import { redeemCoupon } from "../services/orders.service.js";

export async function currentOrder(req, res) {
  const { idempotencyKey } = req;
  if (!idempotencyKey) {
      res.status(200).json({ });
      return;
  }

  const order = await svc.getOrder({ idempotencyKey });
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
  });
}

// lines: Array<{ itemId: number, quantity: number }>
// order-level fields: { idempotencyKey?: string, buyerIp?: string }
export async function setOrder(req, res) {
  const { lines, idempotencyKey } = res.locals.data;
  const buyerIp = (req.ip || req.socket?.remoteAddress || "").replace(/^::ffff:/, "");

  if (!Array.isArray(lines)) {
      throw new Error("lines must be an array");
  }

  const order = await svc.setOrder({ lines, idempotencyKey, buyerIp });
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
  });
}

export async function setOrderOld(req, res) {
  const { itemId, quantity, idempotencyKey } = res.locals.data;
  const ip = (req.ip || req.socket?.remoteAddress || "").replace(/^::ffff:/, "");
  const order = await svc.createOrder({ itemId, quantity, idempotencyKey, buyerIp: ip });
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
  });
}

export async function redeem(req, res) {
  const { userId, code } = req.couponReq;
  const r = await redeemCoupon({ userId, code });
  res.status(201).json({ id: r.id, userId, couponId: r.couponId, createdAt: r.createdAt});
}

