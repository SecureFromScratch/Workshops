import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "../prisma.js";
import { PAGINATION, clamp } from "../config/pagination.js";


const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);



export async function listItems() {
  return prisma.item.findMany({ orderBy: { id: "asc" } });
}

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





export async function create(data) {
  if (!data || !data.name || !data.category || typeof data.price !== "number") {
    throw new Error("createItem: missing required fields");
  }
  return prisma.item.create({
    data: {
      name: data.name, category: data.category, price: data.price,
      active: data.active ?? true, fileName: null, filePath: null, mimeType: null, fileSize: null, imageUrl: data.imageUrl ?? null
    }
  });
}


// Optional: plain create without file
export async function createItem(data) {
  return prisma.item.create({ data });
}

