# Prompt Eksekusi UI — Implementasi Identik dengan Prototipe Statis VenueConnect

> **Tujuan:** Ubah seluruh UI frontend Next.js di `d:\PEOJECTTTTTTT\PUM\frontend\` agar **tampil identik** dengan prototipe HTML statis yang ada di folder `stitch_markdown_document_analyzer/`.
> Prototipe adalah **sumber kebenaran tunggal** untuk desain, layout, komponen, warna, tipografi, spacing, dan behavior visual.

---

## Referensi Wajib Dibaca Sebelum Mulai

| File                                                                                                                                                        | Tujuan                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`stitch_markdown_document_analyzer/index.html`](../stitch_markdown_document_analyzer/index.html)                                                           | Daftar semua layar dan navigasi antar layar                             |
| [`stitch_markdown_document_analyzer/academic_evergreen_task_first/DESIGN.md`](../stitch_markdown_document_analyzer/academic_evergreen_task_first/DESIGN.md) | **Design system resmi**: token warna, tipografi, spacing, komponen      |
| `stitch_markdown_document_analyzer/*/code.html`                                                                                                             | Source HTML setiap layar — **implementasikan komponen berdasarkan ini** |

---

## Sistem Desain (Wajib Diterapkan Konsisten)

### Palet Warna Utama (CSS Custom Properties)

```css
/* Warna primer & brand */
--color-primary: #245c4d;
--color-primary-hover: #173b32;
--color-on-primary: #ffffff;
--color-primary-container: #e8f2ee;
--color-on-primary-container: #173b32;
--color-secondary: #173b32;
--color-tertiary: #2f7662;

/* Surface */
--color-surface: #f6f8f7;
--color-surface-white: #ffffff;
--color-surface-container: #e8f2ee;
--color-page-canvas: #f6f8f7;
--color-brand-surface-tint: #e8f2ee;
--color-border-subtle: #d8e0e5;

/* Text */
--color-text-main: #1f2933;
--color-on-surface-variant: #5f6b76;
--color-outline: #5f6b76;

/* Status */
--color-status-info: #1e40af;
--color-status-info-surface: #dbeafe;
--color-status-warning: #854d0e;
--color-status-warning-surface: #fef3c7;
--color-status-success: #166534;
--color-status-success-surface: #dcfce7;
--color-status-danger: #991b1b;
--color-status-danger-surface: #fee2e2;
--color-status-muted: #374151;
--color-status-muted-surface: #e5e7eb;
--color-accent-warm: #b7791f;
--color-accent-warm-surface: #fff4d6;
```

### Tipografi

- **Font:** `Inter` dari Google Fonts (weights: 400, 500, 600, 700)
- **Icon:** `Material Symbols Outlined` dari Google Fonts

| Token                | Size | Weight | Line Height | Letter Spacing |
| -------------------- | ---- | ------ | ----------- | -------------- |
| `headline-xl`        | 36px | 600    | 44px        | -0.02em        |
| `headline-xl-mobile` | 28px | 600    | 36px        | -0.01em        |
| `headline-lg`        | 28px | 600    | 36px        | -0.02em        |
| `headline-md`        | 20px | 600    | 28px        | -0.01em        |
| `headline-sm`        | 18px | 600    | 24px        | —              |
| `body-lg`            | 16px | 400    | 24px        | —              |
| `body-lg-medium`     | 16px | 500    | 24px        | —              |
| `body-sm`            | 14px | 400    | 20px        | —              |
| `body-sm-medium`     | 14px | 500    | 20px        | —              |
| `label-md`           | 14px | 600    | 20px        | 0.01em         |
| `label-sm`           | 12px | 600    | 16px        | 0.02em         |
| `caption`            | 12px | 400    | 16px        | —              |

### Spacing & Layout

- **Grid max-width:** `1200px` centered
- **Desktop gutters:** `24px` (1.5rem)
- **Mobile gutters:** `16px` (1rem)
- **Base unit:** 4px/8px incremental
- **Breakpoints:** `md: 768px`, `lg: 1024px`
- **Touch target minimum:** `44px` tinggi & lebar

### Komponen — Spesifikasi Wajib

#### Button Primary

```css
background: #245c4d;
color: #ffffff;
min-height: 44px;
padding: 0 20px;
border-radius: 8px;
font-weight: 600;
font-size: 14px;
/* Hover: */
background: #173b32;
/* Focus ring: */
outline: 2px solid #2f7662;
outline-offset: 2px;
```

#### Button Secondary / Outline

```css
background: transparent;
border: 1px solid #d8e0e5;
color: #1f2933;
min-height: 44px;
border-radius: 8px;
/* Hover: */
background: #e8f2ee;
color: #245c4d;
```

#### Form Input

```css
background: #ffffff;
border: 1px solid #d8e0e5;
border-radius: 8px;
height: 44px;
padding: 0 14px;
font-size: 16px;
color: #1f2933;
/* Placeholder: */
color: #5f6b76;
/* Focus: */
border-color: #2f7662;
box-shadow: 0 0 0 2px rgba(47, 118, 98, 0.2);
```

#### Card (Venue / Dossier)

```css
background: #ffffff;
border: 1px solid #d8e0e5;
border-radius: 12px;
padding: 20px 24px;
box-shadow: 0 1px 3px 0 rgba(31, 41, 51, 0.04);
/* Hover: */
border-color: #2f7662;
box-shadow: 0 4px 6px -1px rgba(31, 41, 51, 0.07);
transition:
  border-color 200ms,
  box-shadow 200ms;
