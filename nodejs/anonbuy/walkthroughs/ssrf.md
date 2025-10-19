# Prevent SSRF 

This tutorial guides you through prevent SSRF

---

## 1) Update routing 

Look at `src/security/ssrfFetch.js`.

Look at `src/security/url-guard.js` 


**File:** `src/middlewares/validations/validateItemCreate.js`

After:

```js
res.locals.itemData = parsed.data; // sanitized payload

````
Add:

```js
if ("imageUrl" in res.locals.itemData) {
      res.locals.itemData.imageUrl = await validateExternalImageUrl(res.locals.itemData.imageUrl);
    }

````

**What this does**

* Runs a **strict allowlist + DNS/IP check** on `imageUrl` (HTTPS-only, no creds/ports, public IPs only).
* **Normalizes** the URL (punycode host, strips query/fragment) and stores the **safe form** in `res.locals.itemData`.

**Why it matters**

* Blocks **store-time SSRF vectors** (bad hosts/IP literals, DNS to private ranges).
* Ensures downstream code receives a **pre-validated** URL (single responsibility: validation at the edge).

---

## 2) Update the controller

**File:** `src/controllers/items.controller.js`

Replace:

```js
const resp = await fetch(it.imageUrl, { redirect: "follow" });
```

With:

```js
const resp = await ssrfFetch("https://images.example-cdn.com/path/pic.jpg", {
```

**What this does**

* Resolves the hostname and **pins the connection to a public IP**, sending `Host` + **SNI** to keep TLS/cert checks intact.
* **Revalidates on each redirect** (HTTPS-only, no custom ports, host allowlist, public IPs).
* Enforces **timeouts and size caps** to prevent resource exhaustion.

**Why it matters**

* Eliminates **TOCTOU/DNS-rebinding**: validation happens **at fetch time** for every request/hop.
* Provides **defense-in-depth** (host allowlist, IP filtering, redirect policing, strict limits), making SSRF and egress abuse far harder.





