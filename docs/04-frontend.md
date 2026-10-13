# Spesifikasi Frontend VenueConnect Polinela

> Frontend menempati folder tingkat atas frontend/. Aplikasi web menggunakan Next.js App Router, JavaScript, Tailwind CSS dan FullCalendar.

## Struktur folder frontend

    frontend/
    ├── public/
    │   ├── images/
    │   └── icons/
    ├── src/
    │   ├── app/
    │   │   ├── (public)/
    │   │   │   ├── page.js
    │   │   │   ├── gedung/page.js
    │   │   │   ├── gedung/[slug]/page.js
    │   │   │   ├── jadwal/page.js
    │   │   │   └── bantuan/page.js
    │   │   ├── (auth)/
    │   │   │   ├── masuk/page.js
    │   │   │   └── daftar/page.js
    │   │   ├── (member)/akun/pengajuan/
    │   │   │   ├── page.js
    │   │   │   ├── baru/page.js
    │   │   │   └── [id]/page.js
    │   │   ├── (operator)/admin/
    │   │   │   ├── page.js
    │   │   │   ├── pengajuan/[id]/page.js
    │   │   │   ├── gedung/page.js
    │   │   │   └── jadwal/page.js
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
    │   │   ├── buildings/
    │   │   ├── bookings/
    │   │   ├── approvals/
    │   │   ├── payments/
    │   │   ├── usage/
    │   │   └── assistant/
    │   ├── hooks/
    │   └── lib/
    │       ├── api-client.js
    │       ├── date-format.js
    │       └── currency-format.js
    ├── .env.example
    ├── next.config.js
    └── package.json

Frontend hanya memiliki client API HTTP. Prisma, database URL dan Gemini API key tidak boleh ada di folder ini.

## Route dan layar

| Route                 | Akses                  | Isi                                 |
| --------------------- | ---------------------- | ----------------------------------- |
| /                     | Publik                 | Pencarian dan ringkasan layanan     |
| /gedung               | Publik                 | Katalog dan filter                  |
| /gedung/[slug]        | Publik                 | Detail, tarif/syarat, kalender, CTA |
| /jadwal               | Publik                 | Kalender ketersediaan               |
| /bantuan              | Publik                 | Prosedur dan AI Agent               |
| /masuk, /daftar       | Pengguna               | Autentikasi sesuai kebijakan        |
| /akun/pengajuan       | Pemohon                | Pengajuan milik sendiri             |
| /akun/pengajuan/baru  | Pengguna masuk         | Wizard pengajuan                    |
| /akun/pengajuan/[id]  | Pemohon/petugas        | Detail dan timeline                 |
| /admin                | Admin development      | Ringkasan gedung dan agregat booking                |
| /admin/pengajuan/[id] | Admin development      | Detail booking dan review development                |
| /admin/gedung         | Admin                  | Gedung dan fasilitas                |
| /admin/pembayaran     | Verifier development   | Antrean dan keputusan pembayaran   |
| /admin/handover       | Petugas development    | Serah-terima dan pengembalian kunci |
| /admin/jadwal         | Pengelola/petugas      | Jadwal operasional                  |

Dasbor `/admin` menampilkan statistik gedung, jumlah booking menurut status, dan daftar pengajuan aktif dengan filter serta pagination. Queue tidak mengembalikan identitas pemohon; detail dan review development tersedia pada `/admin/pengajuan/[id]`. Route `/admin/gedung` menyediakan daftar gedung, tambah, ubah informasi, kapasitas, status aktif, izin sewa publik, draf syarat penggunaan beserta referensi pengesahan dan penerbitan eksplisit, CRUD master fasilitas/relasi gedung, blokir jadwal, serta CRUD tarif. Mengubah teks/referensi syarat mencabut centang terbit; draf tidak terlihat pada detail publik. Periode tarif aktif yang tumpang tindih untuk audience sama ditolak backend. Tampilan, input, dan konversi timestamp kalender/blokir/tarif memakai `NEXT_PUBLIC_APP_TIME_ZONE` (default pratinjau `Asia/Jakarta`); zona waktu operasional resmi tetap perlu ditetapkan. Di development, frontend dapat mengirim `x-user-id` dari `NEXT_PUBLIC_DEV_USER_ID`; nilainya harus UUID user aktif ber-role `ADMIN` di database lokal. Variabel ini hanya dibaca saat `NODE_ENV=development`; jangan isi atau gunakan sebagai autentikasi production. Sesi dan otorisasi production belum tersedia. Nominal dan syarat tarif hanya boleh dimasukkan setelah disahkan pemilik kebijakan.

