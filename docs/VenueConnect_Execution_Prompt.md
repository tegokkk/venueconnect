# Prompt Eksekusi Task Tersisa — VenueConnect Polinela

> Dokumen ini adalah referensi kerja proyek. Status checklist kanonik ada di `docs/VenueConnect_Task_List.md`; usulan di bawah tidak mengesahkan kebijakan institusi atau mengaktifkan produksi.

> **Status per 2026-10-13:** 69/102 task selesai (67,6%) — **33 task masih terbuka.**
> Task list lengkap: [`docs/VenueConnect_Task_List.md`](./VenueConnect_Task_List.md)
> Workspace root: `d:\PEOJECTTTTTTT\PUM`
> Diperbarui: 2026-10-12 (status checklist kanonik)

---

## Peran & Tujuan

Kamu adalah agen pengembang senior untuk proyek **VenueConnect Polinela**.
Tugasmu adalah mengeksekusi semua item `[ ]` dari `docs/VenueConnect_Task_List.md` secara sistematis tanpa berhenti, kecuali task yang secara eksplisit **menunggu keputusan institusi** yang belum tersedia.

---

## Aturan Kerja

- **Baca referensi lebih dulu** sebelum menulis kode:
  - `docs/00-analysis-and-decisions.md` — keputusan arsitektur & baseline
  - `docs/10-baseline-kebutuhan-mvp.md` — batas MVP & kriteria penerimaan
  - `docs/12-verifikasi-integrasi-development.md` — bukti teknis integrasi yang sudah lulus
  - `docs/02-database.md` — skema & migrasi
  - `docs/03-backend.md` — kontrak API
  - `docs/04-frontend.md` — halaman & komponen
- **Cek file yang sudah ada** sebelum membuat file baru — hindari duplikasi. Banyak yang sudah selesai.
- **Jangan hardcode** tarif, NIP/NPM/NIK, data pribadi, atau konfigurasi produksi.
- **Jangan expose** data pribadi pemohon ke endpoint publik atau ke model AI.
- **Perubahan database** wajib melalui migrasi Prisma (`npx prisma migrate dev`), bukan edit langsung.
- **Setiap task selesai** → update checklist di `docs/VenueConnect_Task_List.md` dari `[ ]` ke `[x]` beserta catatan singkat.
- **Jika task bergantung pada kebijakan institusi yang belum disahkan** → buat stub/placeholder bertanda `// TODO: KEBIJAKAN INSTITUSI — menunggu pengesahan`, catat di task list, lalu lanjut. Jangan blokir progress.
- **Setiap endpoint baru** harus memiliki: validasi input, ownership check, error envelope `{ success, error: { code, message, requestId } }`, dan entri `AuditEvent` jika termasuk tindakan sensitif.

---

## Konteks Stack Teknis (Terkini)

