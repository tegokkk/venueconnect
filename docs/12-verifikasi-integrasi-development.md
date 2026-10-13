# Verifikasi integrasi development — 12–13 Oktober 2026

## Lingkungan dan batas

- PostgreSQL 15 development lokal pada `localhost:5432/venueconnect_db`; enam Prisma migration terpasang saat verifikasi awal. Pembaruan inventaris dan draf syarat 13 Oktober menambah migration ketujuh dan kedelapan (lihat bagian terbaru di bawah).
- Seed akun dan gedung demo saat integrasi awal. Data pengajuan yang dibuat skrip uji tetap berada di database lokal lama agar riwayat dan audit bisa diperiksa saat itu. Setelah pengguna menetapkan lingkup empat gedung, seed dan skrip integrasi diperbarui: CB, QB, Sakura, GSG; tarif simulasi tes dibuat sementara dan dihapus setelah tes. Pembaruan ini kemudian diterapkan pada PostgreSQL 15 native baru tanggal 13 Oktober 2026, tanpa menyalin data uji dari cluster sementara lama.
- Backend pada `localhost:3001`; frontend pada `localhost:3000`. Frontend meneruskan `/api/v1` ke backend lewat `BACKEND_API_ORIGIN`.
- Pemeriksaan satu kali `node scripts/check-health.mjs` pada 13 Oktober 2026 keluar kode 0 (`HEALTH_OK db=connected`). Ini belum membuktikan pemantauan dan alert staging/production.
- Semua tindakan memakai akun demo dan waktu masa depan. Hasil ini tidak mengesahkan data, kebijakan, atau kesiapan produksi.

## Pembaruan PostgreSQL native — 13 Oktober 2026

- Layanan Windows `postgresql-x64-15` berjalan pada `localhost:5432`. Koneksi dengan `DATABASE_URL` development sebagai role `venueconnect` ke database `venueconnect_db` berhasil setelah pengguna menyelaraskan kredensial secara lokal; password tidak dicatat.
- `npm run db:deploy` berhasil menerapkan keenam migration, dari `20261008120000_initial` sampai `20261012140000_user_account_category`. `npm run db:seed` berhasil pada database development baru.
- Query baca-saja setelah seed menemukan tepat empat baris Building aktif: `gedung-cb`, `gedung-qb`, `gedung-sakura`, dan `gedung-gsg`, semuanya memiliki alamat yang diberikan pengguna serta `publicRentalEnabled=true`. `BuildingRate` berisi 0 baris; kapasitas/tarif tidak dibuat-buat.
- Ini membuktikan migrasi, seed, dan isi dasar database pada pemeriksaan awal. Integrasi API pada database native kemudian dijalankan ulang setelah inventaris dan migration kedelapan, seperti dicatat di bawah. UAT belum dilakukan.

## Pembaruan inventaris peminjaman/penyewaan — 13 Oktober 2026

- Setelah pengguna memberikan cuplikan tabel tarif dan memastikan GSG untuk kedua alur, migration `20261013120000_building_purpose_and_rate_bookable` berhasil diterapkan pada PostgreSQL lokal. Prisma Client 7.10.0 berhasil dibuat ulang.
- Seed development berhasil dijalankan dengan keluaran: **15 ruang/gedung aktif, 4 dapat dipinjam, 12 dapat disewa, 18 opsi harga luar kampus**. GSG berbagi satu ID gedung untuk kedua alur. Berkas seed kini idempoten berdasarkan slug gedung dan nama tarif per gedung.
- Tarif paket orang/jam/minggu/bulan, ruang fisik generik, dan tambahan kursi diberi `isBookable=false`; nilainya dapat dibaca tetapi tidak dipakai sebagai tagihan otomatis. Tarif tetap yang dapat diajukan dibatasi maksimum 8 jam pada booking development.
- Pembaruan ini membuktikan generate, penerapan migration, dan eksekusi seed berhasil. Build backend dan frontend dengan Next.js 16.4.0 juga berhasil dikompilasi. Integrasi API kemudian dijalankan ulang pada database native; pemeriksaan browser menyeluruh dan UAT setelah perubahan ini belum dilakukan. Rincian data dan batas sumber ada di `docs/15-inventaris-peminjaman-penyewaan.md`.

