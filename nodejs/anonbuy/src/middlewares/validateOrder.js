import { z } from "zod";

export const OrderLineSchema = z.object({
  itemId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(100),
}).strict();

export const OrderSchema = z.object({
   lines: z.array(OrderLineSchema).min(0),
   idempotencyKey: z.string().trim().min(8).max(128).optional()
}).strict();

export function validateSetOrder(req, res, next) {
  const parsed = OrderSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid body",
      details: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))
    });
  }
  res.locals.data = parsed.data;
  next();
}
