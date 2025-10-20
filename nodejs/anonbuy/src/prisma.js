// src/prisma.js
import { PrismaClient } from "@prisma/client";
export { Prisma } from "@prisma/client";

export const prisma = new PrismaClient();

export class BusinessError extends Error {
  constructor(message) {
    super(message);
    this.name = "BusinessError";
  }
}