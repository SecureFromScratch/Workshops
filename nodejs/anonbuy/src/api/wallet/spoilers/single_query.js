import { prisma, Prisma } from "../../../prisma.js";

export async function transferAll({ from, to }) {
  // THIS IS THE MAJOR CHANGE
  // MUST WRITE SQL MANUALLY
  // NO TRANSACTION NEEDED
  const result = await prisma.$queryRaw`
    WITH s AS (
      SELECT id, balance AS amt FROM "Wallet" WHERE code = ${from} FOR UPDATE
    ), d AS (
      SELECT id FROM "Wallet" WHERE code = ${to} FOR UPDATE
    )
    UPDATE "Wallet" w
    SET balance = CASE
        WHEN w.id = s.id THEN 0
        WHEN w.id = d.id THEN w.balance + s.amt
      END
    FROM s, d
    WHERE w.id IN (s.id, d.id) AND s.amt > 0
    RETURNING w.id, w.code, w.balance;
  `;

  // result is an array; the destination row is the one whose code === "to"
  const updatedDest = result.find(r => r.code === to);
  return updatedDest ? updatedDest.balance : null;
}
