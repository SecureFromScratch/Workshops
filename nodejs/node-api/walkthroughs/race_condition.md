# Prevent Race Condition 

This tutorial guides you through prevent Race Condition in coupon redemption

---

## 1) Feel The race!

Run the following curl command to run two or more requests in parallel

printf '{"userId":1,"code":"SAVE10"}' > /tmp/p.json

```bash
# run two parallel requests
( curl -v --http1.1 -H 'Content-Type: application/json' -H 'Connection: close' -d @/tmp/p.json http://localhost:3000/api/v1/orders/redeem-coupon & )
( curl -v --http1.1 -H 'Content-Type: application/json' -H 'Connection: close' -d @/tmp/p.json http://localhost:3000/api/v1/orders/redeem-coupon & )
wait
```

Check the database:
```bash
psql -h 127.0.0.1 -U postgres -d nodeapi # pass: postgres

```


```plsql
SELECT * FROM "CouponRedemption";
```

If you want to try again Truncate

```plsql
Truncate Table "CouponRedemption";

```

If you check carefully the code, you would see that we used transaction. so why it didn't work?
Because in postgres the transaction consistency isn't sequential by default.
The default is **Read Committed isolation**. Meaning **each statement sees only rows that were committed before it began, but does not block concurrent inserts/updates and does not guarantee repeatable results**.

---

So two concurrent transactions can both see “no row” when checking, and both succeed in inserting, even though each one individually is atomic.




## 2) Update the service 


**File:** `src/services/orders.service.js`

Add to the prisma.$transaction a second parameter :

```js
{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
```

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
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
````

**What this does**

* Runs the transaction at Postgres’ strongest level (**SERIALIZABLE**), so the DB detects anomalies like “depend-on-absence” (write-skew/phantoms).
* If two txns both “see no row” and try to insert, Postgres aborts one with **`40001 serialization_failure`** (Prisma `P2034`).

**Why it matters**

* Forces a serial order of commits → stops both inserts from succeeding concurrently.
* Eliminates the check-then-insert race **when you retry** the aborted transaction.

**Why it’s not the right solution**

* It’s heavier under contention and **still inferior to** (and not a replacement for) a **unique constraint `(userId, couponId)` + insert-first pattern**.

---

## 3) Update the schema

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

```bash
  npx prisma db push
```
Or

```bash
  npx prisma migrate dev -n remove_unique_redemption  
  npx prisma generate
```

  Stop + restart the Node.js server so the new client is loaded.




**What this does**

* Enforces a **database-level uniqueness guarantee** on `(userId, couponId)`.
* Causes concurrent duplicate inserts to fail with Prisma **P2002**.

**Why it matters**

* DB constraints are **atomic and race-safe**, succeeding once and failing all competing attempts.
* Keeps business logic simple; correctness doesn’t depend on timing.



--------------------------------------
## 4) Test again!


