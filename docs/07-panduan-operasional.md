# Panduan Penggunaan dan Operasi VenueConnect Polinela (Draft Preview)

> Dokumen ini hanya menjelaskan fitur yang tersedia pada preview/development. Ini bukan SOP resmi Polinela dan tidak mengesahkan alur, tarif, tenggat, atau keputusan operasional. Jangan gunakan data pribadi atau transaksi nyata sebelum autentikasi, penyimpanan privat, kebijakan, dan lingkungan production disahkan.

## Status layanan saat ini

- Katalog gedung, detail fasilitas/tarif yang telah dimasukkan, dan kalender ketersediaan dapat dilihat tanpa akun.
- Wizard dapat membuat pengajuan dan mengunggah PDF mahasiswa pada development dengan akun demo aktif; produksi tetap menolak mutasi karena autentikasi resmi belum tersedia.
- Halaman masuk dan daftar menjelaskan bahwa autentikasi belum tersedia.
- Halaman admin, antrean review, antrean approver generik, detail pengajuan, serta pengelolaan gedung/fasilitas/tarif/blokir hanya untuk development. Autentikasi production dan assignment jabatan resmi belum tersedia.
- Layar `/admin/pembayaran` untuk role `PAYMENT_VERIFIER` dapat membaca bukti privat dan menerima/menolak referensi transfer dengan catatan. Layar `/admin/handover` untuk `BUILDING_OFFICER` mencatat serah-terima/pengembalian kunci. ADMIN menutup penggunaan di `/admin/gedung`. Pemohon dapat mencatat referensi dan mengunggah bukti pada detail sewa development. Expiry, assignment per gedung, dan SOP resmi belum tersedia.
- AI hanya untuk pertanyaan baca-saja dan tetap tertutup kecuali provider serta pembatasan produksi telah dikonfigurasi. Jawaban bukan persetujuan, konfirmasi slot, atau kebijakan resmi.

## Panduan pengunjung dan calon pemohon

1. Buka katalog untuk mencari gedung. Gunakan filter nama/lokasi, fasilitas, dan kapasitas.
2. Buka detail gedung untuk membaca informasi, fasilitas, tarif yang tersedia, serta ringkasan ketersediaan.
3. Gunakan kalender untuk memeriksa rentang waktu. Status ketersediaan dapat berubah dan bukan jaminan pemesanan.
4. Formulir `/pinjam/[slug]` membantu meninjau rincian permintaan. Pada development dengan `NEXT_PUBLIC_DEV_USER_ID` untuk pemohon uji, tombol Kirim menyimpan booking; mahasiswa mengunggah satu PDF maksimum 5 MB lalu mengirim draft. Jangan gunakan data nyata. Pada production tombol Kirim tidak aktif.
5. Setelah pengiriman development, buka `/akun/pengajuan` dan detail pengajuan untuk memeriksa status, riwayat, dan notifikasi. Revisi mahasiswa dapat dikirim hanya ketika status meminta revisi. Pembatalan mandiri hanya tersedia sebelum pengajuan masuk routing persetujuan atau pembayaran; kasus setelah itu perlu ditangani manual oleh pengelola menurut kebijakan yang nanti disahkan.
6. Untuk sewa uji berstatus `AWAITING_PAYMENT`, pemohon dapat mencatat referensi transfer di detail lalu mengunggah satu bukti privat PDF/JPG/PNG maksimal 5 MiB saat verifikasi masih tertunda. Bukti dapat diganti selama status itu; pemohon dapat melihatnya kembali pada riwayat pembayaran. Ini bukan instruksi pembayaran nyata: rekening, ketentuan bukti, tenggat, dan refund belum disahkan.
7. Jangan mengirim identitas, kontak, berkas pribadi, atau rincian kegiatan melalui AI. Hubungi unit resmi setelah kanal kontak institusi ditetapkan.

## Panduan admin preview

