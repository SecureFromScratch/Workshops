
# Fixing Uncontrolled Resource Consumption

This tutorial guides you through updating the code to prevent uncontrolled resource consumption by enforcing **validated criteria** and **bounded pagination**.

---

## 1. Update the Route

**File:** `src/routes/items.routes.js`

Replace:

```js
r.get("/search", asyncHandler(ctrl.getByCriteria));
````

With:

```js
r.get("/search", searchCriteria , applyPagination,asyncHandler(ctrl.getByCriteria)); 
```
Take a look at the searchCriteria middleware in 
src/middlewares/searchCriteria.js

Take a look at the pagination middleware in 
src/middlewares/pagination.js


**What this does**

* Validates and normalizes **allowed** query params (category/price/active) and **pagination** (page/pageSize).
* **Rejects** unknown/duplicate params and out-of-range values with **400**.
* Sets **`req.criteria`** and **`req.pagination`** (`limit`/`offset`) before the controller runs.

**Why it matters**

* **Bounds DB work** (always applies LIMIT/OFFSET) and blocks table-wide scans → mitigates CWE-400.
* **Separation of concerns**: validation in middleware, business logic in service → simpler, testable, safer code.

---

## 2. Update the Controller

**File:** `src/controllers/items.controller.js`

Replace:

```js
  const items = await svc.getItemsByCriteria(req.query ?? {});
```

With:

```js
 const items = await svc.getItemsByCriteria(req.criteria, req.pagination);
```
**What this does**

* Stops reading **raw `req.query`**.
* Uses **validated `req.criteria`** and **normalized `req.page`** produced by middleware.
* Delegates all policy to the service; controller sticks to HTTP concerns.

**Why it matters**

* Prevents unbounded queries reaching the service.
* Makes the controller predictable and testable.
---

## 3. Update the Service

**File:** `src/services/items.service.js`

Replace:

```js
export async function getItemsByCriteria(criteria = {}) {
  const where = {};
  if (criteria.category != null) {
    where.category = String(criteria.category);
  }
  if (criteria.price != null) {
    const n = Number(criteria.price);
    if (Number.isFinite(n)) {
      where.price = n; // Prisma expects a number
    }
  }
  if (criteria.active != null) {
    const v = String(criteria.active).toLowerCase();
    where.active = v === "true" || v === "1" || v === "on";
  }
  return prisma.item.findMany({ where, orderBy: { id: "asc" } });
}
```

With:

```js
export async function getItemsByCriteria(criteria = {}, { limit, offset } = {}) {
  const safeLimit  = clamp(limit  ?? PAGINATION.DEFAULT_PAGE_SIZE, 1, PAGINATION.MAX_PAGE_SIZE);
  const safeOffset = Number.isFinite(offset) ? Math.max(offset, 0) : 0; // ✅ ensure number

  const where = {
    ...(criteria.category ? { category: criteria.category } : {}),
    ...(typeof criteria.price === "number"  ? { price: criteria.price } : {}),
    ...(typeof criteria.active === "boolean" ? { active: criteria.active } : {}),
  };

  return prisma.item.findMany({
    where,
    orderBy: { id: "asc" },
    take: safeLimit,
    skip: safeOffset,            
  });
}
```


**What this does**

* Trusts **typed, validated criteria** (no ad-hoc coercions) to build a safe `where`.
* Enforces **final clamps** on `limit/offset` and always sends `take/skip` (with `skip` ≥ 0).
* Uses a **stable, indexed order** (`id ASC`) for predictable, cacheable pagination.

**Why it matters**

* Bounds the query size → **prevents uncontrolled resource consumption (CWE-400)**.
* Avoids table-wide scans and costly sorts → **predictable query cost**.
* Adds **defense-in-depth** if upstream validation is bypassed.


------------------------------

## 4. Test!

### Valid query (should return array of items)

```bash
curl -s "http://localhost:3000/api/v1/items/search?category=books&active=true&page=1&pageSize=5" | jq .
```

### Invalid param (should 400)

```bash
curl -s "http://localhost:3000/api/v1/items/search?foo=bar" | jq .
```

### Duplicate key (should 400)

```bash
curl -s "http://localhost:3000/api/v1/items/search?category=books&category=other" | jq .
```

### Oversized pageSize (should clamp / reject based on config)

```bash
curl -s "http://localhost:3000/api/v1/items/search?pageSize=5000" | jq .
```