import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "../../prisma.js";
import { PAGINATION, clamp } from "../../config/pagination.js";

export async function listItems() {
  return prisma.item.findMany({ orderBy: { id: "asc" } });
}

export async function getItemsByCriteria(criteria = {}) {
  const where = {};
  if (criteria.category != null) {
    where.category = String(criteria.category);
  }
  if (criteria.price != null) {
    const n = Number(criteria.price);
    if (Number.isFinite(n)) {
      where.price = n;               // Prisma expects a number
    }
  }
  if (criteria.active != null) {
    const v = String(criteria.active).toLowerCase();
    where.active = v === "true" || v === "1" || v === "on";
  }
  return prisma.item.findMany({ where, orderBy: { id: "asc" }, take: 1 });
}

export async function createItem(data) {
  if (!data || !data.name || !data.category || typeof data.price !== "number") {
    throw new Error("createItem: missing required fields");
  }
  return prisma.item.create({
    data: {
      name: data.name, category: data.category, price: data.price,
      active: data.active ?? true, fileName: "lamp.png", filePath: "lamp.png", mimeType: "image/png", fileSize: null, imageUrl: data.imageUrl ?? null
    }
  });
}

export async function createItemWithFile(data, metadata, file) {
  const uploadsDir = path.resolve("uploads/items");
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileExtension = path.extname(file.originalname);
  const mimetype = file.mimetype;
  const safeName = `${crypto.randomUUID()}.${fileExtension}`;
  const finalPath = path.join(uploadsDir, safeName);
  await fs.writeFile(finalPath, file.buffer, { flag: "wx" }); // fail if exists

  const payload = {
      ...data,
      fileName: file.originalname,          // display only
      filePath: safeName,                   // server-side name only
      mimeType: mimetype,
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

// Optional: plain create without file
//export async function createItem(data) {
//  return prisma.item.create({ data });
//}