| Komponen       | Status & Detail                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Frontend       | Next.js 16.4.0 (JavaScript), Vanilla CSS/globals.css, port 3000                                  |
| Frontend Routes| Route groups: `(member)` (akun/dashboard pemohon) · `(operator)` (admin/persetujuan/dashboard)  |
| Backend        | Next.js API Routes (bukan Express terpisah), port 3001                                           |
| API Endpoints  | `/api/v1/`: bookings, buildings, facilities, availability, approvals, assistant, admin/*, payments, notifications |
| Database       | PostgreSQL + Prisma ORM; 6 migrasi sudah diterapkan di development lokal                         |
| AI             | Vercel AI SDK + Gemini (`gemini-3.1-flash-lite`); tertutup jika `GEMINI_API_KEY` kosong          |
| Auth saat ini  | Dev stub `x-user-id` header; memeriksa user aktif & role dari DB; production belum diputuskan    |
| Object Storage | `LocalStorageProvider` sudah ada di `backend/storage/private/`; production storage belum dipilih |
| Pembayaran     | Referensi transfer manual; verifikasi manual oleh BLU; tidak ada gateway                         |
| Tarif          | Bersumber dari SK 1185/PL15/KPTS/2026; pemetaan ke inventaris gedung masih perlu dilakukan       |
| Timezone       | `NEXT_PUBLIC_APP_TIME_ZONE` (default `Asia/Jakarta`); pengesahan resmi masih menunggu            |
| Pagination     | Max 100 item, default 20; backend memakai `parsePagination()`                                    |

---

## Yang Sudah Selesai (Jangan Dikerjakan Ulang)

### Seksi 1 — Keputusan (9/15 selesai)

- [x] Alur mahasiswa tanpa WD III, tindak lanjut pengelola, format berkas PDF 5MB
- [x] Alur dosen/pegawai dan penyewaan publik (baseline)
- [x] Field & dokumen wajib per kategori pemohon
- [x] Kebijakan konflik jadwal, tarif BLU (SK 1185/2026), metode pembayaran manual
- [x] Jadwal kerja dan deliverable (draft)

### Seksi 3 — Fondasi (3/6 selesai)

- [x] Struktur Next.js, konfigurasi package, lint, `.env.example`
- [x] PostgreSQL + Prisma + migrasi + seed demo
- [x] `LocalStorageProvider` untuk development sudah ada

### Seksi 4 — Database (8/9 selesai)

- [x] Semua model utama sudah diimplementasikan dan dimigrasikan
- [x] Enum status, exclusion constraint konflik, soft-disable gedung

### Seksi 5 — Backend (7/13 selesai)

- [x] API katalog, detail, fasilitas, tarif, ketersediaan (publik)
- [x] Alur mahasiswa: DRAFT → PDF → SUBMITTED → UNDER_REVIEW (tanpa WD III)
- [x] Pemeriksaan konflik transaksi + row lock
- [x] API admin gedung, fasilitas, blokir, tarif

### Seksi 6 — Frontend (17/22 selesai)

- [x] Layout responsif, navbar, footer, komponen bersama (`auth-unavailable.js`, `notification-nav-link.js`, `status-badge.js`)
- [x] Katalog + filter multi-fasilitas + pagination + URL state
- [x] Detail gedung + tabs + FullCalendar + CTA wizard
- [x] Wizard 3 langkah + validasi per-step + PDF development (`/pinjam/[slug]/booking-wizard.js`)
- [x] Dashboard pemohon + daftar/detail pengajuan + badge status (`(member)/akun/pengajuan`)
- [x] Dashboard admin + statistik + antrean + layar master gedung/tarif/fasilitas/blokir (`(operator)/admin`)
- [x] Panel verifikasi pembayaran + handover + inbox notifikasi + unread badge
- [x] Format waktu WIB + mata uang IDR (formatter util)
- [x] Route `/akun/pengajuan/[id]/konfirmasi` sudah ada (halaman dasar — instruksi per kategori masih perlu dilengkapi)
- [x] Route `/persetujuan` sudah ada di `(operator)` group dengan antrean ApprovalStep

### Seksi 7 — AI (5/8 selesai)

- [x] Endpoint AI + UI `/bantuan` terhubung; tools baca-saja: katalog, tarif, ketersediaan
- [x] Filter PII awal (email, telepon, NIK/NPM 16 digit)
- [x] Tidak ada tool mutasi; disclaimer di UI; fallback jika key tidak ada

### Seksi 8 — QA (4/11 selesai)

- [x] Verifikasi alur mahasiswa, dosen/pegawai, publik (integrasi development lulus)
- [x] Verifikasi konflik booking, akses lintas role

---

## Task Tersisa — Detail Eksekusi

### 📋 Seksi 1 — Keputusan yang Masih Terbuka

> Task-task ini **bukan task koding** — harus diselesaikan bersama pemilik proses institusi.
> Tandai dengan status "menunggu" dan lanjut ke task teknis.

```
[ ] Putuskan autentikasi: metode (NextAuth/JWT/SSO), verifikasi akun, pemilik role.
    → Blocker untuk: autentikasi sesi production, semua fitur protected production.
    → Interim: dev stub tetap aktif; dokumentasikan opsi di docs/00-analysis-and-decisions.md.

[ ] Tetapkan timezone produk, kanal notifikasi, kebijakan privasi/retensi, backup, publikasi jadwal.
    → Interim: Asia/Jakarta sebagai default; notifikasi in-app sudah ada.

[ ] Tetapkan domain, hosting, origin, biaya API, pemilik operasional.
    → Interim: development localhost; dokumentasikan anggaran proposal di docs/00-analysis-and-decisions.md.

[x] Verifikasi data survei (n=45, n=13): dua workbook sumber diperiksa; temuan agregat dan inkonsistensi di `docs/14-validasi-survei-sumber.md`.

[ ] Konfirmasi izin publikasi logo/foto/alamat serta detail/tarif empat gedung peminjaman (CB, QB, Sakura, GSG) dan sebelas ruang/layanan sewa baru. GSG tersedia untuk kedua alur. Cuplikan tarif pengguna telah dimasukkan ke seed development sebagai 18 opsi harga luar kampus; lokasi/foto ruang baru, identitas ruang fisik, tanggal efektif, serta syarat tetap menunggu verifikasi. Rincian: `docs/15-inventaris-peminjaman-penyewaan.md`.
```

### 🔒 Seksi 3 — Fondasi yang Masih Terbuka

#### 3.1 Autentikasi Sesi Production

```
[ ] Siapkan autentikasi sesi production: middleware, cookie, CORS, CSRF.
```

**Status saat ini:** Dev stub `x-user-id` sudah ada dan berfungsi untuk development.

Yang masih perlu dilakukan:

- Dokumentasikan pilihan provider di `docs/00-analysis-and-decisions.md` (NextAuth / Lucia / JWT)
- Buat middleware `requireAuth(roles?)` yang akan aktif di `NODE_ENV=production`
- CORS hanya izinkan origin dari `ALLOWED_ORIGIN` di `.env`
- Semua route terlindungi sudah menolak di production — verifikasi tidak ada bypass
- **Catatan:** Task ini **tergantung pada keputusan autentikasi** yang belum disahkan; buat stub lengkap dan dokumentasikan

#### 3.2 Object Storage Production

```
[ ] Siapkan penyimpanan object privat production; larang akses publik langsung.
```

**Status saat ini:** `LocalStorageProvider` sudah ada dan berfungsi untuk development.

Yang masih perlu dilakukan:

- Buat interface `StorageProvider` abstrak jika belum ada
- Dokumentasikan cara mengganti ke S3-compatible di `.env.example`
- Endpoint proxy download `GET /api/v1/documents/:id/download` — verifikasi ownership check sudah ada
- **Catatan:** Production storage belum bisa dipilih tanpa keputusan hosting

#### 3.3 Deployment Staging

```
[ ] Siapkan staging: reverse proxy, logging, monitoring, backup terjadwal, restore teruji.
```

**Status saat ini:** `GET /api/health` sudah ada; `scripts/backup-db.mjs` sudah ada; draft restore di `docs/07-panduan-operasional.md`.

Yang masih perlu dilakukan:

- Buat `docker-compose.staging.yml` (jika dipakai) atau dokumentasikan alternatif
- Tambahkan structured logging (request ID, level, timestamp)
- Jadwalkan backup otomatis (cron atau CI/CD)
- **Lakukan** restore database ke instance kosong yang terisolasi dan dokumentasikan hasilnya
- **Catatan:** Menunggu keputusan domain/hosting

---

### 🗄️ Seksi 4 — Database yang Masih Terbuka

#### 4.1 Kebijakan Retensi

```
[ ] Tetapkan retensi, penghapusan, backup, dan prosedur restore sesuai keputusan institusi.
```

**Status saat ini:** Komentar TODO sudah ditambahkan di schema dan `docs/02-database.md`.

Yang masih perlu dilakukan:

- Task tetap **terbuka sampai institusi mengesahkan** kebijakan retensi resmi
- Interim: implementasikan soft-delete (field `deletedAt`) pada `BookingDocument` dan `AuditEvent` sebagai persiapan
- Dokumentasikan usulan: "Hapus dokumen mahasiswa 90 hari setelah status terminal" di `docs/02-database.md`

---

### ⚙️ Seksi 5 — Backend yang Masih Terbuka

#### 5.1 Validasi Request & DTO Lengkap

```
[ ] Implementasikan validasi request, autentikasi, otorisasi, ownership check, DTO, pagination,
    dan kontrak error /api/v1 secara konsisten di semua route.
```

**Status saat ini:** Sudah ada sebagian — schema booking, pagination, envelope error, ownership check dev.

Yang masih perlu dilakukan:

- Audit semua route: pastikan `{ success, error: { code, message, requestId } }` dipakai konsisten
- Pastikan `additionalProperties: false` atau setara di semua schema input
- Verifikasi semua route terlindungi menolak tanpa `x-user-id` di development
- Pagination `?page=1&limit=20` — verifikasi maksimum `limit=100` diterapkan di semua route list
- Buat checklist route di `docs/03-backend.md` dengan status validasi masing-masing

#### 5.2 Syarat Penggunaan Gedung

```
[ ] Modelkan dan sajikan syarat penggunaan gedung setelah kebijakan resmi ditetapkan.
```

**Status saat ini:** Kolom nullable dan endpoint status `PENDING_POLICY` sudah ada; placeholder di UI sudah ada.

Yang masih perlu dilakukan:

- Tambahkan endpoint admin `PUT /api/v1/admin/buildings/:id/terms` agar operator dapat mengisi teks
- **Isi resmi** menunggu pengesahan institusi; task tetap terbuka

#### 5.3 Routing Persetujuan (Resmi)

```
[ ] Implementasikan routing persetujuan dosen/pegawai dan penyewaan publik sesuai assignment disahkan.
```

**Status saat ini:** Routing generik ke role `APPROVER` sudah ada; `ApprovalStep` terbuat; antrean `/persetujuan` tersedia.

Yang masih perlu dilakukan:

- Buat atau verifikasi file `backend/src/config/approval-routes.json` (atau setara):
  ```json
  {
    "STUDENT": ["OPERATOR"],
    "STAFF": ["OPERATOR"],
    "EXTERNAL": ["OPERATOR", "WD2_FINANCE"]
  }
  ```
- **Catatan:** Assignment jabatan/delegasi resmi (`DEPT_HEAD`, `WD2_FINANCE`) menunggu konfirmasi institusi
- Buat endpoint read-only `GET /api/v1/admin/approval-routes` untuk melihat konfigurasi aktif
- Tambahkan catatan konfigurasi di `docs/03-backend.md`

#### 5.4 Pencatatan & Verifikasi Pembayaran (Lengkap)

```
[ ] Bangun pencatatan/verifikasi pembayaran lengkap: bukti transfer, expiry, amount check.
```

**Status saat ini:** Antrean verifikasi, terima/tolak referensi transfer, row lock, audit, notifikasi sudah ada.

Yang masih perlu dilakukan:

- **Upload bukti transfer**: endpoint `POST /api/v1/bookings/:id/payment/proof` — simpan via `StorageProvider`, metadata ke `Payment`
- **Validasi amount**: bandingkan `Payment.amount` dengan snapshot tarif di `Booking`; tolak jika tidak sesuai range
- **Expiry job**: siapkan rancangan background job/cron untuk booking `AWAITING_PAYMENT`, tetapi jangan aktifkan tenggat otomatis sebelum BLU/pengelola menetapkan durasi, pengingat, refund, dan dampaknya pada slot. Nilai 24 jam di baseline adalah usulan teknis, bukan kebijakan berlaku.
- **Catatan:** Kebijakan tenggat dan refund resmi masih menunggu BLU; `paymentDueAt` tetap kosong pada alur development saat ini.

#### 5.5 Serah-Terima (Lengkap)

```
[x] Serah-terima/pengembalian, penyelesaian, dan riwayat tindakan petugas development tersedia; assignment/otorisasi produksi tetap task terpisah.
```

**Status saat ini:** Endpoint handover/return/complete, panel UI, audit dasar, notifikasi pemohon sudah ada.

Yang masih perlu dilakukan:

- **Assignment petugas**: endpoint `POST /api/v1/admin/bookings/:id/assign-staff` — assign user ke booking sebagai petugas
- Pastikan hanya petugas yang di-assign (atau admin) yang dapat melakukan handover/return/complete
- Tambahkan field `staffNotes` pada handover dan return untuk kondisi gedung
- **Catatan:** Autentikasi production belum tersedia; gunakan role check development

#### 5.6 Notifikasi (Semua Pemicu)

```
[x] Notifikasi in-app dan inbox untuk transisi yang sudah tersedia selesai; pemicu expiry/pengingat menunggu kebijakan dan tetap dicatat pada task sesi produksi/notifikasi.
```

**Status saat ini:** Submit, revisi, keputusan, routing approver, pembayaran, handover, return, penyelesaian sudah ada.

Yang belum ada (tambahkan):

| Pemicu                                 | Penerima                 |
| -------------------------------------- | ------------------------ |
| Booking dibatalkan (setelah routing)   | Pemohon + Approver aktif |
| Pembayaran akan kedaluwarsa (reminder) | Pemohon                  |
| Booking kedaluwarsa (expiry)           | Pemohon                  |

- Semua notifikasi: `try/catch` setelah `tx.commit()` — kegagalan hanya ke log, tidak rollback

#### 5.7 Audit Tindakan Sensitif (Lengkap)

```
[x] Audit tindakan sensitif pada fitur yang tersedia selesai; aksi role/assignment production harus diaudit saat fitur tersebut disahkan dan dibangun.
```

**Status saat ini:** Draft/submit/revisi, upload/ganti/hapus dokumen, review/routing, pembayaran sudah diaudit.

Yang masih perlu ditambahkan:

| Tindakan                      | Target     | Status   |
| ----------------------------- | ---------- | -------- |
| Perubahan role user           | `UserRole` | ❌ belum |
| Assignment petugas            | `Booking`  | ❌ belum |
| Pembatalan setelah routing    | `Booking`  | ❌ belum |
| Perubahan konfigurasi routing | Config     | ❌ belum |

- Audit tidak boleh memuat: token, API key, password, isi PDF, referensi rekening bank lengkap

---

### 🖥️ Seksi 6 — Frontend yang Masih Terbuka

#### 6.1 Aktifkan Submit Wizard (Production-Ready)

```
[ ] Aktifkan submit booking sesudah autentikasi produksi dan penyimpanan privat tersedia.
```

**Status saat ini:** Validasi PDF 5MB dan submit development sudah berfungsi; production nonaktif.

Yang masih perlu dilakukan:

- Tampilkan error spesifik dari API:
  - `409` → "Gedung sudah dipesan untuk waktu ini. Pilih waktu lain."
  - `403` → "Kamu tidak memiliki izin untuk melakukan pengajuan ini."
  - `422` → tampilkan pesan validasi per-field dari response
  - `500` → "Terjadi kesalahan. Coba lagi atau hubungi pengelola."
- Loading state: disable tombol + spinner saat request berlangsung
- Redirect ke `/akun/pengajuan/[id]/konfirmasi` setelah submit berhasil
- **Aktifkan penuh** setelah autentikasi production tersedia

#### 6.2 Halaman Konfirmasi Submit

```
[ ] Lengkapi halaman konfirmasi submit dengan instruksi langkah berikutnya per kategori yang disahkan.
```

**Status saat ini:** Route `(member)/akun/pengajuan/[id]/konfirmasi/page.js` **sudah ada** (3.167 byte) dan menampilkan status dari API. Yang tersisa ialah melengkapi instruksi langkah berikutnya per kategori pemohon dan memastikan tombol navigasi sudah benar.

Yang perlu dilengkapi (bukan dibuat dari awal):

- **Buka dan tinjau** `frontend/src/app/(member)/akun/pengajuan/[id]/konfirmasi/page.js` lebih dulu
- Pastikan konten mencakup: ringkasan booking (gedung, tanggal, durasi, kategori pemohon), status awal
- Tambahkan/verifikasi instruksi langkah berikutnya per kategori:
  - `MAHASISWA` → "Pengelola akan meninjau berkasmu. Pantau status di Pengajuanku."
  - `DOSEN_PEGAWAI` → "Menunggu pemeriksaan awal. Kamu akan mendapat notifikasi."
  - `UMUM` → "Menunggu tinjauan pengelola. Kamu akan mendapat notifikasi bila pembayaran diperlukan."
- Verifikasi tombol: "Lihat Status" → `/akun/pengajuan/[id]` | "Kembali ke Beranda" → `/`

#### 6.3 Dashboard & Tindakan Per-Role (Production-Ready)

```
[ ] Sempurnakan dashboard admin/pengelola, approver, verifier pembayaran, dan petugas
    sesuai capability masing-masing.
```

**Status saat ini:** 
- Dashboard admin: `(operator)/admin/page.js` ✅
- Panel persetujuan approver: `(operator)/persetujuan/page.js` ✅
- Admin pembayaran: `(operator)/admin/pembayaran/` ✅
- Admin handover: `(operator)/admin/handover/` ✅
- Admin gedung: `(operator)/admin/gedung/` ✅
- Admin pengajuan detail: `(operator)/admin/pengajuan/[id]/` ✅

Yang masih perlu dilakukan:

- **Guard per capability**: tombol tindakan hanya muncul jika user memiliki role yang sesuai (bukan hanya `ADMIN`)
- **Instruksi jelas** jika user tidak punya capability: "Kamu tidak memiliki akses untuk tindakan ini."
- Tambahkan filter status dan sort pada antrean review
- **Catatan:** Assignment jabatan resmi menunggu institusi; gunakan role generik untuk development

#### 6.4 Sesi Production & Notifikasi

```
[ ] Selesaikan sesi produksi dan seluruh pemicu notifikasi sesuai alur yang disahkan.
```

Yang perlu dilakukan:

- `<SessionExpiredModal />`: muncul saat response `401`, tombol "Login Ulang" → `/masuk`
- Badge notifikasi development sekarang polling setiap 30 detik, menyegarkan saat fokus/visibilitas kembali, melewati tab tersembunyi, dan membatalkan request saat komponen ditutup. Tidak melakukan polling ketika sesi development tidak dikonfigurasi.
- **Catatan:** Modal sesi habis dan mekanisme login ulang tetap menunggu keputusan autentikasi; jangan tampilkan ajakan login ulang pada alur produksi yang belum memiliki login.

#### 6.5 State Handling Lengkap

```
[ ] Terapkan loading, empty, error, sesi habis, konflik, sukses, kedaluwarsa, dan AI gagal.
```

**Status saat ini:** Kalender retry, 404/error boundary, fallback AI, state panel admin sudah ada. Beberapa alur masih kurang.

Yang belum ada:

- Halaman `not-found.js` kustom sudah ada; audit tampilan dan navigasinya saja.
- `<SessionExpiredModal />` global yang menangkap semua 401
- State "booking kedaluwarsa" di detail pengajuan pemohon — tampilkan badge EXPIRED dengan penjelasan
- State "data mungkin sudah berubah" pada form yang sudah lama terbuka (>10 menit idle)
- AI gagal: pastikan semua alur menampilkan fallback dengan link ke katalog/jadwal

#### 6.6 Aksesibilitas (Audit Menyeluruh)

```
[ ] Terapkan label field, validasi jelas, navigasi keyboard, fokus terlihat, kontras memadai,
    status non-warna — audit menyeluruh.
```

**Status saat ini:** Fokus keyboard global, ikon+teks pada badge status, label form katalog/wizard sudah ada.

Yang belum selesai:

- Jalankan Lighthouse Accessibility Audit pada setiap halaman; target skor ≥ 90
- Perbaiki semua issue "critical" dan "serious":
  - Setiap `<input>`, `<select>`, `<textarea>` harus punya `<label>` atau `aria-label`
  - Kontras minimum 4.5:1 untuk teks normal, 3:1 untuk teks besar
  - Status error jangan hanya border merah — tambahkan ikon + teks deskripsi
- Catat hasil audit di `docs/VenueConnect_Task_List.md`

---

### 🤖 Seksi 7 — AI Agent yang Masih Terbuka

#### 7.1 Function Calling Baca-Saja Lengkap

```
[ ] Implementasikan function calling baca-saja — lengkapi tool yang belum ada.
```

**Status saat ini:** Tools katalog, tarif, ketersediaan sudah ada. Prosedur resmi belum ada sumber data.

Yang masih perlu dilakukan:

- Verifikasi semua 5 tool tersedia dan berfungsi:
  - `searchBuildings` ✅ (ada)
  - `getBuildingDetail` ✅ (ada)
  - `getBuildingRates` ✅ (ada)
  - `checkAvailability` ✅ (ada)
  - `getProcedureInfo` ❓ — verifikasi implementasi, tetapi jangan memakai panduan development `docs/07-panduan-operasional.md` sebagai prosedur resmi. Arahkan ke pengelola sampai sumber prosedur yang disahkan tersedia.
- Rate limiter per-key sudah ada (10.000 client); verifikasi shared rate limiter production sudah didokumentasikan

#### 7.2 Filter PII (Penguatan)

```
[ ] Batasi data yang dikirim ke model; jangan kirim identitas/kontak pemohon atau isi dokumen.
```

**Status saat ini:** Filter email, telepon, NIK/NPM 16 digit sudah ada.

Yang masih perlu dilakukan:

- Verifikasi pola filter sudah mencakup semua yang didokumentasikan di task list
- Tambahkan komentar `// TODO: REVIEW PRIVASI SEBELUM PRODUKSI — bukan filter PII menyeluruh`
- Dokumentasikan batasan filter di `docs/00-analysis-and-decisions.md`

#### 7.3 Error Handling AI (Lengkap)

```
[ ] Tangani timeout, rate limit, error provider, dan biaya; sistem peminjaman tetap berfungsi.
```

**Status saat ini:** Timeout, fallback UI, cache rate limit proses sudah ada; shared rate limiter production belum.

Yang masih perlu dilakukan:

- Verifikasi: jika `GEMINI_API_KEY` tidak diset → input chat disembunyikan, pesan informatif tampil
- Verifikasi: jika request timeout (>15 detik) → pesan "Asisten tidak merespons. Coba lagi atau hubungi pengelola."
- Verifikasi: katalog, kalender, dan wizard berfungsi normal saat AI tidak tersedia (tidak ada error cascade)
- Dokumentasikan pagu biaya yang disarankan di `docs/00-analysis-and-decisions.md`

#### 7.4 Kebijakan Retensi Percakapan AI

```
[ ] Tentukan retensi percakapan dan metrik AI; jangan simpan percakapan sensitif.
```

**Status saat ini:** Tidak menyimpan ke database/storage sudah diterapkan; state halaman saja.

Yang masih perlu dilakukan:

- Tampilkan di UI `/bantuan`: "Percakapan ini tidak disimpan dan akan hilang saat kamu menutup halaman ini."
- Pastikan kalimat ini sudah ada atau tambahkan
- Tulis keputusan di `docs/00-analysis-and-decisions.md` dengan tag `[SEMENTARA — MENUNGGU REVIEW PRIVASI]`

---

### ✅ Seksi 8 — Verifikasi, UAT & Rilis

#### 8.1 Audit Dependency

```
[ ] Tinjau dan remediasi advisory dependency sebelum rilis.
```

**Status saat ini:** `npm audit --omit=dev` bersih setelah override; 5 high pada rantai ESLint dev (belum ada perbaikan upstream); `docs/SECURITY.md` sudah ada.

Yang masih perlu dilakukan:

- Jalankan ulang `npm audit --omit=dev` di `backend/` dan `frontend/`
- Update semua dependency yang bisa diupdate tanpa breaking change: `npm update`
- Verifikasi `braces@3.0.3` masih versi terbaru; dokumentasikan justifikasi pengecualian dev dependency di `docs/SECURITY.md`
- Task tetap terbuka sampai advisory terselesaikan atau pemilik rilis menyetujui pengecualian

#### 8.2 Verifikasi Fungsional (Sisa)

```
[ ] Verifikasi pembayaran kedaluwarsa/melepas slot sesuai kebijakan, serta idempotensi mutasi.
[ ] Verifikasi kalender publik bebas dari data pribadi dan AI hanya menjawab dari tool baca-saja.
[ ] Verifikasi kondisi error, notifikasi gagal, provider AI gagal, perangkat mobile, aksesibilitas.
```

Untuk setiap skenario, tulis di `docs/08-skenario-uat.md`:

| Skenario                           | Langkah                                            | Expected                                           | Actual | Status |
| ---------------------------------- | -------------------------------------------------- | -------------------------------------------------- | ------ | ------ |
| Expiry booking AWAITING_PAYMENT    | Set `PAYMENT_EXPIRY_MINUTES=1`, tunggu, cek status | Slot dilepas, status EXPIRED, notifikasi terkirim  | —      | ❌     |
| Kalender publik tanpa data pribadi | `GET /api/v1/buildings/:id/availability`           | Response hanya rentang waktu, tanpa nama/deskripsi | —      | ❌     |
| AI dengan tool mutasi              | Coba instruksi booking via AI                      | AI menolak, tidak ada data berubah                 | —      | ❌     |
| Error state pada mobile 375px      | Buka semua halaman di viewport 375px               | Semua state tampil benar, tidak ada overflow       | —      | ❌     |

#### 8.3 UAT, Dokumentasi & Rilis

```
[ ] Lakukan UAT bersama pengguna; simpan skenario, hasil, bukti, temuan.
[ ] Sahkan data gedung/tarif, kebijakan, dan konten publik sebelum pakai data produksi.
[x] Siapkan draft panduan pemohon, admin, approver, petugas; prosedur dukungan, backup, pemulihan, dan insiden. SOP/owner institusi serta latihan restore tetap menjadi task terpisah sebelum rilis.
[ ] Tinjau prototipe dengan calon pengguna; catat temuan dan iterasikan desain.
[ ] Rilis setelah seluruh blocker kebijakan dan operasional disetujui pemiliknya.
```

- UAT: gunakan matriks skenario di `docs/08-skenario-uat.md`; libatkan minimal 1 perwakilan tiap role
- Lengkapi `docs/07-panduan-operasional.md`: prosedur backup/restore, penanganan insiden, kontak darurat
- Peta inventaris gedung → tarif SK 1185/PL15/KPTS/2026: buat sebelum data produksi diisi
- **Rilis hanya boleh dilakukan** setelah semua blocker kebijakan di Seksi 1 mendapat pengesahan

---

## Checklist Progress Fase

Update setelah setiap fase selesai:

- [ ] **Fase 1** selesai — autentikasi production, object storage production, staging, retensi DB
- [ ] **Fase 2** selesai — validasi konsisten, syarat gedung endpoint, routing resmi, pembayaran lengkap, handover+assignment, notifikasi semua pemicu, audit lengkap
- [ ] **Fase 3** selesai — submit wizard penuh, konfirmasi halaman, dashboard per-role, session expired, state lengkap, aksesibilitas ≥90
- [ ] **Fase 4** selesai — `getProcedureInfo` tool, filter PII dokumentasi, error handling terverifikasi, disclaimer retensi di UI
- [ ] **Fase 5** selesai — audit dependency, 4 verifikasi sisa, UAT, panduan operasional lengkap, rilis

---

## Urutan Eksekusi yang Disarankan

```
Langsung kerjakan (tidak tergantung kebijakan institusi):
  1. 6.2 Buka (member)/akun/pengajuan/[id]/konfirmasi/page.js — lengkapi instruksi per kategori
  2. 6.3 Guard per capability di semua panel operator/approver/verifier/petugas
  3. 6.5 State handling lengkap (expired state, stale form); halaman not-found sudah ada
  4. 6.6 Aksesibilitas — Lighthouse audit + perbaikan target ≥90
  5. 5.1 Audit konsistensi validasi & error envelope semua route /api/v1
  6. 5.4 Endpoint bukti transfer (POST /api/v1/bookings/:id/payment/proof); rancangan expiry
  7. 5.5 Endpoint assign-staff (POST /api/v1/admin/bookings/:id/assign-staff)
  8. 5.6 Notifikasi pemicu yang belum ada (pembatalan setelah routing, expiry)
  9. 5.7 Audit: perubahan role, assign-staff, pembatalan, routing-config
  10. 7.1 Verifikasi/implementasikan tool getProcedureInfo
  11. 7.4 Disclaimer retensi percakapan di UI /bantuan
  12. 8.1 npm audit --omit=dev ulang di backend/ dan frontend/
  13. 8.2 Verifikasi fungsional sisa (4 skenario UAT)
  14. 8.3 UAT + panduan operasional + pemetaan tarif SK 1185 ke inventaris gedung
  15. 6.4 SessionExpiredModal (setelah provider auth diputuskan)

Tunggu keputusan institusi (buat stub dulu):
  - 3.1 Autentikasi production
  - 3.2 Object storage production
  - 3.3 Staging/domain
  - 4.1 Retensi resmi
  - 5.3 Routing assignment resmi (jabatan/delegasi)
  - 6.1 Submit wizard production
  - 1.x Semua keputusan kebijakan yang tersisa
```

---

## Referensi Dokumen

| Dokumen                  | Path                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| Product Requirements     | [`docs/VenueConnect_Polinela_PRD.md`](./VenueConnect_Polinela_PRD.md)                     |
| Analisis & Keputusan     | [`docs/00-analysis-and-decisions.md`](./00-analysis-and-decisions.md)                     |
| Struktur Proyek          | [`docs/01-project-structure.md`](./01-project-structure.md)                               |
| Database & Skema         | [`docs/02-database.md`](./02-database.md)                                                 |
| Backend & API            | [`docs/03-backend.md`](./03-backend.md)                                                   |
| Frontend & Halaman       | [`docs/04-frontend.md`](./04-frontend.md)                                                 |
| Style Guide & UI         | [`docs/05-styleguide-ui.md`](./05-styleguide-ui.md)                                       |
| System Diagrams          | [`docs/06-system-diagrams.md`](./06-system-diagrams.md)                                   |
| Panduan Operasional      | [`docs/07-panduan-operasional.md`](./07-panduan-operasional.md)                           |
| Skenario UAT             | [`docs/08-skenario-uat.md`](./08-skenario-uat.md)                                         |
| Baseline MVP             | [`docs/10-baseline-kebutuhan-mvp.md`](./10-baseline-kebutuhan-mvp.md)                     |
| Validasi Alur Prototipe  | [`docs/11-validasi-alur-prototipe.md`](./11-validasi-alur-prototipe.md)                   |
| Verifikasi Integrasi Dev | [`docs/12-verifikasi-integrasi-development.md`](./12-verifikasi-integrasi-development.md) |
| Security Advisory        | [`docs/SECURITY.md`](./SECURITY.md)                                                       |
| Task List                | [`docs/VenueConnect_Task_List.md`](./VenueConnect_Task_List.md)                           |

---

_Diperbarui dari `docs/VenueConnect_Task_List.md` — 2026-10-13. Status: 69/102 selesai (67,6%). Update checklist setiap task selesai._
