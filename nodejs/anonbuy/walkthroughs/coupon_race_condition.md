# Prevent Race Condition 

This tutorial guides you through prevent Race Condition in coupon redemption

---

## 1) Update the service 


**File:** `src/services/orders.service.js`

Replace :

```js
export async function redeemCoupon({ userId, code }) {
  return prisma.$transaction(async (tx) => {
    const coupon = await tx.coupon.findFirst({ where: { code, active: true } });
    if (!coupon) throw new Error("Coupon invalid");

    const used = await tx.couponRedemption.findFirst({
      where: { userId, couponId: coupon.id }
    });
    if (used) throw new Error("Already used");

    // widen race window
    //await new Promise(r => setTimeout(r, 300));

    return tx.couponRedemption.create({
      data: { userId, couponId: coupon.id }
    });
  });
}

```
With:

```js
export async function redeemCouponSafe({ userId, code }) {
  return prisma.$transaction(async (tx) => {
    const coupon = await tx.coupon.findFirst({ where: { code, active: true } });
    if (!coupon) throw new Error("Coupon invalid");

    try {
      return await tx.couponRedemption.create({
        data: { userId, couponId: coupon.id }
      });
    } catch (e) {
      // P2002 = unique violation (already redeemed)
      if (e.code === "P2002") throw new Error("Already used");
      throw e;
    }
  });
}

````

**What this does**

* Removes the racy **check-then-create** pattern and relies on a **single atomic create**.
* Converts “already redeemed” into a **unique-constraint error** that is caught and mapped to a clean message.

**Why it matters**

* Closes the TOCTOU window where two concurrent requests both pass the “used?” check.
* Makes the database the **source of truth** for exclusivity under concurrency.

---

## 2) Update the schema

**File:** `prisma/schema.prisma`


* Replace:
```plsql
@@index([userId, couponId])
```

* With:
  ```plsql
    @@unique([userId, couponId]) // SAFE: 1 per user
  ```
  In CouponRedemption model

* Update schema

  npx prisma db push || The next two commands  
  
  npx prisma migrate dev -n remove_unique_redemption
  
  npx prisma generate

  Stop + restart the Node.js server so the new client is loaded.




**What this does**

* Enforces a **database-level uniqueness guarantee** on `(userId, couponId)`.
* Causes concurrent duplicate inserts to fail with Prisma **P2002**.

**Why it matters**

* DB constraints are **atomic and race-safe**, succeeding once and failing all competing attempts.
* Keeps business logic simple; correctness doesn’t depend on timing.






