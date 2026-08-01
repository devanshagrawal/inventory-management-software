# Inventory Dashboard

Billing and inventory dashboard for a battery distribution business: vendor purchases, client sales, stock tracking, and receivables. Desktop-only web app.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Prisma](https://www.prisma.io) + SQLite (local file database, no server process)
- Custom email+password auth (bcrypt + signed session cookies), roles: `admin` / `staff`
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Generate a session secret and put it in `.env.local`:

```bash
openssl rand -base64 32
```

Apply migrations and seed the first admin user:

```bash
npm run db:migrate
npm run db:seed
```

By default the seed creates `admin@example.com` / `changeme123`. Override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars before seeding, and change the password after first login.

Run the app:

```bash
npm run dev
```

## Database

The SQLite file lives at `prisma/dev.db` (gitignored). Stock is auto-tracked via SQLite triggers (`prisma/migrations/*_stock_triggers/migration.sql`) that increment/decrement `skus.stockQty` on purchase/sale insert and delete, and reject a sale that would take stock negative.

To inspect the database: `npm run db:studio`.
