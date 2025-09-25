# Prevent SSRF 

This tutorial guides you through prevent SSRF

---

## 1) Update routing 

Look at `src/security/ssrfFetch.js`.

Look at `src/security/url-guard.js` 


**File:** `src/middlewares/validateItemCreate.js`

After:

```js
req.itemData = parsed.data; // sanitized payload

````
Add:

```js
if ("imageUrl" in req.itemData) {
      req.itemData.imageUrl = await validateExternalImageUrl(req.itemData.imageUrl);
    }

````

**What this does**

* 
* 

**Why it matters**

* .

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

* 

**Why it matters**

* 





