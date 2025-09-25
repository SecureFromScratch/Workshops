import { z } from "zod";

const BuySchema = z.object({
  itemId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(100),
  idempotencyKey: z.string().trim().min(8).max(128).optional()
}).strict();

export function validateBuy(req, res, next) {
  const parsed = BuySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid body",
      details: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))
    });
  }
  req.buy = parsed.data;
  next();
}
