# Node API + Postgres (DB in Docker, API local)

Secure coding lab, catalog API with Prisma ORM, and Postgres. Students run **Postgres in Docker** and the **API locally** for fast iteration.

## Prerequisites

* Docker + Docker Compose
* Node.js **20+** and npm
* (Optional) `psql` CLI


## 1) Clone & env (sparse checkout of node-api)

```bash
# Clone shallow, no blobs, sparse
git clone --depth=1 --filter=blob:none --sparse https://github.com/SecureFromScratch/Workshops.git
cd Workshops

# Pull ONLY the node-api project
git sparse-checkout set nodejs/anonbuy

# Work inside node-api
cd nodejs/anonbuy

# Create local env
cp .env.example .env
```

`.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nodeapi?schema=public
PORT=3000
UPLOAD_DIR=./uploads/items
```




## 2) Start Postgres (Docker)

```bash
docker compose up -d
docker compose ps     # wait until db is healthy
```

## 3) Install deps & prepare DB (host)

```bash
npm ci
npx prisma generate
npx prisma migrate deploy   # or: npx prisma migrate dev
npx prisma db seed
```

## 4) Run the API (host)

```bash
# if you have a dev script (nodemon):
npx nodemon src/server.js
npm run dev

# otherwise:
node src/server.js
```

> Ensure your server binds externally: `app.listen(PORT, '0.0.0.0')`.

Here’s a tighter “Quick test” + cleaner endpoints section:

## 5) Quick test

```bash
# Run 

# Health
curl -s http://localhost:3000/health

# List items
curl -s http://localhost:3000/api/v1/items | jq .

# Search (allowlisted keys: category, price, active)
curl -s "http://localhost:3000/api/v1/items/search?category=books&active=true" | jq .
```

### Endpoints

| Method | Path                   | Purpose            | Notes                                                                                         |
| -----: | ---------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
|    GET | `/health`              | Liveness probe     | `200 OK`                                                                                      |
|    GET | `/api/v1/items`        | List items         | `200 OK`                                                                                      |
|   POST | `/api/v1/items`        | Create item        | `201 Created`; `Content-Type: application/json` with `{"name","category","price", "active?"}` |
|    GET | `/api/v1/items/search` | Search by criteria | Query params: `category` (string), `price` (number), `active` (bool)                          |

**Tips**

* All POSTs require `Content-Type: application/json`.
* `search` rejects unknown params; at least one of `category|price|active` must be provided.
* Status codes: reads → `200`, creates → `201`, bad input → `400`.

**Postgres**

* Check postgres connectivity
  
  docker exec -it nodeapi-postgres pg_isready -U postgres -d nodeapi

* Getting postgres prompt 

  psql -h 127.0.0.1 -U postgres -d nodeapi   # pass: postgres

  **Important Note**
  The password shown in this lab is **for training/demo purposes only**.
  In a real environment you should:

  * Use a **long, randomly generated password** (at least 16–20 characters).
  * Mix **uppercase, lowercase, numbers, and symbols**.
  * Never reuse passwords across systems.
  * Store secrets in a **password manager** or a **secrets vault** (e.g., HashiCorp Vault, AWS Secrets Manager, Azure Key Vault).
  * Rotate regularly and enforce **least-privilege access**.

* Tables list
  
  \dt

* Select & Trucate

  Truncate Table "CouponRedemption";

  SELECT * FROM "CouponRedemption";


## Reset to a fresh DB (ensure clean, student-like state)

> ⚠️ Destroys all Postgres data for the old project.

```bash
# From the OLD project folder (or pass -p <old_project>)
docker compose down -v      # stops containers and REMOVES the DB volume

# (optional) verify the volume is gone
docker volume ls | grep pgdata || echo "No pgdata volume found"

# From the NEW project folder
docker compose up -d        # start Postgres fresh
```

Then re-apply schema and seed from the **new** folder:

```bash
npx prisma migrate deploy
npx prisma db seed
```

If unsure of the old project name:

```bash
docker compose ls
# then:
docker compose -p <old_project> down -v
```

---

## Project structure (excerpt)

```
prisma/
  migrations/**          # commit all of these
  schema.prisma
  seed.js
src/
  app.js
  server.js
  routes/
  controllers/
  services/
uploads/
  items/                 # runtime (gitignored)
docker-compose.yml       # DB only
.env.example
```

---

## Troubleshooting

* **Port 5432 busy** → set `PGPORT=55432` in shell and update `DATABASE_URL` to `localhost:55432`, then `docker compose up -d`.
* **Prisma errors** → ensure migrations exist; run `npx prisma generate` before starting API.
* **Uploads** → `UPLOAD_DIR` must be writable; your code creates it if missing.
* **Different old data** → follow the **Reset** section above.

---

## Notes / Best practices

* Commit **all** Prisma migration files and `seed.js`.
* Keep seed **idempotent** (`upsert`, `skipDuplicates`) for consistent student results.
* Avoid secrets in repo; ship `.env.example`, not `.env`.