1. Jalankan hanya pada development dengan database lokal berisi data uji.
2. Endpoint admin memerlukan `x-user-id` berisi UUID user aktif yang memiliki role `ADMIN` di database lokal. Frontend membaca UUID development dari `NEXT_PUBLIC_DEV_USER_ID` hanya ketika `NODE_ENV=development`.
3. Buka `/admin` untuk ringkasan dan antrean. Detail pengajuan menyediakan keputusan review hanya pada development bagi ADMIN uji. Periksa berkas mahasiswa melalui tombol unduh privat sebelum memutuskan.
4. Buka `/admin/gedung` untuk membuat/mengubah/nonaktifkan gedung, mengelola fasilitas/tarif/blokir, menyimpan draf syarat penggunaan, dan menutup penggunaan setelah pengembalian kunci pada data uji. Draf syarat tetap privat; terbitkan hanya sesudah teks dan referensi pengesahan resmi tersedia. Lingkup aktif development kini 15 ruang/gedung: empat untuk peminjaman, dua belas untuk penyewaan, dengan GSG pada kedua daftar memakai satu ID. Seed mengisi 18 opsi harga `EXTERNAL` dari cuplikan pengguna; opsi hitungan kompleks disimpan sebagai informasi saja. Jangan memasukkan syarat atau data lain yang belum bersumber. Akurasi inventaris, tanggal efektif tarif, dan izin publikasi resmi masih menunggu; lihat `docs/15-inventaris-peminjaman-penyewaan.md`.
5. ADMIN tidak otomatis berhak memverifikasi pembayaran atau menyerahkan kunci. Jika satu orang menjalankan lebih dari satu tugas dalam development, akun uji tersebut harus memiliki role khusus yang sesuai; setiap tindakan tetap tercatat dengan user yang melakukan aksi.
6. Jangan gunakan stub header atau data preview untuk melayani pengguna nyata. Production menolak stub `x-user-id` sampai provider autentikasi resmi tersedia.

## Panduan approver, verifier, dan petugas gedung

Alur kerja production belum dapat dijalankan. Pada development:

1. **Approver:** gunakan akun uji `APPROVER` di `/persetujuan`. Buka langkah yang ditugaskan, cocokkan jadwal/status, lalu setujui atau tolak dengan catatan. ADMIN hanya memiliki override pada route persetujuan yang dinyatakan eksplisit; keputusan tetap tercatat di riwayat dan audit. Routing jabatan/delegasi resmi belum ditetapkan.
2. **Verifier BLU:** gunakan akun uji `PAYMENT_VERIFIER` di `/admin/pembayaran`. Antrean dipaginasi; unduh bukti privat bila tersedia, cocokkan dengan sumber keuangan uji yang terpisah, isi catatan keputusan, lalu verifikasi atau tolak. Sistem memeriksa nominal/mata uang terhadap snapshot tarif. Berkas yang diunggah belum membuktikan dana masuk; jangan memproses uang nyata.
3. **Petugas gedung:** gunakan akun uji `BUILDING_OFFICER` di `/admin/handover`. Antrean dipaginasi dan hanya menampilkan booking terkonfirmasi tanpa identitas pemohon. Catat kondisi sebelum serah-terima dan sesudah pengembalian; pengelola ADMIN menutup penggunaan di `/admin/gedung`. Panel riwayat terpisah di kedua halaman menampilkan waktu dan aktor tindakan tanpa data pemohon atau catatan kondisi. Assignment per gedung belum ditegakkan sehingga layar ini hanya untuk data uji.

Instruksi keputusan, format/retensi bukti pembayaran, expiry, pemeriksaan kunci, eskalasi, dan prosedur kondisi serah-terima resmi harus mengikuti kebijakan yang disahkan. Jangan gunakan aksi development untuk transaksi nyata.

## Setup preview untuk pengembang