## Pembaruan draf syarat — 13 Oktober 2026

- Migration `20261013150000_building_terms_publication` dan Prisma Client berhasil diterapkan/dibuat ulang pada PostgreSQL development lokal. Syarat yang disimpan tetap privat sampai memiliki referensi pengesahan dan waktu terbit.
- Panel admin development kini menerima draf teks dan referensi, dengan pilihan terbit eksplisit. Perubahan teks atau referensi mencabut status terbit. Belum ada syarat resmi yang dimasukkan; endpoint publik tetap berstatus `PENDING_POLICY` pada data seed.
- Build backend dan frontend setelah perubahan draf syarat berhasil. Integrasi API native membuktikan syarat tanpa pengesahan tidak ditampilkan. `node backend/test/terms-publication.dev.mjs` kemudian lulus pada database development: draf tersembunyi dari publik tetapi terlihat oleh admin, terbit setelah aksi eksplisit, dan otomatis tidak terbit lagi saat teks berubah. Data syarat GSG dikembalikan ke nilai kosong pada blok `finally`. Ini belum menjadi bukti persetujuan institusi atau kesiapan produksi.

## Integrasi API pada PostgreSQL native — 13 Oktober 2026

- `npm run test:integration` pada backend lulus menggunakan PostgreSQL 15 development native setelah seed inventaris dan migration kedelapan. Skrip membatasi target ke localhost dan memakai akun serta PDF sintetis; data uji booking tetap ada pada database development.
- Respons katalog berisi 15 entri aktif, tepat empat untuk peminjaman internal dan 12 untuk sewa luar kampus. Semua tarif yang tampil pada katalog bertipe `EXTERNAL`; GSG dapat dipakai kedua alur. Syarat tanpa pengesahan tetap `PENDING_POLICY`.
- Alur mahasiswa mencakup draf, unggah dan unduh PDF privat, penolakan akses lintas akun, submit, revisi berkas, dan konfirmasi tanpa approval WD III. Alur pegawai mencakup antrean approver, keputusan, dan override ADMIN yang diaudit. Alur sewa mencakup referensi transfer idempoten, verifikasi, serah-terima/pengembalian, dan penyelesaian.
- Dua konfirmasi bersamaan pada satu slot menghasilkan satu sukses dan satu HTTP 409. Pemeriksaan audit dokumen memastikan isi PDF tidak tersimpan dalam metadata audit. Ini bukti integrasi development, bukan UAT dengan pengguna atau validasi kebijakan institusi.

## Koreksi sesi timezone PostgreSQL — 13 Oktober 2026

- Pemeriksaan nilai mentah database menemukan `Date` yang ditulis adapter Prisma pada sesi `Asia/Bangkok` tersimpan tujuh jam lebih awal, walau baca ulang melalui adapter dapat tampak benar. Koneksi Prisma runtime dan seed kemudian diberi opsi sesi `TimeZone=UTC`; backend dimulai ulang dan 18 tarif `EXTERNAL` di-seed ulang dengan awal berlaku `2026-08-20T17:00:00.000Z` (21 Agustus 2026 pukul 00.00 WIB).
- Dua belas booking sintetis hasil integrasi sebelum perbaikan dikoreksi sekali dalam transaksi oleh `scripts/repair-local-demo-timezone.mjs`, dengan guard localhost, nama database, identitas fixture, pola jam, dan tanpa blokir gedung. Eksekusi berikutnya melewati data yang sudah benar (`DEMO_TIMEZONE_REPAIR_SKIP bookings=12`). Skrip tidak berlaku untuk transaksi riil atau lingkungan produksi. Detail asal nilai dan batas koreksi ada di `docs/18-timezone-data-development.md`.
- Integrasi API setelah backend di-restart lulus melalui proxy `localhost:3000/api/v1`. Pada booking baru `82ab21bc-583c-4c62-b5cd-daea4070c8b4`, PostgreSQL mentah dan GET API sama-sama mengembalikan mulai `2026-12-06T02:00:00.000Z` dan selesai `2026-12-06T04:00:00.000Z` (09.00–11.00 WIB). Ini membuktikan instan baru tidak bergeser antara database dan API pada pemeriksaan development tersebut.

## Latihan backup dan restore database development — 13 Oktober 2026

