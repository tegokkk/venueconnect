# Rancangan Database VenueConnect Polinela

> PostgreSQL dan Prisma ORM mengikuti proposal. Schema, client Prisma dan migration ditempatkan pada backend/prisma karena backend menjadi satu-satunya aplikasi yang mengakses database.

## Prinsip data

- PostgreSQL menjadi sumber kebenaran gedung, jadwal, pengajuan, tarif, keputusan, pembayaran dan penggunaan.
- Waktu disimpan sebagai timestamptz/UTC; ditampilkan dalam Asia/Jakarta.
- Gunakan foreign key, constraint, transaksi dan migration terlacak.
- Simpan snapshot tarif agar perubahan tarif tidak mengubah booking lama.
- Kalender publik tidak memuat identitas pemohon, kontak atau detail acara.
- Jangan simpan percakapan AI secara default atau API key di database.

## Lokasi berkas database

    backend/
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.js
    └── src/server/
        ├── db/prisma.js
        └── repositories/

Frontend tidak boleh mengimpor Prisma atau membuka koneksi PostgreSQL. Semua akses melewati API backend.

## ERD ringkas

    User ──< Booking >── Building ──< BuildingRate
     │          │            ├──< BuildingBlock
     │          │            └──< BuildingFacility >── Facility
     │          ├──< Approval
     │          ├──< Payment
     │          └── UsageHandover
     ├──< UserRole >── Role
     └──< AuditEvent

## Model data

### User dan Role

User: id UUID, email unik, nama, phone nullable, userType INTERNAL/EXTERNAL, `accountCategory` nullable untuk akun lama, status aktif, timestamps. Kategori akun ditetapkan oleh provisioning data uji dan harus cocok dengan `applicantCategory` booking; browser tidak boleh menetapkannya sendiri. Akun lama tanpa kategori tidak dapat membuat booking baru sampai dipetakan. Validasi identitas mahasiswa/dosen/pegawai oleh institusi masih menunggu keputusan autentikasi. Nomor mahasiswa/NIP hanya disimpan bila diperlukan dan disetujui.

Role menyimpan ADMIN, APPROVER, PAYMENT_VERIFIER, BUILDING_OFFICER dan MEMBER bila diperlukan. UserRole menghubungkan akun dengan peran. Assignment approver per gedung dapat ditambahkan jika dibutuhkan.

Kredensial sebaiknya ditangani provider autentikasi. Jangan simpan password mentah.

### Building

id, slug unik, name, description, `termsAndConditions` nullable sebagai draf privat, `termsApprovalReference` nullable, `termsPublishedAt` nullable, location, capacity, isActive, `internalLoanEnabled`, `publicRentalEnabled`, createdAt, updatedAt. Satu GSG dapat bernilai true untuk kedua jalur sehingga bentrok jadwal memakai ID yang sama; ruang sewa lainnya false untuk peminjaman. Syarat hanya tampil publik jika teks, referensi pengesahan, dan waktu terbit semuanya ada; mengubah teks atau referensi mencabut status terbit. Gedung yang memiliki booking dinonaktifkan, bukan dihapus.

### Facility dan BuildingFacility

Facility menyimpan daftar fasilitas terstandardisasi. BuildingFacility adalah relasi many-to-many dengan buildingId, facilityId, dan detail opsional.

### BuildingRate

id, buildingId, audienceType INTERNAL/EXTERNAL/ALL, amount Decimal, currency IDR, unit, validFrom, validUntil, isActive, `isBookable`, `maxDurationMinutes` nullable, approvedById, timestamps. Hanya `EXTERNAL` dipakai sebagai tarif sewa luar kampus pada API publik. Opsi `isBookable=false` tetap terlihat sebagai informasi tetapi tidak dipakai sebagai snapshot/tagihan otomatis; satu gedung hanya boleh memiliki satu tarif aktif bookable untuk audience dan periode yang sama. `INTERNAL`/`ALL` tetap sebagai kategori data administrasi lama, tidak ditampilkan publik dan tidak dipakai untuk pengajuan baru. Peminjaman civitas akademika Polinela tidak mengambil snapshot tarif sewa. Perhitungan jam/minggu/bulan/orang masih memerlukan kebijakan.

Booking sewa menyimpan snapshot jumlah, unit, mata uang dan label tarif yang berlaku.

### Booking

