// utils/normalize.js
/*
That helper converts all query-string values (which arrive as **strings**) into the right JS types:

* `"true"` → `true` (boolean)
* `"false"` → `false` (boolean)
* `"42"` → `42` (number)
* `"3.14"` → `3.14` (number)
* Anything else → left as a string

So instead of `req.query` giving you:

```js
{ category: "electricity", price: "20", active: "true" }
```

after `normalizeQuery(req.query)` you get:

```js
{ category: "electricity", price: 20, active: true }
```

This way your code which uses strict `===`
works correctly against your in-memory objects that store numbers/booleans, not just strings.

*/

export function normalizeQuery(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === "true") out[k] = true;
    else if (v === "false") out[k] = false;
    else if (!Number.isNaN(Number(v)) && v.trim() !== "") out[k] = Number(v);
    else out[k] = v;
  }
  return out;
}