## Komponen UI

- components/ui: Button, TextField, Select, Checkbox, Dialog, Badge, Alert, Table, Skeleton.
- components/layout: PublicHeader, PublicFooter, AccountNav, AdminSidebar, PageContainer.
- components/buildings: BuildingCard, BuildingFilters, BuildingDetails, FacilityList, RateSummary.
- components/calendar: AvailabilityCalendar, CalendarToolbar, AvailabilityLegend.
- components/bookings: BookingWizard, BookingSummary, BookingStatusBadge, BookingTimeline.
- components/admin: ReviewPanel, ApprovalActions, HandoverForm, PaymentVerificationForm.
- components/assistant: AssistantLauncher, AssistantPanel, AssistantMessage.

## Integrasi API

Satu api-client.js memakai `/api/v1` pada browser dan `BACKEND_API_ORIGIN` pada server component. `next.config.mjs` meneruskan path browser tersebut ke backend. Komponen fitur menggunakan fungsi terdomain seperti getBuildings, getBuilding, getAvailability, submitBooking, dan getMyBookings. Katalog menyimpan filter yang dapat dibagikan di URL: `q` untuk nama/lokasi, `facility` untuk fasilitas, dan `minCapacity` untuk kapasitas minimum. Kalender mengirim buildingId dan rentang tanggal ke endpoint availability, lalu hanya menampilkan label waktu/status umum. Jika permintaan gagal, tampilkan aksi retry yang memuat ulang event kalender. Jangan menaruh URL berulang di setiap komponen dan jangan memberi akses database langsung dari UI.

Jika cookie session dipakai lintas origin, atur credentials, CORS allowlist, SameSite dan CSRF sesuai deployment. Hindari menyimpan token autentikasi di localStorage.

## Alur pengguna

### Pencarian dan detail

Cari gedung/lokasi/tanggal atau filter fasilitas/kapasitas. Kartu menampilkan lokasi, kapasitas, fasilitas, serta hanya tarif sewa luar kampus aktif (`EXTERNAL`) jika tersedia. Detail memuat deskripsi, fasilitas, tarif sewa luar kampus, ringkasan slot tidak tersedia, aturan resmi yang sudah ditetapkan, dan CTA peminjaman/penyewaan. Mahasiswa, dosen, dan civitas akademika Polinela memilih peminjaman; pemohon luar kampus memilih penyewaan. Jika waktu tidak tersedia, minta pengguna memilih waktu baru. Ketersediaan publik hanya menampilkan waktu dan status umum.

### Wizard pengajuan

1. Jenis pemohon dan detail kegiatan.
2. Pilihan gedung serta tanggal/jam.
3. Mahasiswa wajib mengunggah berkas peminjaman gedung; pengguna lain mengisi data/dokumen sesuai persyaratan yang berlaku.
4. Ringkasan gedung, waktu, tarif/syarat dan pernyataan.
5. Konfirmasi, nomor pengajuan, status dan langkah berikutnya.

Unggahan berkas peminjaman gedung wajib untuk mahasiswa. Baseline development menerima satu PDF maksimal 5 MB; retensi, penghapusan terminal, dan storage produksi masih perlu disahkan. Field/dokumen lain mengikuti prosedur yang disahkan. Jangan simpan dokumen sensitif di local storage. Setelah submit, state server menjadi sumber kebenaran.

### Dashboard

Pemohon melihat booking, status, dan aksi berikutnya. Admin menyaring antrean. Approver hanya melihat item yang ditugaskan. Petugas melihat jadwal disetujui dan aksi serah-terima. Tampilkan alasan penolakan/revisi dan langkah selanjutnya.

## State, aksesibilitas dan privasi

- Simpan filter yang dapat dibagikan di URL.
- Event kalender publik hanya berisi waktu dan status umum.
- Bedakan loading, kosong, gagal, tidak berwenang, dan data kedaluwarsa.
- Pada konflik, pertahankan field lain agar pengguna dapat memilih waktu baru.
- Semua kontrol dapat digunakan dengan keyboard; fokus terlihat.
- Status memiliki teks, bukan warna saja; label dan error form selalu tampak.
- Pemohon hanya melihat booking miliknya. Server backend tetap memutuskan izin.
- Jika AI gagal, katalog dan jadwal tetap tersedia dan booking development tidak terhalang; kontak/prosedur resmi baru ditampilkan setelah disahkan.

