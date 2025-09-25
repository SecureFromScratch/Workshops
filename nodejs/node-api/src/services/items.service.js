import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
  return prisma.item.findMany({ where, orderBy: { id: "asc" } });
}


export async function create(data) {
  if (!data || !data.name || !data.category || typeof data.price !== "number") {
    throw new Error("createItem: missing required fields");
  }
  return prisma.item.create({ data: {
    name: data.name, category: data.category, price: data.price,
    active: data.active ?? true, fileName: null, filePath: null, mimeType: null, fileSize: null, imageUrl: data.imageUrl ?? null
  }});
}





export async function createItemWithFile(data, file) {
  if (!file) return createItem(data);
  const uploadsDir = path.resolve("uploads/items");
  await fs.mkdir(uploadsDir, { recursive: true });
  const safeName = crypto.randomUUID();                 // <-- define it
  const finalPath = path.join(uploadsDir, safeName);
  await fs.writeFile(finalPath, file.buffer);

  const payload = {
    ...data,
    fileName: file.originalname,
    filePath: safeName,                                  // store server name only
    mimeType: file.detectedMime || file.mimetype,
    fileSize: file.size,
  };

  try {
    return await prisma.item.create({ data: payload });
  } catch (e) {

    try { await fs.unlink(finalPath); } catch { }
    throw e;
  }
}