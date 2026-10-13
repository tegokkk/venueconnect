# Koreksi timestamp PostgreSQL development

Tanggal: 13 Oktober 2026. Ini catatan teknis development, bukan penetapan timezone produk oleh institusi.

## Temuan dan perbaikan

Adapter `@prisma/adapter-pg` yang dipakai proyek menormalisasi nilai `timestamptz` saat membaca. Dengan sesi PostgreSQL `Asia/Bangkok`, nilai `Date` yang ditulis Prisma tersimpan tujuh jam lebih awal di database, walau putaran baca lewat Prisma dapat tampak benar. Pada saat yang sama, `createdAt` yang diisi PostgreSQL melalui `DEFAULT now()` sudah menyimpan instan yang benar. Perbedaan asal nilai ini membuat pergeseran massal seluruh kolom waktu berbahaya.

Koneksi Prisma runtime dan seed sekarang menetapkan `options: '-c TimeZone=UTC'`. Backend perlu dimulai ulang setelah perubahan tersebut. Seed tarif `EXTERNAL` memakai instan awal berlaku 21 Agustus 2026 pukul 00.00 WIB (`2026-08-20T17:00:00.000Z`), sesuai tanggal berlakunya SK 1185/PL15/KPTS/2026. Semua 18 baris tarif development telah di-seed ulang; nilai mentah database menunjukkan instan tersebut.

## Data uji yang telanjur tersimpan

Sebelum koreksi sesi, 12 booking sintetis hasil `test/integration.dev.mjs` tersimpan dengan jam acara bergeser. `scripts/repair-local-demo-timezone.mjs` memeriksa target database lokal `venueconnect_db`, menolak lingkungan production, menolak booking non-demo atau blokir gedung, serta mengharuskan pola jam fixture yang seragam. Setelah pemeriksaan, transaksi mengoreksi kolom waktu yang diisi aplikasi pada booking dan record terkait. Kolom `createdAt` dengan `DEFAULT now()` tidak digeser. Eksekusi pertama menghasilkan `DEMO_TIMEZONE_REPAIR_OK bookings=12`; eksekusi kedua menghasilkan `DEMO_TIMEZONE_REPAIR_SKIP bookings=12`.

Skrip ini **hanya untuk fixture lokal tersebut**. Jangan menjalankannya pada staging/production atau database dengan transaksi nyata. Bila data nyata pernah ditulis saat sesi non-UTC, inventaris setiap kolom dan asal penulisan, ambil backup yang dapat dipulihkan, lalu susun koreksi tersendiri dengan pemilik data sebelum menerapkannya.

## Pemeriksaan operasional

1. Pastikan koneksi aplikasi Prisma memakai sesi UTC; format tanggal pada UI tetap mengikuti `NEXT_PUBLIC_APP_TIME_ZONE` yang masih merupakan nilai pratinjau.
2. Bandingkan instan ISO yang dikirim API dengan nilai mentah PostgreSQL pada booking uji baru. Tampilan lokal 09.00 WIB harus bersesuaian dengan `02:00:00Z` di database.
3. Jalankan integrasi API development dan periksa ulang konflik kalender serta tanggal berlaku tarif sesudah perubahan sesi.

Keputusan resmi timezone dan aturan publikasi jadwal tetap berada pada task #11 di `VenueConnect_Task_List.md`.
