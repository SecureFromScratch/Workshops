# Coding Secure File Upload

This tutorial guides you through implementing a safe file upload flow:
validated inputs, magic-byte checks, server-side naming, bounded size, and cleanup on failure.

---

## 1) Update the Route

Look at `upload` in `src/api/items/upload.js`.

Look at `validateItemCreate` in `src/api/items/validateItemCreate.js` (it parses and validates item fields).


**File:** `src/api/items/items.routes.js`

Create:

```js
// Multipart (with file)
r.post(
  "/create",
  upload.single("file"),      // multer: memory storage, size limit, single file
  validateItemCreate,         // validates body → sets res.locals.itemData
  asyncHandler(ctrl.createWithFile)
);
```

**What this does**

* Accepts exactly one file under the `file` field (bounded size via Multer).
* Validates and normalizes the non-file item fields before hitting the controller.

**Why it matters**

* Prevents oversized/multi-file submissions and bad metadata from reaching business logic.

---

## 2) Update the Controller

**File:** `src/controllers/items.controller.js`

Create:

```js
export async function createWithFile(req, res) {
  const item = await svc.createItemWithFile(res.locals.itemData, req.file ?? null);
  return res.status(201).json(item);
}
```

**What this does**

* Keeps the controller thin: handles validated data + optional file to the service and returns `201 Created`.

**Why it matters**

* Clear separation of concerns; easy to test and maintain.

---

## 3) Update the Service

**File:** `src/services/items.service.js`

Create:

```js

export async function createItemWithFile(data, file) {
   if (!file) return createItem(data);

   // 1) Verify content by bytes (never trust client mimetype)
   const detected = await fileTypeFromBuffer(file.buffer);
   if (!detected || !ALLOWED_MIME.has(detected.mime)) {
      throw new Error("Unsupported or unrecognized file type");
   }

   // 2) Prepare destination (outside web root if applicable)
   const uploadsDir = path.resolve("uploads/items");
   await fs.mkdir(uploadsDir, { recursive: true });

   // 3) Server-controlled filename (no user path/extension)
   const safeName = `${crypto.randomUUID()}.${detected.ext}`;
   const finalPath = path.join(uploadsDir, safeName);

   // 4) Write bytes
   await fs.writeFile(finalPath, file.buffer, { flag: "wx" }); // fail if exists

   const payload = {
      ...data,
      fileName: file.originalname,          // display only
      filePath: safeName,                   // server-side name only
      mimeType: detected.mime,
      fileSize: file.size
   };

   try {
      return await prisma.item.create({ data: payload });
   } catch (e) {
      // best-effort cleanup to avoid orphaned files
      try { await fs.unlink(finalPath); } catch {}
      throw e;
   }
}

```

**What this does**

* **Verifies content by bytes** (magic-byte check), not by client-provided mimetype.
* **Stores outside web root** and uses a **server-controlled filename** (UUID + allowlisted ext).
* **Writes atomically** and **cleans up** on DB failure to avoid orphaned files.

**Why it matters**

* Blocks path traversal/overwrite and content-type spoofing.
* Prevents uncontrolled resource consumption (unbounded writes) and keeps storage/DB consistent.

---


## 4. Test!

### Valid query (should return array of items)

```bash
base64 -d > /tmp/ok.png <<'B64'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=
B64

curl -s -X POST "http://localhost:3000/api/v1/items/create"   -F 'name=Book A'   -F 'category=books'   -F 'price=15'   -F 'active=true'   -F 'file=@/tmp/ok.png;type=image/png' | jq .
```

### Unsupported File

```bash
echo "not an image" > /tmp/bad.txt

curl -s -X POST "http://localhost:3000/api/v1/items/create" \
```

### Fake File

```bash
base64 -d > /tmp/notpng.png <<'B64'
UklGRiIAAABXRUJQVlA4ICAAAADQAgCdASoIAAgAAAcJaQAA3AA/v4AAA==
B64

curl -s -X POST "http://localhost:3000/api/v1/items/create"   -F 'name=Book A'   -F 'category=books'   -F 'price=15'   -F 'active=true'   -F 'file=@/tmp/notpng.png;type=image/png' | jq .
```

### Oversized File

```bash
head -c 6000000 </dev/zero >/tmp/big.png
curl -s -X POST http://localhost:3000/api/v1/items/create \
  -F 'name=Big' -F 'category=books' -F 'price=1' -F 'active=true' \
  -F 'file=@/tmp/big.png' | jq .
```

