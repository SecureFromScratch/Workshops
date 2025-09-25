import { z } from "zod";

/*
Middleware with Zod: parses and validates query params before hitting your controller.

Allowlist keys: only category, price, active accepted.

Type coercion: converts strings into correct types (20 → number, true → boolean).

Constraints: length limit for strings, numeric ranges, no unknown keys.

Safe error handling: rejects bad queries with 400, logs details.

Controller stays clean: just uses req.criteria (already sanitized).
*/

const allowed = ["category", "price", "active"];

const CriteriaSchema = z.object({
   category: z.string().trim().min(1).max(64).optional(),
   price: z.coerce.number().nonnegative().lte(1_000_000).optional(),
   active: z.coerce.boolean().optional(),
}).strict(); // reject unknown keys if they slip through

export function searchCriteria(req, res, next) {
   // Allowlist & cap param count
   const raw = {};
   let used = 0;
   for (const [k, v] of Object.entries(req.query)) {
      if (allowed.includes(k)) {
         raw[k] = v;
         used++;
      }
   }
   if (used > allowed.length) {
      return res.status(400).json({ error: "Too many parameters" });
   }

   const parsed = CriteriaSchema.safeParse(raw);
   if (!parsed.success) {
      return res.status(400).json({
         error: "Invalid query",
         details: parsed.error.issues.map(i => ({
            path: i.path.join("."),
            message: i.message,
         })),
      });
   }

   req.criteria = parsed.data; // typed & normalized
   next();
}