- `scripts/restore-drill.ps1` membuat dump custom melalui `scripts/backup-db.mjs`; pemeriksaan `pg_restore --list` dan SHA-256 berhasil. Eksekusi awal sebelum integrasi native menghasilkan arsip 48.688 byte dan 0 booking. Eksekusi terbaru setelah integrasi menghasilkan arsip 56.692 byte.
- Dump dipulihkan dengan `pg_restore --exit-on-error --no-owner --no-acl` ke PostgreSQL 15 sementara pada `127.0.0.1:55435`, database kosong yang terpisah dari `venueconnect_db` sumber.
- Jumlah baris sumber dan hasil restore terbaru identik: `Building=15`, `BuildingRate=18`, `Booking=6`, `_prisma_migrations=8`. Eksekusi keluar kode 0 dengan `RESTORE_DRILL_OK counts=15|18|6|8`.
- `scripts/private-storage-snapshot.mjs` membuat salinan 26 file privat development (598 byte), memeriksa SHA-256 tiap file, lalu memulihkannya ke direktori baru yang kosong dan memeriksa checksum ulang. Tiga kunci berkas direferensikan oleh database sumber dan hasil restore; semuanya ada dalam snapshot. Ada 23 file lama yang tidak direferensikan database, kemungkinan sisa integrasi development; tidak dihapus karena kebijakan penghapusan belum ditetapkan.
- Cluster sementara berhenti dan direktorinya dibersihkan. Salinan database dan file dibuat berurutan tanpa snapshot transaksional bersama, sehingga latihan ini belum membuktikan konsistensi bila ada unggahan serentak. Smoke API terhadap database pulihan, backup object storage produksi, jadwal/enkripsi/salinan off-site, RPO/RTO, dan kesiapan staging tetap terbuka.

## Pembaruan bukti pembayaran privat dan penjagaan AI — 13 Oktober 2026

- Migration kesembilan `20261013190000_payment_proof` diterapkan pada PostgreSQL development. Bukti transfer manual dapat diunggah atau diganti oleh pemohon sewa saat pembayaran menunggu verifikasi; PDF/JPEG/PNG maksimal 5 MiB diperiksa ekstensi, MIME, dan tanda awal/akhir berkas. Hanya pemohon terkait dan pengguna dengan role `PAYMENT_VERIFIER` yang dapat mengunduhnya. Nama berkas distandardisasi, respons tidak membocorkan kunci storage, dan audit menyimpan metadata terbatas. UI pemohon dan verifier menampilkan metadata serta tombol unduh privat; bukti lama tetap dapat dilihat pemohon pada riwayat pembayaran. Production tetap menolak sesi development.
- `npm run test:integration` melalui proxy frontend lulus setelah backend dimulai ulang agar Prisma Client baru dipakai. Skenario tambahan menolak file palsu, upload akun lain/ADMIN, dan download akun lain/ADMIN; pemohon serta verifier membaca byte berkas yang sama. Verifikasi pembayaran, konflik slot bersamaan, dan alur mahasiswa tetap lulus. Restart diperlukan karena proses dev lama mempertahankan Prisma Client sebelum migration.
- Penjaga input AI kini mendeteksi beberapa bentuk data pribadi berlabel dan email dengan karakter zero-width. Batas global per proses mencegah pergantian header IP palsu melewati batas lokal; ini belum menggantikan limiter bersama pada deployment. Sembilan unit test backend, lint backend/frontend, dan build backend/frontend lulus. Provider AI nyata belum diaktifkan atau diuji.
- `scripts/restore-drill.ps1` sekarang mencocokkan kunci file dari `BookingDocument` **dan** `Payment.proofStorageKey` terhadap snapshot storage privat, serta membandingkan keduanya dengan database pulihan. Latihan terbaru berhasil pada Windows PowerShell 5.1 dan PowerShell 7: `RESTORE_DRILL_OK counts=15|18|32|9 db_private_keys=15 storage_files=38 unreferenced_files=23`. Semua checksum berkas cocok. Perbedaan 23 file tidak dihapus karena kebijakan retensi belum ditetapkan. Ini tetap latihan lokal tanpa unggahan serentak, staging, atau SOP institusi.

## Pembaruan otomatisasi expiry pembayaran dan pelepasan slot — 13 Oktober 2026