Header publik membungkus seluruh tautan pada layar kecil; navigasi akun/operator dapat digulir mendatar di ponsel. Konten utama memakai lebar yang tersedia dan fokus keyboard mendapat outline yang terlihat. Pemeriksaan mobile pratinjau mencakup beranda, katalog, masuk, dan bantuan pada viewport 390 px; audit semua alur dan kontras formal masih terbuka.

Header dan footer memakai PNG lambang Politeknik Negeri Lampung yang diberikan pengguna sebagai aset pratinjau di `/images/polinela-logo.png`. Pengesahan publikasi brand oleh pemilik institusi masih terbuka. Katalog development memisahkan empat gedung peminjaman (CB, QB, Sakura, GSG) dari dua belas pilihan penyewaan luar kampus (GSG dan sebelas ruang/layanan pada tabel tarif pengguna). GSG berbagi satu identitas gedung pada kedua alur. Alamat hanya tersedia untuk empat gedung awal; 18 opsi harga sewa berasal dari tabel pengguna, dengan paket yang belum aman dihitung otomatis ditandai informasi saja. Rincian ada di `docs/15-inventaris-peminjaman-penyewaan.md`.

Gambar GSG dari pengguna dipakai di kartu beranda, katalog, dan detail melalui `/images/gedung-gsg.png`. Komposisi tampilan memotong header/footer gambar dengan `object-fit: cover` tanpa mengubah file sumber. CB, QB, dan Sakura tetap menampilkan ilustrasi netral sampai fotonya diberikan. Publikasi produksi menunggu izin pemilik aset.

Tautan “Lewati ke konten utama” menjadi kontrol keyboard pertama pada layout global dan menargetkan landmark `main`.

Tarif pada katalog, detail gedung, dan snapshot booking memakai satu formatter `Intl.NumberFormat('id-ID')` berdasarkan kode currency data; format mengikuti digit standar mata uang tersebut.

## Spesifikasi field dan interaksi

Wizard mengonsumsi schema form dari konfigurasi produk yang disahkan. Baseline field: buildingId, bookingType, tanggal, waktu mulai/selesai, nama kegiatan, deskripsi singkat, jumlah peserta bila kapasitas berlaku, dan kontak yang berasal dari profil atau dikonfirmasi pengguna. Untuk mahasiswa, sertakan unggahan berkas peminjaman gedung; jangan tampilkan langkah persetujuan Wakil Direktur III. Field tambahan dan unggahan lain mengikuti ketetapan pemilik proses.

Validasi UI membantu lebih awal, tetapi backend tetap validator final. Konflik kalender mengembalikan pengguna ke pemilihan waktu tanpa menghapus input lain. Saat jaringan gagal, tampilkan pesan dan aksi coba lagi; jangan menampilkan seolah pengajuan sudah tersimpan.

## Keadaan layar yang wajib dirancang

Untuk halaman katalog, detail, kalender, pengajuan, dashboard dan assistant, dokumentasikan tampilan:

- loading/skeleton;
- hasil kosong dan filter tanpa hasil;
- error API dan tindakan pemulihan;
- tidak login atau sesi habis;
- tidak berwenang;
- bentrok jadwal;
- aksi sedang diproses dan sukses;
- data kedaluwarsa/diubah oleh petugas lain;
- AI tidak tersedia atau tidak yakin.

Untuk status AWAITING_PAYMENT tampilkan “Disetujui, menunggu pembayaran”, tenggat dan cara pembayaran yang sudah disahkan. CONFIRMED berarti slot telah dikunci. Payment flow tidak menampilkan instruksi fiktif sebelum metode final.

## Detail dashboard per role

- Pemohon: status, timeline, catatan yang boleh dibagikan, dokumen (bila ada), dan tindakan yang masih diperbolehkan.
- Admin: antrean, filter, detail permohonan, kelengkapan, catatan pemeriksaan, approval route yang ditugaskan.
- Approver: item sesuai assignment yang disahkan untuk kategori pemohon, ringkasan, konflik/ketersediaan, keputusan dan catatan. Role generik di development belum mengunci jabatan atau delegasi institusi. Mahasiswa mengunggah berkas; tindak lanjut berkasnya ditampilkan sesuai baseline pengelola.
- Petugas: kalender tugas, waktu, lokasi, serah-terima kunci, penyelesaian.
- Admin gedung: formulir gedung, fasilitas, tarif efektif, blok jadwal dan konfirmasi perubahan.

