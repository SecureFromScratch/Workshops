
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
r.get("/search", searchCriteria, asyncHandler(ctrl.getByCriteria));
```
Take a look at the searchCriteria middleware in 
src/middlewares/searchCriteria.js

**What this does**

* Ensures every `/search` request is **validated and normalized** before it reaches your controller.
* Applies an **allowlist** (category/price/active) and rejects unknown/invalid params.
* Establishes a consistent place to attach **`req.criteria`** (and, if you add it there, **`req.page`**).

**Why it matters**

* Stops “match-all” and malformed queries early, reducing wasteful DB scans.
* Moves input parsing out of business logic (clean separation of concerns).
---

## 2. Update the Controller

**File:** `src/controllers/items.controller.js`

Replace:

```js
export async function getByCriteria(req, res) {
  const items = await svc.getItemsByCriteria(req.query ?? {});
  res.json(items);
}
```

With:

```js
export async function getByCriteria(req, res, next) {
  try {
    const items = await svc.getItemsByCriteria({
      criteria: req.criteria,
      page: req.page, // from middleware
    });
    res.json(items);
  } catch (e) {
    next(e);
  }
}
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
export async function getItemsByCriteria({ criteria, page }) {
  if (!criteria || Object.keys(criteria).length === 0) {
    throw new Error("At least one filter is required");
  }

  const take = Math.min(Math.max(1, page?.take ?? 50), 100);

  return prisma.item.findMany({
    where: criteria,
    orderBy: { id: "asc" },
    take,
    ...(page?.cursorId ? { cursor: { id: page.cursorId }, skip: 1 } : {}),
    select: { id: true, name: true, price: true, category: true, active: true },
  });
}
```


**What this does**

* **Requires a selective filter** (no empty criteria → no table-wide reads).
* **Clamps page size** (`take`) to a safe maximum.
* Supports **cursor pagination** to avoid deep offsets.
* **Trims payload** via `select` to reduce bandwidth.

**Why it matters**

* Eliminates the core DoS vector: unbounded, match-all queries.
* Adds defense-in-depth even if upstream validation is bypassed.