- Layanan `BookingExpiryService` diimplementasikan untuk menangani kedaluwarsa otomatis booking `AWAITING_PAYMENT` yang melewati `paymentDueAt`. Booking dan seluruh record payment tertunda (`UNPAID` atau `PENDING_VERIFICATION`) diubah ke status `EXPIRED` dalam satu transaksi dengan row locking. Status history mencatat transisi, audit log mencatat aksi `booking.expired` dan `payment.expired`, serta notifikasi in-app `BOOKING_EXPIRED` dikirim ke pemohon.
- Rute endpoint admin `POST /api/v1/admin/bookings/expire` dan skrip CLI `scripts/expire-overdue-bookings.mjs` dibuat untuk pemindaian berkala.
- Integrasi `npm run test:expiry` pada database PostgreSQL development membuktikan alur: saat booking 1 berada pada `AWAITING_PAYMENT`, pembuatan booking 2 pada slot yang sama ditolak (409 Conflict); setelah booking 1 kedaluwarsa, slot kalender terlepas dan booking 2 dapat dibuat serta disetujui tanpa bentrok. Pemanggilan ulang expiry pada booking yang sudah berstatus `EXPIRED` terbukti idempoten (`alreadyExpired=true`).
- Filter dan pengurutan antrean operator di `/admin` diperluas mencakup status `EXPIRED`, filter kategori, pencarian kata kunci, dan sortir waktu. Kalender ketersediaan memperjelas legenda ketersediaan waktu buka, waktu dipesan, dan waktu diblokir.

## Pemeriksaan yang lulus

`npm run test:integration` dari `backend/` lulus baik dengan URL API backend langsung maupun dengan `VENUECONNECT_TEST_API_BASE=http://localhost:3000/api/v1` melalui proxy frontend. Skrip membatasi database dan host API ke localhost.

1. Health API, katalog, dan koneksi database.
2. Mahasiswa: draf, PDF privat, submit, pemeriksaan, permintaan revisi, ganti PDF, revisi, dan konfirmasi tanpa approval WD III.
3. Akun pegawai: kategori akun server, routing ke antrean approver generik, guard role, dan keputusan.
4. Sewa publik: keputusan, referensi transfer manual, pengulangan referensi yang idempoten, penolakan, verifikasi, serah-terima, pengembalian, dan penyelesaian.
5. Dua konfirmasi bersamaan pada slot yang sama menghasilkan satu sukses dan satu HTTP 409.
6. Booking/PDF milik pemohon lain tidak terbaca; role yang salah tidak dapat memutuskan approval, memverifikasi pembayaran, atau melakukan handover. Audit dokumen tidak menyimpan isi PDF.
7. Respons kalender publik tidak memuat nama acara. Browser dapat memuat katalog, detail gedung, syarat berstatus `PENDING_POLICY`, dan badge notifikasi melalui proxy frontend.

Lint dan build frontend/backend lulus. Perbaikan browser mencakup akses API same-origin, pesan ketika daftar fasilitas memang kosong, serta penghapusan dua opsi FullCalendar yang tidak didukung.

Pemeriksaan lanjutan: ADMIN tanpa role `PAYMENT_VERIFIER` atau `BUILDING_OFFICER` menerima HTTP 403 pada tindakan masing-masing. Override ADMIN untuk approval tetap berhasil dan diaudit; notifikasi pembayaran baru hanya ditujukan kepada akun verifier. Badge notifikasi development kini menyegarkan setiap 30 detik/fokus/visibilitas dan membatalkan request saat komponen ditutup. Lint frontend/backend dan build frontend kembali lulus setelah perubahan ini.

Pemisahan layar role: `/admin/pembayaran` memakai panel verifier, `/admin/handover` memakai panel petugas, dan `/admin/gedung` hanya memuat penyelesaian penggunaan oleh ADMIN. Integrasi membuktikan petugas dapat membaca antrean penggunaan terkonfirmasi tetapi tidak dapat menyelesaikan booking; akun pemohon tidak dapat membaca antrean. Kedua panel antrean memakai pagination agar entri baru tetap dapat dijangkau saat data development bertambah. Lint dan build frontend/backend lulus setelah perubahan.

## Masih terbuka

