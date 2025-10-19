await prisma.$executeRaw`
   WITH s AS (
      SELECT id, balance AS amt FROM "Wallet" WHERE code = ${from} FOR UPDATE
   ), d AS (
      SELECT id FROM "Wallet" WHERE code = ${to} FOR UPDATE
   )
   UPDATE "Wallet" w
   SET balance = CASE WHEN w.id = s.id THEN 0
                      WHEN w.id = d.id THEN w.balance + s.amt END
   FROM s, d
   WHERE w.id IN (s.id, d.id) AND s.amt > 0
`;
