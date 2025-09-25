import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "../prisma.js";


const prisma = new PrismaClient();
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);



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


// Optional: plain create without file
export async function createItem(data) {
   return prisma.item.create({ data });
}