1. Pasang dependensi dari lockfile pada masing-masing folder `backend/` dan `frontend/`.
2. Salin `backend/.env.example` ke `backend/.env`, lalu isi koneksi PostgreSQL lokal dan `AUTH_SECRET` acak khusus development. Jangan commit `.env` atau menyalin rahasia ke `NEXT_PUBLIC_*`.
3. Jalankan PostgreSQL lokal sesuai `backend/docker-compose.yml` atau layanan PostgreSQL 15 native Windows, kemudian jalankan `npm run db:deploy` dan `npm run db:seed` dari `backend/` hanya pada database development. Delapan migration dan seed 15 ruang/gedung beserta 18 opsi harga sewa telah berhasil diterapkan pada PostgreSQL native lokal tanggal 2026-10-13; ini bukan database produksi.
4. Dari terminal `backend/`, jalankan `npm run dev` (port 3001). Dari terminal kedua di `frontend/`, jalankan `npm run dev` (port 3000), lalu buka `http://localhost:3000`. Kedua script telah mengunci port sehingga urutan menjalankannya tidak menukar alamat. Frontend memakai `BACKEND_API_ORIGIN=http://localhost:3001` secara default; set variabel itu hanya bila alamat backend berbeda. Browser memanggil `/api/v1` pada origin frontend dan Next.js meneruskan request ke backend; tidak perlu CORS lintas port.
5. Konfigurasikan `NEXT_PUBLIC_DEV_USER_ID` hanya dengan UUID pengguna uji yang aktif pada database lokal. Gunakan akun uji berbeda sesuai alur pemohon, ADMIN, approver, dan verifier; ini bukan autentikasi production.

Pada 2026-10-12, integrasi awal memakai PostgreSQL development sementara di `%TEMP%\venueconnect-postgres-15`; folder temp itu tidak lagi tersedia. Sejak 2026-10-13, PostgreSQL 15 native Windows (`postgresql-x64-15`) berjalan di `localhost:5432` dan menjadi database development yang digunakan. Jangan menjalankan perintah start untuk cluster sementara tersebut.

### Alur API pengajuan pada development

Semua route mutasi berikut memerlukan header `x-user-id` milik user uji yang aktif. Backend menolak header ini pada `NODE_ENV=production`. Pastikan seluruh migration sampai `20261012140000_user_account_category` sudah terpasang pada database development sebelum memakai route; kondisi ini sudah diverifikasi pada database lokal tanggal 2026-10-12. Akun uji lama perlu diberi `accountCategory` oleh pengelola database development; pilihan kategori di browser saja tidak cukup. Jalankan `npm run test:integration` dari `backend/` hanya terhadap API dan database development lokal yang telah di-seed; skrip ini membuat dan mempertahankan data uji.

1. Buat booking dengan `POST /api/v1/bookings`. Sertakan `applicantCategory` (`MAHASISWA`, `DOSEN_PEGAWAI`, atau `UMUM`) selain field booking yang sudah terdokumentasi. Kategori harus cocok dengan `User.accountCategory`, tipe akun, dan tipe booking.
2. Untuk mahasiswa, respons awal berstatus `DRAFT`. Kirim satu berkas PDF maksimum 5 MB sebagai field multipart `file` ke `POST /api/v1/bookings/:id/documents`. Unduh hanya lewat `GET /api/v1/bookings/:id/documents/:documentId` sebagai pemilik atau admin development. Hapus/ganti file hanya saat draft atau revisi. Panggil `POST /api/v1/bookings/:id/submit` untuk mengirim draft yang sudah memiliki satu PDF.
3. Operator development memanggil `POST /api/v1/admin/bookings/:id/review` dengan `action` `START_REVIEW`, lalu `REQUEST_REVISION`, `CONFIRM_STUDENT`, `REJECT`, atau `FORWARD`. Aksi revisi/penolakan wajib menyertakan `note` minimal tiga karakter. Mahasiswa hanya dapat dikonfirmasi melalui `CONFIRM_STUDENT`; `FORWARD` hanya untuk dosen/pegawai atau publik dengan role APPROVER generik.
4. Mahasiswa dengan status `REVISION_REQUESTED` dapat mengganti PDF pada route yang sama dan mengirim perbaikan field kegiatan/waktu lewat `POST /api/v1/bookings/:id/revise`. Waktu dan konflik diperiksa ulang. Pengajuan kembali ke `SUBMITTED` untuk review ulang.
5. Sewa publik yang sudah diputuskan masuk `AWAITING_PAYMENT`. Pada data uji, pemilik dapat mencatat referensi transfer lewat `POST /api/v1/bookings/:id/payments` dengan body `{"reference":"..."}`, lalu mengunggah satu bukti lewat `POST /api/v1/payments/:id/proof` multipart field `file`. `GET` pada rute bukti yang sama hanya untuk pemilik booking dan `PAYMENT_VERIFIER`; file tidak diberi URL publik. Jumlah berasal dari snapshot tarif. Verifier memakai `POST /api/v1/payments/:id/verify` atau `/reject` dengan catatan. Tidak ada tenggat otomatis atau rekening yang ditampilkan oleh API ini.