- Riwayat petugas ditambahkan setelah integrasi database awal: API internal `/admin/usage/history` dan panel berpaginasi memetakan audit serah-terima/pengembalian/penyelesaian ke booking terkonfirmasi atau selesai. Query diperbaiki agar booking selesai tanpa serah-terima juga terlihat. Smoke query Prisma pada PostgreSQL sementara berbasis PGlite lulus untuk booking selesai tanpa handover dan booking terkonfirmasi dengan handover; booking terkonfirmasi tanpa tindakan tidak ikut. Ini belum menguji endpoint penuh pada PostgreSQL staging atau UAT.
- Setelah integrasi database awal, fallback error backend dan log klien dibatasi pada metadata diagnostik aman (`requestId`, metode/status/kode yang tervalidasi) tanpa mencetak objek error mentah atau URL request. Unduhan PDF privat mencatat aktor dan ID berkas setelah pembacaan berhasil, tanpa isi dokumen; alur unduh dan isi metadata audit telah diuji ulang pada PostgreSQL native. Restore database beserta salinan storage lokal telah berhasil pada latihan terisolasi di atas; object storage dan staging masih terbuka.
- Peringatan React saat kalender mount diperbaiki dengan menunda aktivasi callback event sampai komponen terpasang. Pemeriksaan browser development dengan API demo lokal menampilkan kalender tanpa log warn/error. Dialog konfirmasi verifier kemudian diperbaiki untuk fokus awal, siklus Tab, Escape, dan pemulihan fokus; lint file terkait serta build frontend lulus, tetapi dialog belum diuji bersama pengguna keyboard. Audit kondisi error, mobile, dan aksesibilitas menyeluruh masih belum selesai.
- Smoke browser mobile pada viewport 390 × 844 px memeriksa beranda, katalog, masuk, dan bantuan. Tautan navigasi publik kini membungkus ke dua baris tanpa overflow horizontal; tombol Masuk tetap terlihat. Tautan lewati navigasi adalah fokus keyboard pertama. Halaman masuk/daftar memakai satu landmark `main` dari layout global. Klaim kontak, unit pengelola, alamat kontak institusi, dan jam layanan yang saat itu belum memiliki sumber dihapus dari UI publik; keterangan WIB ditandai sebagai pratinjau. API backend tidak berjalan saat smoke ini, sehingga katalog memperlihatkan state error yang dapat dipulihkan, bukan verifikasi alur data.
- Setelah pengguna mengirim dua workbook dan PNG logo, agregat survei diverifikasi di `docs/14-validasi-survei-sumber.md`. Seed empat gedung diuji dua kali berturut-turut pada PostgreSQL sementara berbasis PGlite: hanya CB/QB/Sakura/GSG aktif, gedung lama tetap ada tetapi nonaktif, tidak ada tarif/kapasitas rekaan, dan jumlah user/role tidak bertambah pada rerun. Frontend desktop menampilkan logo pengguna pada header. Lint/build frontend/backend, lima unit test backend, serta pemeriksaan sintaks seed dan skrip integrasi lulus. Integrasi API telah diulang pada PostgreSQL native setelah inventaris berkembang menjadi 15 entri, sebagaimana tercatat di atas.
- Pengguna memberikan gambar GSG. Berkas asli disalin ke aset pratinjau dan dipetakan hanya ke slug `gedung-gsg` pada beranda, katalog, dan detail; gedung lain memakai ilustrasi. ESLint terarah pada empat berkas frontend yang berubah dan `npm run build` frontend lulus. Render GSG dengan data katalog nyata belum diperiksa di browser pada database native baru.
- Kebijakan resmi tenggat/expiry definitif BLU, kebijakan resmi atas retensi/penghapusan dokumen, autentikasi/assignment produksi, dan sumber prosedur resmi AI belum ditetapkan atau belum lengkap. Mekanisme otomatisasi expiry development telah lulus integrasi sebagaimana dicatat di atas.
- UAT dengan calon pengguna, kebijakan/BLU, inventaris dan tarif publik yang disahkan, infrastruktur staging, backup lampiran/restore staging, serta rilis produksi masih memerlukan pemilik proses terkait.

Rincian status tiap item tetap mengikuti `docs/VenueConnect_Task_List.md`.
Inventaris setiap item yang masih terbuka dan prasyaratnya ada di `docs/13-audit-task-terbuka.md`.
