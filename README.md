# QIIC Zone Dashboard

Qatar Indian Islahi Center — Zone Member Distribution Dashboard

## Quick Start (Local)

```bash
cd qatar-zone-dashboard
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

Admin login: `admin@qiic.com` / `admin123`

---

## Deploy to Vercel (5 minutes)

### Option A — SQLite (demo only, resets on redeploy)

1. Push to GitHub
2. Import repo in Vercel
3. Add env vars:
   - `DATABASE_URL` = `file:./prisma/dev.db`
   - `JWT_SECRET` = any random string
   - `ADMIN_EMAIL` = your email
   - `ADMIN_PASSWORD` = your password
4. In Build Settings → Build Command: `prisma db push && prisma db seed && next build`
5. Deploy ✓

> ⚠️ SQLite on Vercel resets on every deploy. Use Option B for persistent data.

---

### Option B — Neon PostgreSQL (recommended, free)

1. Go to https://neon.tech → Create free account → Create project → Copy connection string

2. In `prisma/schema.prisma`, change:
   ```
   provider = "sqlite"
   ```
   to:
   ```
   provider = "postgresql"
   ```

3. Push to GitHub

4. Import repo in Vercel → Add env vars:
   - `DATABASE_URL` = your Neon connection string (with `?sslmode=require`)
   - `JWT_SECRET` = any random string (e.g. run `openssl rand -hex 32`)
   - `ADMIN_EMAIL` = your email
   - `ADMIN_PASSWORD` = your password

5. Build Command: `prisma db push && prisma db seed && next build`

6. Deploy ✓

---

## Environment Variables

| Variable         | Description                       | Default          |
|-----------------|-----------------------------------|------------------|
| `DATABASE_URL`  | Prisma DB connection string       | SQLite file      |
| `JWT_SECRET`    | Secret for signing JWT tokens     | (set this!)      |
| `ADMIN_EMAIL`   | Admin login email                 | admin@qiic.com   |
| `ADMIN_PASSWORD`| Admin login password              | admin123         |

---

## Project Structure

```
app/
  page.tsx              # Public dashboard (map + stats)
  admin/page.tsx        # Admin zone management (protected)
  admin/login/page.tsx  # Login
  api/
    auth/login/         # POST — authenticate
    auth/logout/        # POST — clear session
    zones/              # GET all zones, POST new zone
    zones/[id]/         # PUT update, DELETE zone

components/
  ZoneMap.tsx           # Custom SVG zone map
  StatsCards.tsx        # 4 metric cards
  ZoneRankings.tsx      # Ranked list with progress bars
  Navbar.tsx            # Top navigation

lib/
  db.ts                 # Prisma client singleton
  auth.ts               # JWT sign/verify helpers

prisma/
  schema.prisma         # DB schema
  seed.ts               # 17 Qatar zones with sample data
```