Frontend development memanggil mutasi pemohon dan review/pembayaran yang sesuai. Integrasi API dengan PostgreSQL development lokal, termasuk melalui proxy frontend, lulus pada 2026-10-12; bukti dan batasnya ada di `docs/12-verifikasi-integrasi-development.md`. Itu bukan UAT atau pengujian production.

## Dukungan, backup, pemulihan, dan insiden

Belum ada owner operasional, kanal dukungan, jadwal/pelaksana backup, target RPO/RTO, lokasi salinan, prosedur restore production yang diuji, atau kontak respons insiden yang ditetapkan. Petunjuk berikut hanya untuk pemulihan dump pada database kosong yang terisolasi; ini bukan prosedur cutover atau pemulihan production. Sebelum layanan production dibuka, pemilik institusi dan operator harus melengkapi serta menguji:

- nama unit/petugas utama dan pengganti, kanal pelaporan, jam layanan, klasifikasi insiden, serta jalur eskalasi;
- cakupan backup database dan object storage, frekuensi, enkripsi, retensi, pemisahan akses, dan pemantauan kegagalan;
- langkah restore di lingkungan terisolasi, pemeriksaan konsistensi, persetujuan cutover, target RPO/RTO, dan bukti uji pemulihan;
- prosedur insiden privasi/keamanan, pengamanan log, pencabutan kredensial, komunikasi, dan pelaporan sesuai kebijakan institusi.

### Triage dukungan untuk preview

Petugas dukungan preview mencatat waktu dan zona, route/fitur, role uji, kode HTTP atau `requestId` yang ditampilkan aplikasi, langkah reproduksi, hasil yang diharapkan, dan dampaknya. Jangan meminta password, token, isi PDF, nomor rekening, atau tangkapan layar yang menampilkan data pribadi. Pisahkan kasus berikut sebelum eskalasi:

| Gejala | Pemeriksaan awal tanpa data pribadi | Tindakan sementara |
| --- | --- | --- |
| Katalog atau kalender tidak termuat | Periksa `/api/health`, koneksi backend/frontend, dan status database uji. | Catat `requestId`; hindari mengulang mutasi booking untuk menguji koneksi. |
| 401/403 pada aksi development | Periksa `NODE_ENV`, UUID akun uji aktif, dan role pada database development; jangan menyalin header uji ke production. | Minta pengelola lingkungan uji memperbaiki konfigurasi akun sesuai role, tanpa memberi ADMIN hak implisit. |
| 409 konflik jadwal/status | Muat ulang status booking dan kalender umum. | Jelaskan bahwa waktu/status berubah; jangan memaksa update database untuk melewati constraint. |
| PDF gagal diunggah | Periksa satu file PDF maksimal 5 MB, status booking draft/revisi, dan ruang penyimpanan privat development. | Simpan hanya metadata error; jangan lampirkan isi PDF ke tiket. |
| Pembayaran/verifikasi tidak maju | Periksa status booking, snapshot tarif, dan role verifier pada data uji. | Eskalasi ke pemilik BLU bila menyangkut pembayaran nyata; jangan mengubah status lewat SQL. |
| AI gagal atau tidak tersedia | Periksa sakelar fitur dan status provider tanpa mencetak API key atau isi prompt. | Arahkan pengguna ke katalog/jadwal dan kanal petugas yang nantinya disahkan; booking tetap tersedia. |

Pemeriksaan satu kali `node scripts/check-health.mjs` memanggil `http://127.0.0.1:3001/api/health` dan keluar dengan kode 0 hanya jika respons JSON menyatakan aplikasi serta database sehat. Untuk target lain, berikan URL penuh `/api/health` sebagai argumen; HTTP hanya diterima pada loopback, sedangkan target jarak jauh wajib HTTPS. Skrip tidak memakai kredensial dan tidak mencetak isi respons. Jadwal pemantauan, tujuan alert, serta penanggung jawab tindak lanjut belum ditetapkan.

