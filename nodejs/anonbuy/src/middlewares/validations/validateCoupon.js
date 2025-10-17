import { z } from "zod";
const RedeemSchema = z.object({
  walletCode: z.string().trim().min(1).max(256),
  code: z.string().trim().min(3).max(64)
}).strict();

const RemoveSchema = z.object({
  walletCode: z.string().trim().min(1).max(256),
  couponId: z.coerce.number().int().min(1)
}).strict();

export function validateCouponRedeem(req, res, next) {
  const p = RedeemSchema.safeParse(req.body ?? {});
  if (!p.success) {
    return res.status(400).json({
      error: "Invalid body",
      details: p.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))
    });
  }
  req.couponReq = p.data;
  next();
}

export function validateCouponRemove(req, res, next) {
  const p = RemoveSchema.safeParse(req.body ?? {});
  if (!p.success) {
    return res.status(400).json({
      error: "Invalid body",
      details: p.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))
    });
  }
  req.couponReq = p.data;
  next();
}
