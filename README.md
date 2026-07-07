# Envoy Route

A dispatch and delivery operations platform: manage customers and orders, build driver routes, and track drivers live on a map.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL via Prisma
- Auth.js (NextAuth v5) credentials-based auth with `ADMIN`/`DISPATCHER`/`DRIVER` roles
- react-leaflet + OpenStreetMap tiles for live driver tracking

## Getting started

1. Copy `.env.example` to `.env` and point `DATABASE_URL` at a Postgres database.
2. Install dependencies and run migrations:

   ```bash
   npm install
   npx prisma migrate dev
   npm run prisma:seed
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Sign in with a seeded demo account (password `password123`):
   - `admin@envoyroute.com` — dispatcher/admin dashboard
   - `driver1@envoyroute.com` / `driver2@envoyroute.com` — driver mobile view

## Feature overview

- **Customers & orders** (`/customers`, `/orders`) — manage delivery recipients and the packages waiting to be routed.
- **Routes** (`/routes`) — assign a driver and date, build an ordered stop sequence from pending orders, reorder/remove stops, and advance route status.
- **Dispatch dashboard** (`/dashboard`) — live map of drivers (polled every 5s), order/route status counts, and a driver roster.
- **Driver view** (`/driver`) — mobile-friendly page showing a driver's assigned stops for their active route, a "mark delivered" action per stop, and background location sharing via the browser Geolocation API.