Untuk lingkungan resmi, unit dukungan, jam layanan, tingkat prioritas, SLA, dan kanal eskalasi harus diisi oleh pemilik operasional pada task keputusan tersendiri. Tiket preview tidak boleh menyimpan isi dokumen atau percakapan AI sensitif.

### Siklus backup dan latihan pemulihan

1. Operator yang ditetapkan mencatat cakupan database dan object storage, lokasi terpisah, jadwal, retensi, enkripsi, serta akses salinan sebelum menjadwalkan backup. `backup-db.mjs` hanya membuat satu dump database; alat snapshot lokal lampiran di bawah terpisah dan belum menyediakan satu titik waktu atomik untuk database dan file.
2. Setelah setiap dump, operator mencatat nama file, waktu UTC, ukuran, checksum, exit code `pg_dump`, lokasi salinan, dan hasil pemeriksaan `pg_restore --list`. Jangan menyimpan kredensial atau data mentah dalam tiket.
3. Latihan restore memakai **database baru yang kosong dan terisolasi**. Catat versi PostgreSQL, waktu mulai/selesai, jumlah objek, hasil migrasi/schema dan smoke API dengan data uji. Jangan menimpa database aktif.
4. Kegagalan dump/restore dinaikkan ke pemilik infrastruktur; backup yang gagal tidak dianggap berhasil. Frekuensi, target RPO/RTO, persetujuan cutover, serta penghapusan salinan tetap menunggu keputusan institusi.

### Respons insiden preview

1. Catat waktu penemuan, layanan terdampak, gejala, dan `requestId`; hentikan penggunaan data uji yang terdampak bila ada risiko integritas. Jangan mematikan audit atau menghapus bukti.
2. Bila diduga ada akses dokumen atau data pribadi yang tidak sah, batasi akses ke lingkungan uji melalui pemilik infrastruktur, simpan log yang relevan dengan kontrol akses, dan eskalasi ke pemilik keamanan/privasi institusi. Jangan memindahkan PDF atau log ke kanal umum.
3. Bila terjadi kesalahan status pembayaran/booking, hentikan mutasi terkait, cocokkan status database dan audit, lalu buat rencana pemulihan yang ditinjau pemilik proses. Jangan memperbaiki status melalui SQL ad hoc.
4. Dokumentasikan akar masalah, dampak, tindakan, pemilik, waktu, dan bukti retest. Komunikasi eksternal, notifikasi subjek data, dan batas waktu pelaporan hanya dilakukan menurut kebijakan resmi.

Script `scripts/backup-db.mjs` tersedia untuk membuat dump PostgreSQL satu kali; jalankan `node scripts/backup-db.mjs [direktori-backup]` atau wrapper `scripts/backup-db.sh` pada Bash. Script memerlukan `DATABASE_URL`, `pg_dump`, dan `pg_restore`; dump format custom hanya diterbitkan setelah ukurannya lebih dari nol dan `pg_restore --list` berhasil. Output mencetak SHA-256 untuk dicatat bersama lokasi salinan. Nama file memakai UTC dan direktori/file dibatasi pada sistem Unix. Password koneksi diberikan ke proses `pg_dump` melalui environment proses, bukan argumen command line. Lokasi default adalah `./backups` dan dapat diganti dengan argumen direktori atau `BACKUP_DIR`. Pemeriksaan arsip ini **tidak menggantikan latihan restore**. Script tidak menetapkan jadwal, retensi, enkripsi, upload off-site, atau restore; jangan gunakan untuk production sebelum operator menyetujui lokasi dan kontrol backup.

