# Struktur Proyek VenueConnect Polinela

> Repo aplikasi memiliki dua folder tingkat atas: backend dan frontend. Dokumen rancangan berada di luar struktur aplikasi dan tidak menambah folder tingkat atas pada repo implementasi.

## Arsitektur yang dipilih

Pisahkan aplikasi menjadi dua proyek Next.js dalam satu repo:

- frontend/: aplikasi web responsif untuk pengguna publik, pemohon, admin dan petugas.
- backend/: API Next.js Route Handlers, service bisnis, autentikasi, Prisma dan akses PostgreSQL.

Pemisahan ini memenuhi batas folder tingkat atas dan menjaga teknologi utama proposal. Backend tetap menggunakan Next.js, JavaScript, Prisma, PostgreSQL, Vercel AI SDK dan Gemini API. Frontend memakai Next.js, JavaScript, Tailwind CSS dan FullCalendar. Setiap proyek memiliki package.json dan konfigurasi Next.js sendiri.

## Struktur tingkat atas

    venueconnect-polinela/
    ├── backend/
    └── frontend/

Berkas konfigurasi opsional seperti README.md atau .gitignore boleh berada di root; folder aplikasi tingkat atas tetap hanya backend dan frontend.

## Struktur backend

    backend/
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.js
    ├── src/
    │   ├── app/
    │   │   ├── api/health/route.js
    │   │   ├── api/v1/
    │   │   │   ├── buildings/
    │   │   │   ├── availability/
    │   │   │   ├── bookings/
    │   │   │   ├── payments/
    │   │   │   └── assistant/
    │   │   ├── layout.js
    │   │   └── page.js              # halaman status/health opsional
    │   ├── server/
    │   │   ├── auth/
    │   │   ├── db/
    │   │   ├── policies/
    │   │   ├── validations/
    │   │   ├── services/
    │   │   ├── storage/
    │   │   ├── repositories/
    │   │   ├── ai/
    │   │   ├── audit/
    │   │   └── errors/
    │   ├── lib/
    │   └── config/
    ├── .env.example
    ├── next.config.js
    └── package.json

## Struktur frontend

    frontend/
    ├── public/
    │   ├── images/
    │   └── icons/
    ├── src/
    │   ├── app/
    │   │   ├── (public)/
    │   │   ├── (auth)/
    │   │   ├── (member)/
    │   │   ├── (operator)/
    │   │   ├── layout.js
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── layout/
    │   │   ├── buildings/
    │   │   ├── calendar/
    │   │   ├── bookings/
    │   │   ├── admin/
    │   │   └── assistant/
    │   ├── features/
    │   ├── hooks/
    │   └── lib/
    │       ├── api-client.js
    │       ├── date-format.js
    │       └── currency-format.js
    ├── .env.example
    ├── next.config.js
    └── package.json

## Tanggung jawab

| Folder                          | Tanggung jawab                      |
| ------------------------------- | ----------------------------------- |
| backend/src/app/api             | Endpoint HTTP dan validasi protokol |
| backend/src/server/services     | Aturan dan alur bisnis              |
| backend/src/server/repositories | Query Prisma                        |
| backend/src/server/policies     | Hak akses dan kepemilikan resource  |
| backend/src/server/ai           | Gemini dan tools baca-saja          |
| backend/prisma                  | Model, migration dan seed database  |
| frontend/src/app                | Halaman dan routing UI              |
| frontend/src/components         | Komponen visual reusable            |
| frontend/src/features           | Alur UI per fitur                   |
| frontend/src/lib                | Client API dan format tampilan      |
| frontend/public                 | Gambar dan ikon frontend            |

## Komunikasi frontend dan backend

Frontend memanggil backend melalui HTTP API, misalnya /api/v1/buildings dan /api/v1/bookings. Browser memakai path `/api/v1` pada origin frontend; Next.js meneruskannya ke origin backend yang dikonfigurasi server. Pada produksi, cookie/session dan CSRF tetap harus dirancang serta diuji sebelum autentikasi diaktifkan.

Variabel minimum backend: DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY, APP_BASE_URL. Variabel frontend: BACKEND_API_ORIGIN (default development `http://localhost:3001`) dan NEXT_PUBLIC_DEV_USER_ID hanya untuk akun demo development. Nilai rahasia tidak boleh memakai prefix NEXT_PUBLIC atau masuk ke bundle browser.

## Batas dependensi

- Frontend tidak memiliki Prisma client dan tidak mengakses database.
- Backend tidak mengimpor komponen React dari frontend.
- Backend membentuk DTO response, bukan mengirim record Prisma mentah.
- Auth, ownership, dan role diverifikasi di backend.
- API key Gemini hanya berada pada environment backend.
- Prisma schema dan migration hanya berada di backend/prisma.

## Catatan deployment

Dua folder tersebut adalah dua aplikasi yang dapat dijalankan/deploy terpisah. Hosting, domain, dan mekanisme penggabungan origin perlu diputuskan. Model ini menambah konfigurasi dibanding satu aplikasi full-stack, tetapi pemisahan folder dan tanggung jawab lebih jelas sesuai struktur yang diminta.

## Menjalankan dua aplikasi

Development memakai dua proses. Jalankan backend Next.js pada port 3001 dan frontend pada port 3000. Browser memakai `/api/v1` pada port 3000, yang diteruskan oleh frontend ke `BACKEND_API_ORIGIN` port 3001; server component frontend memanggil backend langsung. File environment backend berisi DATABASE_URL, AUTH_SECRET, dan GEMINI_API_KEY bila fitur AI diaktifkan. Jangan commit file environment lokal.

Skrip package.json di tiap folder menyediakan dev, build, start, lint dan migrate sesuai kebutuhan. Migration dijalankan dari backend saja. README root menjelaskan urutan menjalankan PostgreSQL, backend, lalu frontend.

## Deployment dan sesi

Rekomendasi produksi: reverse proxy memetakan / ke frontend dan /api ke backend pada satu origin. Ini menyederhanakan cookie session, CSRF dan CORS. Jika layanan di-deploy pada origin terpisah, backend harus memakai allowlist origin frontend, credentialed CORS, cookie SameSite/domain yang sesuai, dan perlindungan CSRF. Jangan menyimpan access token di localStorage. Detail hosting harus diselaraskan dengan anggaran dan dukungan TI Polinela.

## Dokumen acuan

Rincian status, matriks hak akses, traceability FR-to-API-DB-UI, target NFR, skenario verifikasi dan daftar keputusan ada pada docs/venueconnect/00-analysis-and-decisions.md. Dokumen analisis berada di luar struktur aplikasi; struktur repo aplikasi pada dokumen ini tetap hanya memiliki folder backend/ dan frontend/.