id UUID, publicReference unik, requesterId, buildingId, bookingType, `applicantCategory` nullable untuk record lama, eventName, eventDescription nullable, startsAt, endsAt, attendeeCount nullable, status, timestamps, cancelledAt nullable, snapshot tarif nullable. Pengajuan baru wajib mengisi kategori `MAHASISWA`, `DOSEN_PEGAWAI`, atau `UMUM` yang cocok dengan `User.accountCategory`; mahasiswa dibuat sebagai `DRAFT` sampai satu PDF disimpan lalu dikirim.

Validasi endsAt > startsAt. Simpan hanya data yang diperlukan. Bila upload disetujui, metadata disimpan di database dan file pada object storage privat.

### ApprovalStep dan ApprovalHistory

ApprovalStep menyimpan bookingId, stepNumber, assigneeId/role, dan status tahap aktif. ApprovalHistory menyimpan setiap keputusan sebagai record immutable: stepId, actorId, outcome, note dan decidedAt. Jangan menimpa keputusan lama saat revisi atau penugasan ulang.

### Payment

id, bookingId, amount, currency, method nullable, reference nullable, `reviewNote` nullable, status, verifiedById nullable, verifiedAt nullable, dueAt nullable, timestamps. Gateway belum dipilih. Pencatatan transfer manual pada lingkungan uji mengambil jumlah/mata uang dari snapshot tarif, bukan input pemohon.

### BuildingBlock

id, buildingId, startsAt, endsAt, reason, createdById, timestamps. Untuk pemeliharaan/kegiatan resmi.

### UsageHandover

id, bookingId unik, officerId, keyGivenAt, keyReturnedAt nullable, conditionBefore/After nullable, notes, timestamps.

### AuditEvent

id, actorId nullable, action, entityType, entityId, createdAt, requestId nullable, metadata tersaring. Jangan merekam token, password, API key atau isi dokumen pribadi.

## Enum awal

- UserType: INTERNAL, EXTERNAL
- BookingType: INTERNAL, RENTAL
- BookingStatus: DRAFT, SUBMITTED, UNDER_REVIEW, REVISION_REQUESTED, AWAITING_APPROVAL, AWAITING_PAYMENT, CONFIRMED, REJECTED, CANCELLED, COMPLETED, EXPIRED
- ApprovalStatus: PENDING, APPROVED, REJECTED, REVISION_REQUESTED
- PaymentStatus: UNPAID, PENDING_VERIFICATION, VERIFIED, FAILED, EXPIRED, REFUNDED

Status draft, revisi, expired dan pembayaran adalah rancangan awal; validasi nama/status dengan prosedur Polinela. Perubahan status hanya melalui transisi bisnis yang diizinkan.

## Indeks dan constraint

- Booking(buildingId, startsAt, endsAt, status) untuk kalender/konflik.
- Booking(requesterId, createdAt) untuk riwayat pemohon.
- ApprovalStep(assigneeId, status) untuk antrean approver.
- BuildingRate(buildingId, isActive, validFrom, validUntil) untuk tarif berlaku.
- Foreign key seluruh relasi dan constraint endsAt > startsAt.
- Gunakan soft-disable untuk gedung dengan transaksi; jangan hapus sejarah.

## Menjaga jadwal agar tidak bentrok

Pemeriksaan UI saja tidak cukup. Terapkan perlindungan database atas gedung dan rentang setengah terbuka [start, end), pada status yang memblokir slot:

    CREATE EXTENSION IF NOT EXISTS btree_gist;
    ALTER TABLE "Booking"
      ADD CONSTRAINT booking_no_overlapping_confirmed_slot
      EXCLUDE USING gist (
        "buildingId" WITH =,
        tstzrange("startsAt", "endsAt", '[)') WITH &&
      ) WHERE ("status" IN ('AWAITING_PAYMENT', 'CONFIRMED'));

Nama tabel, kolom dan enum disesuaikan dengan mapping Prisma. Baseline yang diusulkan mengunci AWAITING_PAYMENT dan CONFIRMED, bukan booking yang masih menunggu pemeriksaan/persetujuan. Pengelola perlu mengesahkan kebijakan hold sebelum produksi. Jika extension tidak tersedia, gunakan transaksi SERIALIZABLE dengan retry atau advisory lock per gedung dan lakukan pengecekan ulang.