Pada Windows development lokal dengan PostgreSQL 15 terpasang di `D:\ProgramFile\PostgreSQL\15\bin`, jalankan `./scripts/restore-drill.ps1` dari root workspace menggunakan Windows PowerShell 5.1 atau PowerShell 7. Skrip membatasi sumber pada `localhost/venueconnect_db`, membuat dump tervalidasi, menyalin storage lokal ke direktori sementara dengan manifest SHA-256 per file, lalu memulai cluster PostgreSQL sementara di loopback port 55435. Dump dipulihkan ke database baru; jumlah baris `Building`, `BuildingRate`, `Booking`, dan `_prisma_migrations` serta kunci `BookingDocument` dan bukti `Payment` dibandingkan. Berkas privat dipulihkan ke direktori lain yang baru, lalu checksum diperiksa ulang. Cluster dan berkas latihan kemudian dibersihkan. Port dapat diganti dengan `-Port` bila sudah digunakan. Jika Windows masih mengunci file sesaat setelah server berhenti dan direktori sementara tertinggal, jalankan kembali skrip dengan `-CleanupPath` menggunakan path `tmp/restore-drill-<id>` yang tercetak; opsi ini memeriksa path dan proses PostgreSQL sebelum menghapusnya. Hasil 13 Oktober 2026: `RESTORE_DRILL_OK counts=15|18|32|9 db_private_keys=15 storage_files=38 unreferenced_files=23`; direktori sementara bersih. File yang tidak direferensikan tidak otomatis dihapus karena kebijakan retensi belum ditetapkan.

Untuk snapshot lampiran lokal secara terpisah, gunakan `node scripts/private-storage-snapshot.mjs create <direktori-storage> <direktori-arsip-baru>`, lalu `verify <direktori-arsip>` atau `restore <direktori-arsip> <direktori-target-baru>`. Target baru tidak boleh sudah ada. Alat ini hanya menerima file reguler bernama UUID, menolak symlink, membatasi ukuran file satu per satu ke 5 MB, dan tidak menimpa target. Manifest berisi kunci, ukuran, dan hash file; perlakukan kunci dan arsip sebagai data privat. Pada Windows, izin file mengikuti ACL direktori induk, sehingga operator harus memastikan lokasi arsip memang terbatas. Ini alat development untuk latihan; object storage production memerlukan mekanisme backup serta konsistensi DB/file yang disetujui.

### Pemulihan dump untuk latihan terisolasi

1. Pilih salinan dump yang sudah diverifikasi operator dan catat waktu serta checksum file.
2. Siapkan database PostgreSQL baru yang kosong dan terisolasi, dengan nama service libpq `venueconnect_restore`. Jangan arahkan service ini ke database production atau database aktif. Kredensial disimpan di service file/credential store dengan izin terbatas; jangan menaruh password di argumen command line.
3. Daftarkan service tersebut pada environment proses melalui `PGSERVICEFILE`, lalu periksa isi dump tanpa mengubah database:

   ```bash
   pg_restore --list "./backups/venueconnect-<timestamp>.dump"
   ```

4. Jalankan pemulihan hanya ke database kosong tersebut. Perintah ini tidak memakai `--clean` atau `--create`:

   ```bash
   pg_restore --exit-on-error --no-owner --no-acl \
     --dbname="service=venueconnect_restore" \
     "./backups/venueconnect-<timestamp>.dump"
   ```

5. Jika pemulihan gagal, biarkan database latihan terisolasi untuk pemeriksaan atau hapus melalui prosedur admin database; jangan mengulang ke database yang sudah berisi objek. Jika berhasil, verifikasi koneksi aplikasi uji, migrasi/schema, dan konsistensi data sebelum mencatat hasil latihan.

Langkah berbasis service file di atas masih menjadi rancangan untuk operator staging/production. Latihan lokal otomatis telah berhasil dengan cluster terisolasi dan salinan lampiran development melalui `scripts/restore-drill.ps1`; pemilik operasi tetap harus menyiapkan target staging, backup object storage, kebijakan penyimpanan, koordinasi snapshot konsisten, dan bukti pemulihan berkala sebelum rilis.

## Syarat publikasi

Jangan mempublikasikan layanan untuk transaksi nyata sebelum checklist keputusan produk, autentikasi production, penyimpanan privat, data/tarif yang disahkan, operasi dan backup/restore, uji keamanan, UAT, serta dukungan pengguna pada `docs/VenueConnect_Task_List.md` ditutup oleh pemilik yang berwenang.
