# VenueConnect backend

Backend API for VenueConnect Polinela. It uses Next.js Route Handlers, Prisma ORM 7, PostgreSQL, and Zod.

## Local setup

1. Install Node.js 22.12 or newer and PostgreSQL 15. Docker Desktop is optional.
2. Copy `.env.example` to `.env`, then set `DATABASE_URL` for local development. Gemini configuration is optional and the assistant stays off without its server key.
3. Install packages and generate the Prisma client:

   ```powershell
   npm install
   ```

4. Start a local PostgreSQL database. With Docker Desktop, run from this folder:

   ```powershell
   docker compose up -d postgres
   ```

   On Windows without Docker, use the PostgreSQL 15 service installed natively. Create a login role `venueconnect` and a database `venueconnect_db` owned by that role in pgAdmin, then set `DATABASE_URL` in `.env` to the same username/password at `localhost:5432`. `POSTGRES_PASSWORD` is only needed for Docker Compose. Never paste the real password into documentation or commit `.env`.

5. Apply migrations and load demo records:

   ```powershell
   npm run db:deploy
   npm run db:seed
   ```

   Seed hanya menerima database di `localhost`/`127.0.0.1` dan dapat diulang tanpa menghapus booking. Data development berisi empat gedung peminjaman, dua belas pilihan penyewaan (GSG tersedia pada kedua alur), serta delapan belas opsi tarif sewa luar kampus. Beberapa tarif hanya ditampilkan sebagai informasi dan belum dapat dipakai untuk tagihan otomatis. Detailnya ada di `docs/15-inventaris-peminjaman-penyewaan.md`.

6. Start the API:

   ```powershell
   npm run dev
   ```

The API is available at `http://localhost:3001/api/v1`. Use `npm run db:migrate` for local schema changes and commit the generated migration for review. `npm run db:deploy` applies committed migrations without creating new ones.

## Current API areas

- Public building catalog and details
- Public availability calendar
- Booking creation, listing, and detail
- Booking approval and rejection
- Building calendar blocks
- Manual payment verification
- Key handover and usage completion
- Per-user in-app notification inbox

Authentication, authorization policy, private document storage, and several operational routes are still under development. The `x-user-id` identity is only a local development stub; protected routes reject it when `NODE_ENV=production`.