```

#### Badge Status

```css
display: inline-flex;
align-items: center;
gap: 4px;
height: 26px;
padding: 0 10px;
border-radius: 9999px;
font-weight: 600;
font-size: 12px;
```

| Status Label                       | Background | Text Color |
| ---------------------------------- | ---------- | ---------- |
| Disetujui / Confirmed              | `#DCFCE7`  | `#166534`  |
| Sedang diperiksa / Under Review    | `#DBEAFE`  | `#1E40AF`  |
| Menunggu Pembayaran                | `#DBEAFE`  | `#1E40AF`  |
| Terkirim / Menunggu Persetujuan    | `#FEF3C7`  | `#854D0E`  |
| Perlu Perbaikan                    | `#FEF3C7`  | `#854D0E`  |
| Ditolak                            | `#FEE2E2`  | `#991B1B`  |
| Dibatalkan / Kedaluwarsa / Selesai | `#E5E7EB`  | `#374151`  |

> ⚠️ **Aturan aksesibilitas:** Badge harus selalu disertai ikon Material Symbols (14px) DAN teks label bahasa Indonesia. Jangan bedakan status hanya dengan warna.

#### Navbar (Top Navigation)

```
- Sticky top, z-50, background #FFFFFF, border-bottom #D8E0E5
- Logo: ikon domain + "VenueConnect Polinela" (text-primary) + "UPT Fasilitas Kampus" (caption muted)
- Nav links desktop: hidden di mobile (md:flex), gap-8
- Active link: border-bottom-2 solid primary
- Tombol Masuk: Button Primary
- Badge notifikasi: unread count di pojok kanan atas ikon notifikasi
- Mobile: hamburger menu atau bottom nav
```

---

## Layar yang Harus Diimplementasikan

> Untuk setiap layar: baca `code.html` terkait sebagai **blueprint eksak**, lalu implementasikan sebagai halaman Next.js dengan data dari API yang sudah ada. Jangan ubah layout, warna, atau komponen — hanya sambungkan ke data nyata.

### Layar 1 — Beranda Publik

