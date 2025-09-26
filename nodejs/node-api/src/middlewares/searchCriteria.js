import { z } from "zod";

const CRITERIA_KEYS = new Set(["category", "price", "active"]);
const PASS_THROUGH = new Set(["page", "pageSize"]); // allowed but handled elsewhere

const CriteriaSchema = z.object({
  category: z.string().trim().min(1).max(64).optional(),
  price: z.coerce.number().nonnegative().lte(1_000_000).optional(),
  active: z.coerce.boolean().optional(),
}).strict();

function findDuplicateCriteriaParam(req) {
  const base = `http://${req.headers.host || "localhost"}`;
  const url = new URL(req.originalUrl || req.url, base);
  const seen = new Map();
  for (const [k] of url.searchParams) {
    if (!CRITERIA_KEYS.has(k)) continue;
    const n = (seen.get(k) ?? 0) + 1;
    if (n > 1) return k;
    seen.set(k, n);
  }
  return null;
}

export function searchCriteria(req, res, next) {
  try {
    // Unknown keys → 400 (allow page/pageSize to pass through)
    for (const k of Object.keys(req.query)) {
      if (CRITERIA_KEYS.has(k) || PASS_THROUGH.has(k)) continue;
      return res.status(400).json({ error: `Unknown parameter "${k}"` });
    }

    // Duplicate criteria keys → 400 (parser-agnostic)
    const dup = findDuplicateCriteriaParam(req);
    if (dup) return res.status(400).json({ error: `Duplicate parameter "${dup}" not allowed` });

    // Build criteria from single values only
    const raw = Object.create(null);
    for (const [k, v] of Object.entries(req.query)) {
      if (!CRITERIA_KEYS.has(k)) continue;
      if (Array.isArray(v)) return res.status(400).json({ error: `Duplicate parameter "${k}" not allowed` });
      raw[k] = v;
    }

    // Validate criteria
    const parsed = CriteriaSchema.safeParse(raw);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid query",
        details: parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message })),
      });
    }

    req.criteria = parsed.data;     // ✅ only criteria
    return next();                  // 🚫 do NOT set req.pagination here
  } catch (e) {
    return res.status(400).json({ error: e?.message ?? "Bad request" });
  }
}
