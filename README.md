# Lhimf — Digital Savings Compilation System

Next.js 14 (App Router, TypeScript), Tailwind CSS, Prisma, PostgreSQL (Neon), deployable on Vercel.
Black and white interface. Lhimf only records savings. It does not hold or move real money.

## What is included
- Register, password login, logout, 4-digit PIN unlock (hashed, 5 wrong tries lock it for 30 seconds)
- Savings accounts (starting balance is written to the ledger as an adjustment)
- Deposits, withdrawals, and atomic transfers (row locks, no negative balances, duplicate-submit protection)
- Transactions list with search, type filter, pagination, and CSV export
- Goals linked to an account (progress, remaining, monthly amount needed)
- Dashboard totals calculated from database records (transfers excluded from deposit and withdrawal totals)

## Not built yet
Daily/weekly/monthly compilation page, budgets and expenses, reports and print layouts, receipt uploads,
password reset by email, dark mode, automated tests, rate limiting on password login, audit log.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill it in (create a free Neon database at neon.tech, copy its connection string
   into both `DATABASE_URL` and `DIRECT_URL`, and set `AUTH_SECRET` with `openssl rand -base64 32`).
3. `npm run db:push` to create the tables.
4. `npm run dev` and open http://localhost:3000

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel choose Add New, then Project, and import the repository (framework: Next.js).
3. Add the three environment variables from `.env.example` in Project Settings.
4. Run `npm run db:push` once from your computer against the same Neon database (the tables must exist before first use).
5. Deploy. Register an account, then create the PIN under Settings.

## Notes
- Money is stored as integer centavos, never floats.
- The PIN works only on a device that has already signed in with a password (a 90-day device cookie). It is a convenience unlock, not a replacement for the password.
- Back up the database with Neon's point-in-time restore or scheduled `pg_dump` exports.
