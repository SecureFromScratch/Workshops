// src/middlewares/pagination.js
import { z } from "zod";
import { PAGINATION } from "../config/pagination.js"; // { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE, MAX_PAGE_SIZE }

// Parser-agnostic duplicate check for page/pageSize
function findDup(req) {
    const base = `http://${req.headers.host || "localhost"}`;
    const url = new URL(req.originalUrl || req.url, base);
    const seen = new Map();
    for (const [k] of url.searchParams) {
        if (k !== "page" && k !== "pageSize") continue;
        const n = (seen.get(k) ?? 0) + 1;
        if (n > 1) return k;
        seen.set(k, n);
    }
    return null;
}

const PaginationSchema = z.object({
    page: z.coerce.number().int()
        .min(PAGINATION.DEFAULT_PAGE, { message: "page must be >= 1" })
        .max(PAGINATION.MAX_PAGE, { message: `page must be <= ${PAGINATION.MAX_PAGE}` })
        .default(PAGINATION.DEFAULT_PAGE),
    pageSize: z.coerce.number().int()
        .min(1, { message: "pageSize must be >= 1" })
        .max(PAGINATION.MAX_PAGE_SIZE, { message: `pageSize must be <= ${PAGINATION.MAX_PAGE_SIZE}` })
        .default(PAGINATION.DEFAULT_PAGE_SIZE),
});

export function applyPagination(req, res, next) {
    const dup = findDup(req);
    if (dup) return res.status(400).json({ error: `Duplicate parameter "${dup}" not allowed` });


    const parsed = PaginationSchema.safeParse({
        page: req.query.page,
        pageSize: req.query.pageSize,
    });
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid pagination",
            details: parsed.error.issues.map(i => ({
                path: i.path.join("."),
                message: i.message,
            })),
        });
    }



    const { page, pageSize } = parsed.data;
    req.pagination = {
        page,
        pageSize,
        limit: pageSize,
        offset: (page - 1) * pageSize,   //  always a number (0 when page=1)
    };


    next();
}
