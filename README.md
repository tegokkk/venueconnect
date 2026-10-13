# VenueConnect Polinela

Sistem Informasi Reservasi, Peminjaman, dan Penyewaan Fasilitas & Gedung Politeknik Negeri Lampung.

## Struktur Repositori

```text
├── backend/                           # Backend API (Next.js Route Handlers, Prisma 7, PostgreSQL)
├── frontend/                          # Frontend Application (Next.js App Router, React)
├── docs/                              # Dokumentasi teknis, PRD, arsitektur, dan panduan
├── scripts/                           # Utilitas operasional (backup, audit, restore drill)
└── stitch_markdown_document_analyzer/ # Prototipe UI & mockups
```

## Memulai Pengembangan (Local Setup)

### 1. Prasyarat
- **Node.js**: v22.12 atau versi lebih baru
- **PostgreSQL**: v15 atau lebih baru
- **Docker Desktop** (opsional, untuk local database container)

### 2. Backend
Masuk ke direktori `backend`:
```bash
cd backend
cp .env.example .env     # Sesuaikan DATABASE_URL di file .env
npm install
npm run db:deploy        # Menjalankan migrasi database
npm run db:seed          # Memuat data awal development
npm run dev              # Menjalankan server backend di http://localhost:3001
```

### 3. Frontend
Masuk ke direktori `frontend`:
```bash
cd frontend
cp .env.example .env     # Konfigurasi endpoint backend (default: http://localhost:3001)
npm install
npm run dev              # Menjalankan frontend di http://localhost:3000
```

## Dokumentasi & Spesifikasi

Panduan lengkap mengenai arsitektur, basis data, dan alur operasional tersedia di folder [`docs/`](./docs/):
- [`00-analysis-and-decisions.md`](./docs/00-analysis-and-decisions.md) - Analisis & keputusan arsitektur
- [`02-database.md`](./docs/02-database.md) - Skema basis data
- [`03-backend.md`](./docs/03-backend.md) - Spesifikasi backend & API
- [`04-frontend.md`](./docs/04-frontend.md) - Spesifikasi & integrasi frontend
- [`07-panduan-operasional.md`](./docs/07-panduan-operasional.md) - Panduan operasional & deployment

## Lisensi
Proyek internal VenueConnect Polinela.