## Migration, seed dan backup

- Setiap perubahan schema dikirim sebagai Prisma migration yang dapat ditinjau.
- Seed lokal bersifat idempoten dan tidak menghapus booking. Seed mengaktifkan 15 ruang/gedung pratinjau: empat gedung awal untuk peminjaman, GSG juga untuk sewa, dan sebelas ruang/layanan baru untuk sewa luar kampus. Alamat hanya diisi untuk empat gedung awal; 18 opsi harga `EXTERNAL` berasal dari tabel pengguna, bukan nominal rekaan. Opsi yang memerlukan hitungan jam/orang/minggu/bulan atau identitas ruang spesifik ditandai informasi saja (`isBookable=false`). Gedung lain dinonaktifkan tanpa menghapus riwayat. Rincian ada di `docs/15-inventaris-peminjaman-penyewaan.md`.
- Jangan membuat akun admin produksi dengan password hard-coded.
- Tentukan backup, retensi, penghapusan dan pemulihan sebelum produksi.

Tujuh Prisma migration sampai `20261013120000_building_purpose_and_rate_bookable` telah diterapkan pada PostgreSQL 15 native development tanggal 2026-10-13, lalu seed 15 ruang/gedung dan 18 opsi harga berhasil. Integrasi API penuh yang lulus pada 2026-10-12 memakai cluster development sementara yang berbeda; alur itu belum diuji ulang pada database native baru. Database ini hanya untuk pengembangan dan berisi data uji. Jangan arahkan `migrate deploy` ke database produksi sebelum kebijakan dan data legacy ditinjau.

## Status kanonik dan riwayat

Status booking kanonik ditetapkan pada 00-analysis-and-decisions.md. Lifecycle: DRAFT ke SUBMITTED ke UNDER_REVIEW, lalu REVISION_REQUESTED atau AWAITING_APPROVAL; hasil akhir internal menjadi CONFIRMED, sedangkan hasil akhir sewa menjadi AWAITING_PAYMENT lalu CONFIRMED setelah pembayaran diverifikasi. REJECTED, CANCELLED, atau EXPIRED melepaskan slot; COMPLETED menutup booking setelah penggunaan.

Gunakan BookingStatusHistory untuk setiap transisi booking dengan actorId, fromStatus, toStatus, note dan createdAt. Notification menyimpan notifikasi in-app per user, jenis, resource, readAt dan createdAt.

Booking perlu field tambahan sesuai kebijakan: paymentDueAt nullable, cancellationReason nullable, snapshot tarif, timezoneId untuk display (default Asia/Jakarta), createdAt dan updatedAt. Jangan menyimpan data pribadi tambahan tanpa tujuan proses.

## Status pengunci slot

Exclusion constraint dan query availability harus konsisten dengan status kanonik: AWAITING_PAYMENT dan CONFIRMED mengunci waktu; status lain tidak. Sewa yang disetujui masuk AWAITING_PAYMENT dan mendapat paymentDueAt. Bila pembayaran kedaluwarsa, booking menjadi EXPIRED. Booking internal yang memperoleh keputusan akhir menjadi CONFIRMED. Ini menggantikan penggunaan APPROVED yang ambigu sebagai status booking.

### BookingStatusHistory dan Notification

BookingStatusHistory: id, bookingId, actorId nullable, fromStatus, toStatus, note nullable, createdAt. Satu row dibuat untuk setiap transisi. Notification: id, userId, type, title, body, resourceType, resourceId, readAt nullable, createdAt. Notification menyimpan inbox in-app; jangan jadikan email/SMS bagian MVP sebelum kanal disahkan.

Indeks tambahan: BookingStatusHistory(bookingId, createdAt), Notification(userId, readAt, createdAt), BuildingBlock(buildingId, startsAt, endsAt). Terapkan retensi sesuai keputusan institusi.
# Retensi dan penghapusan data

> **[MENUNGGU PENGESAHAN INSTITUSI]** Retensi booking, lampiran, audit, dan salinan backup belum ditetapkan. Jangan gunakan angka retensi sementara sebagai kebijakan produksi. Pemilik proses dan tim TI perlu menetapkan masa simpan, pemicu penghapusan/anonimisasi, legal hold, akses arsip, serta bagaimana backup kedaluwarsa mengikuti penghapusan sebelum fitur data nyata dirilis.

