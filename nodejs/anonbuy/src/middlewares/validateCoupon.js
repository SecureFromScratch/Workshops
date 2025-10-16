import { z } from "zod";
const Schema = z.object({
  userId: z.coerce.number().int().positive(),
  code: z.string().trim().min(3).max(64)
}).strict();

export function validateCoupon(req, res, next) {
  const p = Schema.safeParse(req.body ?? {});
  if (!p.success) {
    return res.status(400).json({
      error: "Invalid body",
      details: p.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))
    });
  }
  req.couponReq = p.data;
  next();
}