**File referensi:** [`beranda_publik_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/beranda_publik_venueconnect_polinela/code.html)
**Route Next.js:** `/` (`src/app/page.js`)

Komponen yang harus identik:

- [x] **Navbar** sticky dengan logo, nav links (Gedung, Jadwal, Prosedur, Bantuan/AI), tombol notifikasi, help, dan Masuk
- [x] **Hero section** — gradient `from-[#E8F2EE] via-page-canvas to-page-canvas`, badge "Portal Resmi", heading, deskripsi
- [x] **Quick Search Widget** — form 4-kolom (nama/area, tanggal, kapasitas, tombol Cari) di card putih dengan shadow
- [x] **Status strip** di bawah form — menampilkan WIB dan menjelaskan jadwal dimuat dari layanan ketika kalender dibuka atau rentang tanggal diubah (tanpa klaim realtime yang belum didukung)
- [x] **Section "3 Langkah Mudah"** — 3 card dengan nomor besar (01, 02, 03), ikon Material Symbols, judul, deskripsi
- [x] **Section "Gedung Pilihan"** — grid 3 kolom (desktop), 2 kolom (tablet), 1 kolom (mobile), data dari `GET /api/v1/buildings`
- [x] **Section "Prosedur Peminjaman"** — accordion/expandable berdasarkan kategori pemohon
- [x] **Section "Kalender Jadwal"** — FullCalendar embed atau summary 7 hari ke depan
- [x] **Footer** dengan logo dan link navigasi; kontak institusi menunggu sumber resmi sehingga tidak ditampilkan sebagai fakta
- [x] **CTA asisten AI** — mengikuti prototipe berupa banner CTA ke pusat bantuan, bukan tombol melayang

Data API:

- Gedung pilihan: `GET /api/v1/buildings?page=1&pageSize=6&isActive=true`
- Kalender: `GET /api/v1/availability?buildingId=...&start=...&end=...`

---

### Layar 2 — Katalog Gedung

**File referensi:** [`katalog_gedung_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/katalog_gedung_venueconnect_polinela/code.html)
**Route Next.js:** `/gedung` atau `/katalog` (`src/app/gedung/page.js`)

Komponen yang harus identik:

- [x] **Filter sidebar atau filter bar** — nama/area (text input), kapasitas minimum (select), fasilitas (checkbox multi-select), sewa luar kampus (toggle)
- [x] **Filter tersimpan di URL** — `?q=gsg&kapasitas=150&fasilitas=ac,proyektor`
- [x] **Grid gedung** — 3 kolom desktop, 2 tablet, 1 mobile; setiap card memiliki:
  - Gambar thumbnail 16:9 (placeholder jika kosong)
  - Badge "Sewa Publik Tersedia" (jika `isPublicRental=true`)
  - Nama gedung (headline-sm)
  - Lokasi/area (caption, ikon location_on)
  - Kapasitas (caption, ikon groups)
  - Daftar fasilitas utama (chip kecil)
  - Tarif terendah (jika ada)
  - Tombol "Lihat Detail" (ghost button)
- [x] **Pagination** — prev/next + nomor halaman, parameter `?page=N` di URL
- [x] **Empty state** — ilustrasi + teks jika tidak ada gedung ditemukan
- [x] **Loading skeleton** — tampil saat fetch berlangsung
- [x] **Error state** — dengan tombol retry

Data API: `GET /api/v1/buildings?page=1&pageSize=12&name=...&minCapacity=...&facilityIds=...`

---

### Layar 3 — Detail Gedung & Jadwal

**File referensi:** [`detail_gedung_jadwal_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/detail_gedung_jadwal_venueconnect_polinela/code.html)
**Route Next.js:** `/gedung/[id]` (`src/app/gedung/[id]/page.js`)

Komponen yang harus identik:

- [x] **Breadcrumb** — Beranda > Gedung > [Nama Gedung]
- [ ] **Gallery / Hero image** — gambar gedung full-width atau carousel
- [x] **Header gedung** — nama (headline-lg), lokasi, kapasitas, badge status aktif/nonaktif
- [x] **Tab navigation** — Informasi Umum | Fasilitas | Tarif | Jadwal | Syarat
- [x] **Tab: Informasi Umum** — deskripsi, spesifikasi (tabel), fasilitas icon grid
- [x] **Tab: Fasilitas** — daftar fasilitas dengan ikon, nama, keterangan khusus (jika ada) (menggunakan ikon umum karena API belum memiliki ikon per fasilitas)
- [x] **Tab: Tarif** — tabel tarif sewa luar kampus aktif yang diberikan API (nama tarif, satuan, harga IDR); hanya tampilkan `EXTERNAL`, tanpa `INTERNAL`/`ALL` sesuai keputusan pengguna 13 Oktober 2026
- [ ] **Tab: Jadwal** — kalender mini 30 hari dengan status: `AVAILABLE` (hijau), `BOOKED` (merah/abu), `BLOCKED` (abu gelap) (kalender API hanya menyediakan slot tidak tersedia; status tersedia belum dimodelkan)
- [x] **Tab: Syarat & Ketentuan** — teks dari API atau placeholder badge "Segera Tersedia"
- [x] **CTA sidebar / sticky bottom** — tombol "Ajukan Penggunaan" → `/pengajuan/baru?buildingId=...`
- [ ] **Loading state** per tab, **error state** dengan retry terpisah per section

Data API:

- Detail: `GET /api/v1/buildings/:id`
- Fasilitas: `GET /api/v1/buildings/:id/facilities`
- Tarif: `GET /api/v1/buildings/:id/rates`
- Ketersediaan: `GET /api/v1/buildings/:id/availability?start=...&end=...`
- Syarat: `GET /api/v1/buildings/:id/terms`

---

### Layar 4 — Wizard Pengajuan

**File referensi:** [`wizard_pengajuan_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/wizard_pengajuan_venueconnect_polinela/code.html)
**Route Next.js:** `/pengajuan/baru` (`src/app/pengajuan/baru/page.js`)

Komponen yang harus identik:

- [x] **Step indicator** 3 langkah — Kategori & Gedung | Rincian Kegiatan | Tinjau & Kirim
- [x] **Langkah 1: Kategori Pemohon** — radio pilihan (Mahasiswa, Dosen/Pegawai, Eksternal/Publik), konfirmasi gedung yang dipilih
- [ ] **Langkah 2: Rincian Kegiatan** — form field:
  - Nama kegiatan (required)
  - Deskripsi (textarea, max 2000 karakter, counter)
  - Tanggal mulai & selesai (date input)
  - Jam mulai & selesai (time input)
  - Estimasi peserta (number)
  - Kebutuhan fasilitas tambahan (checkbox)
  - Upload berkas (hanya mahasiswa): tipe PDF/JPG/PNG, maks 5MB, maks 5 file; tampilkan nama file setelah dipilih
- [x] **Langkah 3: Tinjau & Kirim** — ringkasan semua data (read-only), konfirmasi pernyataan kebenaran data (checkbox wajib), dan tombol Kirim Pengajuan yang tetap nonaktif sampai autentikasi serta API pengiriman resmi tersedia
- [x] **Navigasi wizard** — tombol Kembali / Lanjut, validasi per-step sebelum boleh Lanjut
- [x] **Validasi error** — inline per field rincian kegiatan, border merah, ikon error, dan teks helper
- [ ] **Loading state** saat submit — spinner di tombol, disable semua input
- [ ] **Error 409** — alert "Gedung sudah dipesan untuk waktu ini. Silakan pilih waktu lain."
- [ ] **Sukses** — redirect ke `/akun/pengajuan/[id]/konfirmasi`

---

### Layar 5 — Dashboard & Status Pemohon

**File referensi:** [`dashboard_pemohon_riwayat_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/dashboard_pemohon_riwayat_venueconnect_polinela/code.html)
**Route Next.js:** `/akun` dan `/akun/pengajuan` (`src/app/akun/`)

Komponen yang harus identik:

- [x] **Sidebar akun** atau **tab navigasi** — Ringkasan, Pengajuanku, Notifikasi, Profil (Profil menjelaskan autentikasi yang belum tersedia)
- [x] **Ringkasan** — statistik: total pengajuan, pending, dikonfirmasi, selesai (agregasi status per akun dari API)
- [x] **Daftar Pengajuan** — tabel/list dengan kolom: nama gedung, tanggal, status badge, tanggal submit; diurutkan terbaru
- [x] **Filter status** — All | Pending | Dikonfirmasi | Selesai | Ditolak
- [x] **Pagination** daftar
- [x] **Detail pengajuan** (`/akun/pengajuan/[id]`) — info lengkap booking, timeline status riwayat vertikal, tombol aksi (batalkan jika eligible)
- [ ] **Halaman konfirmasi submit** (`/akun/pengajuan/[id]/konfirmasi`) — ringkasan + instruksi langkah berikutnya per kategori pemohon

Data API:

- List: `GET /api/v1/bookings?page=1&limit=20`
- Detail: `GET /api/v1/bookings/:id`
- Cancel: `POST /api/v1/bookings/:id/cancel`

---

### Layar 6 — Antrean & Review Operator

**File referensi:** [`dashboard_operator_review_antrean_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/dashboard_operator_review_antrean_venueconnect_polinela/code.html)
**Route Next.js:** `/admin` dan `/admin/review` (`src/app/admin/`)

Komponen yang harus identik:

- [x] **Sidebar operator** — Dashboard, Antrean Review, Master Gedung, Pembayaran, Handover
- [x] **Dashboard admin** — ringkasan statistik (total gedung, booking per status, booking aktif)
- [ ] **Antrean review** — list booking PENDING_REVIEW dengan:
  - Chip kategori pemohon (Mahasiswa/Dosen/Eksternal) dengan warna berbeda
  - Nama gedung, tanggal, durasi
  - Badge status
  - Tombol "Tinjau" → buka detail
- [x] **Detail booking (read-only)** — informasi lengkap booking tanpa data pribadi berlebih
- [ ] **Panel keputusan** — Setujui / Tolak dengan field catatan wajib, tombol konfirmasi (sengaja tetap nonaktif sampai assignment dan capability operator ditetapkan)
- [x] **Filter & sort** antrean: status, kategori, tanggal
- [x] **Pagination** antrean (sebelumnya/berikutnya dengan total halaman API)

Data API:

- Dashboard: `GET /api/v1/admin/stats`
- Antrean: `GET /api/v1/admin/bookings?status=PENDING_REVIEW`
- Detail: `GET /api/v1/admin/bookings/:id`
- Approve: `POST /api/v1/admin/bookings/:id/approve`
- Reject: `POST /api/v1/admin/bookings/:id/reject`

---

### Layar 7 — Master Gedung, Tarif, Jadwal & Pembayaran

**File referensi:** [`admin_master_tarif_pembayaran_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/admin_master_tarif_pembayaran_venueconnect_polinela/code.html)
**Route Next.js:** `/admin/gedung` dan `/admin/pembayaran`

Komponen yang harus identik:

- [x] **List gedung admin** — semua status (aktif/nonaktif), pagination
- [x] **Form tambah/edit gedung** — nama, deskripsi, lokasi, kapasitas, status aktif, izin sewa publik
- [x] **Management fasilitas** per gedung — pasang/lepas fasilitas, edit detail khusus gedung
- [x] **Management tarif** per gedung — CRUD tarif (nama, satuan, harga, audience, tanggal berlaku)
- [x] **Blokir kalender** — form tambah blokir (gedung, rentang waktu, alasan), daftar blokir aktif, hapus blokir
- [ ] **Antrean verifikasi pembayaran** — list PENDING_VERIFICATION dengan detail: gedung, tanggal, nominal, link bukti transfer
- [ ] **Aksi verifikasi** — modal konfirmasi + input catatan, tombol Verifikasi / Tolak

Data API: Gunakan endpoint `/api/v1/admin/buildings/*`, `/api/v1/admin/rates/*`, `/api/v1/admin/blocks/*`, `/api/v1/admin/payments/*`

---

### Layar 8 — Serah-Terima & Penyelesaian

**File referensi:** [`operasional_serah_terima_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/operasional_serah_terima_venueconnect_polinela/code.html)
**Route Next.js:** `/admin/handover`

Komponen yang harus identik:

- [x] **List booking CONFIRMED** yang akan/sedang berlangsung — nama gedung, tanggal, waktu, pemohon (tanpa detail pribadi)
- [x] **Panel serah-terima** — tanggal mulai penggunaan, tombol "Serahkan Kunci", catatan kondisi awal
- [x] **Panel pengembalian** — catatan kondisi akhir, tombol "Terima Kembali"
- [x] **Tombol Selesaikan** — tutup booking, status → COMPLETED
- [x] **Riwayat handover** — log waktu serah & kembali per booking

Data API: `POST /api/v1/admin/handover/:bookingId/handover`, `/return`, `/complete`

---

### Layar 9 — Masuk & Autentikasi

**File referensi:** [`masuk_autentikasi_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/masuk_autentikasi_venueconnect_polinela/code.html)
**Route Next.js:** `/masuk` dan `/daftar`

Komponen yang harus identik:

- [x] **Halaman `/masuk`** — form email + password, tombol Masuk, link Daftar, info "Autentikasi belum aktif" dengan penjelasan jelas (field dan tombol dinonaktifkan agar tidak mengirim data)
- [x] **Halaman `/daftar`** — form nama, email, password, konfirmasi password, pilihan kategori, info yang sama (field dan tombol dinonaktifkan agar tidak mengirim data)
- [x] **Layout split** atau **card centered** sesuai prototipe
- [x] Tampilkan **banner informasi** yang menjelaskan sistem dalam pengembangan (sesuai prototipe)

---

### Layar 10 — Pusat Bantuan & Asisten AI

**File referensi:** [`pusat_bantuan_asisten_ai_venueconnect_polinela/code.html`](../stitch_markdown_document_analyzer/pusat_bantuan_asisten_ai_venueconnect_polinela/code.html)
**Route Next.js:** `/bantuan`

Komponen yang harus identik:

- [x] **FAQ accordion** — pertanyaan umum dengan expand/collapse
- [x] **Chat interface** — input teks, tombol kirim, bubble chat (user kiri, AI kanan)
- [x] **Disclaimer** — "Keputusan akhir pada pengelola. Jawaban bersifat informasi, bukan konfirmasi resmi."
- [x] **Fallback** jika AI tidak tersedia — teks informatif + link ke katalog/jadwal
- [x] **Loading state** saat AI memproses — typing indicator atau spinner
- [x] **Jangan simpan** riwayat chat ke database maupun penyimpanan browser; percakapan hanya berada pada state halaman sesuai kebijakan privasi proyek

---

## Kalender Jadwal (FullCalendar)

**File referensi:** Section kalender di prototipe beranda dan detail gedung
**Route Next.js:** `/jadwal` dan embed di `/gedung/[id]`

- [x] Gunakan library **FullCalendar** yang sudah terpasang
- [x] Tampilkan slot dari `GET /api/v1/availability` per rentang tampilan
- [x] Warna event: Hijau = tersedia, Abu = dipesan/diblokir
- [x] **Jangan tampilkan** nama pemohon, nama acara, atau data pribadi — hanya "Sudah dipesan"
- [x] Navigasi bulan/minggu, tombol Today
- [x] Mobile: tampilan agenda list
- [x] Loading state, empty state, error state dengan retry

---

## Komponen Bersama (Shared Components)

Buat dan gunakan komponen reusable berikut di semua layar:

```
src/components/
├── ui/
│   ├── Button.js           — Primary, Secondary, Ghost variants
│   ├── Badge.js            — Status badge dengan ikon + label
│   ├── Card.js             — Venue card dan dossier card
│   ├── Input.js            — Form input dengan label, error state
│   ├── Select.js           — Dropdown select
│   ├── Skeleton.js         — Loading placeholder
│   ├── EmptyState.js       — Empty state dengan ikon dan pesan
│   ├── ErrorBoundary.js    — Error boundary dengan retry
│   └── Modal.js            — Dialog/modal overlay
├── layout/
│   ├── Navbar.js           — Top navigation bar
│   ├── Footer.js           — Footer publik
│   ├── AdminSidebar.js     — Sidebar operator/admin
│   └── AccountSidebar.js   — Sidebar akun pemohon
└── features/
    ├── BuildingCard.js     — Card gedung untuk katalog
    ├── StatusBadge.js      — Badge status booking
    ├── BookingTimeline.js  — Timeline riwayat status
    └── NotificationBadge.js — Badge unread count
```

---

## Aturan Implementasi

1. **Prototipe adalah sumber kebenaran** — jika ada ketidaksesuaian antara prototipe dan dokumen lain, ikuti prototipe HTML.
2. **Jangan mengubah warna atau spacing** dari yang ada di prototipe tanpa alasan aksesibilitas yang valid.
3. **Sambungkan ke API yang sudah ada** — jangan mock data jika endpoint sudah tersedia.
4. **Responsif wajib** — tampil benar di 375px (mobile), 768px (tablet), 1280px (desktop).
5. **Setiap layar wajib punya** loading skeleton, empty state, dan error state.
6. **Waktu selalu WIB** (`Asia/Jakarta`), format: "11 Okt 2026, 09:00 WIB".
7. **Mata uang selalu IDR** tanpa desimal: "Rp 1.500.000".
8. **Status badge selalu** disertai ikon Material Symbols + teks label Indonesia.
9. **Fokus keyboard** wajib terlihat di semua elemen interaktif (outline `#2F7662`, 2px offset).
10. **Data pribadi** jangan ditampilkan di kalender publik dan antrean admin.
11. **Setelah tiap layar selesai** — update checklist di `docs/VenueConnect_Task_List.md`.

---

## Urutan Implementasi yang Disarankan

```
Fase A — Design System & Shared Components
  1. Setup CSS custom properties (token warna, tipografi)
  2. Komponen ui/: Button, Badge, Input, Card, Skeleton, EmptyState, Modal
  3. Layout: Navbar, Footer, AdminSidebar, AccountSidebar

Fase B — Layar Publik
  4. Beranda (/) — Hero, Quick Search, 3 Langkah, Gedung Pilihan
  5. Katalog (/gedung) — Grid + filter + pagination
  6. Detail Gedung (/gedung/[id]) — Tabs + kalender
  7. Kalender (/jadwal)
  8. Masuk & Daftar (/masuk, /daftar)
  9. Bantuan & AI (/bantuan)

Fase C — Alur Pemohon
  10. Wizard Pengajuan (/pengajuan/baru)
  11. Konfirmasi Submit (/akun/pengajuan/[id]/konfirmasi)
  12. Dashboard & Riwayat Pemohon (/akun/pengajuan)
  13. Detail Pengajuan (/akun/pengajuan/[id])

Fase D — Panel Admin/Operator
  14. Dashboard Admin (/admin)
  15. Antrean Review (/admin/review)
  16. Master Gedung & Tarif (/admin/gedung)
  17. Verifikasi Pembayaran (/admin/pembayaran)
  18. Serah-Terima (/admin/handover)
```

---

_Dibuat dari prototipe di `stitch_markdown_document_analyzer/` — 2026-10-11. Prototipe HTML adalah sumber kebenaran desain._