## Autentikasi lintas aplikasi

Frontend browser memanggil path same-origin `/api/v1`, sementara proxy Next.js memakai `BACKEND_API_ORIGIN` hanya pada server. Ini menyiapkan jalur untuk cookie HttpOnly/Secure tanpa token di localStorage. Autentikasi cookie, CSRF, dan domain cookie tetap harus dirancang serta diuji pada deployment yang dipilih. Bentuk SSO/daftar publik mengikuti keputusan pada dokumen 00. Sebelum keputusan itu diambil, route `/masuk` dan `/daftar` menampilkan informasi bahwa akun belum dapat digunakan; route tersebut tidak meminta kredensial.

## Kriteria penerimaan UI

- Peminjam dapat mencari gedung, melihat kalender/tarif/syarat dan mengirim pengajuan melalui mobile maupun desktop.
- Pemohon hanya melihat booking miliknya dan status server terkini.
- Admin/approver/petugas hanya melihat aksi dan data sesuai role.
- Konflik, error jaringan, loading dan status kosong mempunyai tampilan serta pesan pemulihan.
- Kalender publik tidak menampilkan identitas maupun nama kegiatan.
- Pengguna dapat menyelesaikan alur inti dengan keyboard; fokus dan validasi field terlihat.
- AI failure tidak menghalangi katalog, jadwal, atau booking.

## Notifikasi dan status yang tampil

Inbox in-app muncul di navigasi akun/operator dan memuat judul, waktu, booking terkait, status dibaca/belum dibaca, serta badge jumlah belum dibaca. Notifikasi hanya ditampilkan kepada user penerima. Link menuju detail hanya terbuka setelah backend memeriksa hak akses. UI inbox memuat pagination dan aksi tandai dibaca melalui endpoint penerima.

| Status backend     | Label UI pemohon               | Panduan visual |
| ------------------ | ------------------------------ | -------------- |
| SUBMITTED          | Terkirim                       | info           |
| UNDER_REVIEW       | Sedang diperiksa               | processing     |
| REVISION_REQUESTED | Perlu perbaikan                | warning        |
| AWAITING_APPROVAL  | Menunggu persetujuan           | warning        |
| AWAITING_PAYMENT   | Disetujui, menunggu pembayaran | warning/info   |
| CONFIRMED          | Disetujui                      | success        |
| REJECTED           | Ditolak                        | danger         |
| CANCELLED, EXPIRED | Dibatalkan/Kedaluwarsa         | muted          |
| COMPLETED          | Selesai                        | muted          |

UI harus menampilkan tenggat dan cara pembayaran hanya jika backend memiliki dueAt dan instruksi resmi. Jangan menyimpulkan booking sudah confirmed hanya dari keputusan approver.

## Rujukan dan kriteria lintas fungsi

Pemetaan FR-01 sampai FR-12 serta skenario penerimaan berada pada 00-analysis-and-decisions.md. Setiap layar harus menggunakan DTO endpoint backend, memiliki loading/error/empty state, dan tidak membuka akses data di luar peran pengguna. Field dan upload mengikuti keputusan pemilik proses.

## Admin development: tarif, pembayaran, dan penggunaan

Route `/admin/gedung` menyediakan panel tarif tanpa nilai contoh dan penyelesaian penggunaan oleh ADMIN. Route `/admin/pembayaran` menampilkan antrean `PENDING_VERIFICATION` dan hanya dapat diproses oleh `PAYMENT_VERIFIER`. Route `/admin/handover` menampilkan booking terkonfirmasi untuk serah-terima/pengembalian kunci oleh `BUILDING_OFFICER`; petugas tidak dapat menutup penggunaan. Kedua antrean memakai pagination dan daftar minimum tidak memuat identitas pemohon. Panel riwayat di `/admin/handover` serta `/admin/gedung` menampilkan serah-terima, pengembalian, penyelesaian, waktu, dan nama aktor internal dari audit untuk booking terkonfirmasi/selesai; isi catatan kondisi dan data pemohon tidak ikut tampil. Verifikasi pembayaran melakukan transisi payment dan booking pada transaksi backend; penyelesaian penggunaan mensyaratkan kunci yang sudah dikembalikan bila handover tercatat. Pengajuan referensi pembayaran sudah tersedia pada development, sedangkan bukti bayar dan expiry masih menunggu kebijakan BLU. Seluruh tindakan tetap development-only; assignment petugas per gedung dan sesi production belum tersedia.

