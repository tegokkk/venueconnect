# Spesifikasi Backend VenueConnect Polinela

> Backend berada pada folder tingkat atas backend/. Teknologi: Next.js Route Handlers, JavaScript, Prisma, PostgreSQL, Vercel AI SDK dan Gemini API sebagaimana proposal. Model yang disebut proposal adalah gemini-3.1-flash-lite; ketersediaan diverifikasi saat implementasi.

## Struktur folder backend

    backend/
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.js
    ├── src/
    │   ├── app/
    │   │   ├── api/v1/
    │   │   │   ├── buildings/route.js
    │   │   │   ├── buildings/[id]/route.js
    │   │   │   ├── availability/route.js
    │   │   │   ├── bookings/route.js
    │   │   │   ├── bookings/[id]/route.js
    │   │   │   ├── bookings/[id]/submit/route.js
    │   │   │   ├── bookings/[id]/documents/route.js
    │   │   │   ├── bookings/[id]/revise/route.js
    │   │   │   ├── admin/bookings/[id]/review/route.js
    │   │   │   ├── bookings/[id]/cancel/route.js
    │   │   │   ├── bookings/[id]/handover/route.js
    │   │   │   ├── bookings/[id]/complete/route.js
    │   │   │   ├── payments/[id]/verify/route.js
    │   │   │   └── assistant/route.js
    │   │   ├── layout.js
    │   │   └── page.js
    │   ├── server/
    │   │   ├── auth/
    │   │   ├── db/prisma.js
    │   │   ├── policies/
    │   │   ├── validations/
    │   │   ├── services/
    │   │   ├── repositories/
    │   │   ├── ai/
    │   │   ├── audit/
    │   │   └── errors/
    │   └── config/
    ├── .env.example
    ├── next.config.js
    └── package.json

## Lapisan request

    HTTP → Route Handler → validasi/session → policy → service
         → repository → Prisma/PostgreSQL → DTO response

Route Handler Next.js berada di backend/src/app/api. File tersebut hanya menerjemahkan HTTP, memvalidasi request, mengambil identitas, memanggil service dan membentuk response. Query database dan aturan bisnis berada di backend/src/server.

Frontend memanggil API melalui URL konfigurasi. Jangan mengimpor module backend ke frontend.

## API awal

Prefix: /api/v1.

| Method/path                 | Akses                     | Fungsi                              |
| --------------------------- | ------------------------- | ----------------------------------- |
| GET /buildings              | Publik                    | Katalog dan filter                  |
| POST /buildings             | Admin development         | Buat gedung dan catat audit         |
| GET /admin/buildings        | Admin development         | Semua gedung, status, fasilitas, tarif berpaginasi |
| GET /buildings/:id          | Publik                    | Detail, fasilitas, dan tarif aktif  |
| GET /buildings/:slug/terms  | Publik                    | Syarat gedung yang disahkan, atau status `PENDING_POLICY` |
| PATCH /buildings/:slug      | Admin development         | Ubah data gedung dan catat audit    |
| GET /facilities             | Publik                    | Daftar fasilitas berpaginasi        |
| POST /facilities            | Admin development         | Buat fasilitas dan catat audit      |
| PATCH /facilities/:id       | Admin development         | Ubah fasilitas dan catat audit      |
| DELETE /facilities/:id      | Admin development         | Hapus fasilitas yang belum dipakai  |
| POST /buildings/:slug/facilities | Admin development    | Pasang fasilitas pada gedung        |
| PATCH /buildings/:slug/facilities/:facilityId | Admin development | Ubah detail fasilitas gedung    |
| DELETE /buildings/:slug/facilities/:facilityId | Admin development | Lepas fasilitas dari gedung     |
| GET /availability           | Publik                    | Ketersediaan gedung/rentang         |
| POST /bookings              | Pengguna masuk            | Membuat pengajuan                   |
| GET /bookings               | Pemohon                   | Daftar booking milik sendiri        |
| GET /admin/bookings         | Admin development         | Daftar pengajuan aktif, filter, pagination |
| GET /admin/bookings/:id     | Admin development         | Detail tanpa data requester untuk review      |
| POST /admin/bookings/:id/review | Admin development     | Mulai review, minta revisi mahasiswa, teruskan, konfirmasi, atau tolak |
| GET /admin/bookings/summary | Admin development         | Agregat booking per status tanpa identitas |
| GET /admin/buildings/:slug/rates | Admin development         | Daftar tarif gedung berpaginasi termasuk yang nonaktif |
| POST /admin/buildings/:slug/rates | Admin development         | Buat tarif tanpa periode aktif audience yang tumpang tindih |
| PATCH /admin/buildings/:slug/rates/:id | Admin development    | Ubah atau nonaktifkan tarif dan catat audit |
| GET /bookings/:id           | Pemilik/petugas berwenang | Detail dan riwayat                  |
| GET /approvals              | Approver/ADMIN development | Antrean langkah pertama yang ditugaskan, tanpa data kontak pemohon |
| POST /bookings/:id/cancel   | Pemilik                   | Membatalkan pengajuan sebelum routing/approval |
| POST /bookings/:id/revise   | Pemilik mahasiswa development | Kirim revisi beserta catatan/perubahan terpilih |
| POST /bookings/:id/documents | Pemilik mahasiswa development | Unggah PDF privat saat draf/revisi |
| POST /bookings/:id/submit   | Pemilik draf mahasiswa development | Kirim draf dengan satu PDF |
| POST /bookings/:id/payments | Pemilik rental development | Catat referensi transfer manual |
| POST /bookings/:id/approve  | Approver/ADMIN development | Menyetujui sesuai assignment       |
| POST /bookings/:id/reject   | Approver/ADMIN development | Menolak sesuai assignment          |
| POST /payments/:id/verify   | Verifier development      | Verifikasi pembayaran               |
| POST /payments/:id/reject   | Verifier development      | Tolak referensi pembayaran dengan alasan |
| GET /buildings/:slug/blocks   | Admin development          | Daftar blok jadwal dengan pagination |
| POST /buildings/:slug/blocks  | Admin development          | Membuat blok jadwal dan catat audit  |
| DELETE /buildings/:slug/blocks/:id | Admin development     | Hapus blok jadwal dan catat audit    |
| POST /bookings/:id/handover | Petugas gedung            | Catat serah-terima kunci            |
| POST /bookings/:id/complete | Pengelola                 | Tutup penggunaan                    |
| POST /assistant             | Publik/pengguna           | AI baca-saja                        |

## Response dan error

Sukses mengembalikan DTO minimum. Error memiliki code stabil, message aman dan requestId aman yang dibuat server jika caller tidak menyediakannya; ID yang sama disertakan pada log kesalahan tak terduga. Gunakan 400 input salah, 401 belum login, 403 tanpa izin, 404 tidak ada/tidak terlihat, 409 konflik jadwal/status, 422 aturan bisnis gagal, 429 rate limit, 500 kesalahan tak terduga. Jangan kirim stack trace atau data pribadi.

## Service bisnis

### BookingService

Validasi pemohon aktif, gedung aktif, kategori pemohon terhadap `User.accountCategory` yang ditetapkan server, kelayakan sewa luar kampus, kapasitas, dan waktu mulai masa depan. Akun lama tanpa kategori belum boleh membuat booking. Verifikasi identitas nyata saat provisioning akun belum tersedia. Peminjaman `INTERNAL` hanya untuk mahasiswa, dosen, dan pegawai/civitas akademika Polinela; tidak mengambil tarif sewa. Penyewaan `RENTAL` hanya untuk akun luar kampus kategori `UMUM`: ambil tarif `EXTERNAL` yang berlaku saat waktu mulai dan simpan snapshot, tanpa fallback `ALL` atau `INTERNAL`. Periksa BuildingBlock dan booking yang memblokir slot di dalam transaksi. Simpan pengajuan dan audit dalam transaksi. Mahasiswa memulai dari DRAFT, mengunggah PDF privat, lalu mengirim; kategori lain langsung SUBMITTED. Pemohon hanya dapat membaca/mengubah booking miliknya.

### ApprovalService

Terapkan transisi status eksplisit, misalnya SUBMITTED → UNDER_REVIEW → AWAITING_APPROVAL → CONFIRMED untuk peminjaman yang memang memerlukan approval atau AWAITING_PAYMENT untuk rental; penolakan menjadi REJECTED. Body keputusan hanya menerima catatan teks hingga 2000 karakter; alasan penolakan wajib diisi. Untuk mahasiswa, wajibkan unggahan berkas peminjaman gedung dan jangan buat assignment approval Wakil Direktur III dalam sistem. Rute dasar lainnya pada proposal: dosen/pegawai ke Ketua Jurusan dan penyewaan masyarakat umum ke Wakil Direktur II Bidang Keuangan. Proposal juga menempatkan Subbagian Rumah Tangga/pengelola gedung pada pencatatan dan pengelolaan jadwal, tetapi tidak memastikan urutan tahap digital maupun tindak lanjut berkas mahasiswa. Simpan rute approval sebagai konfigurasi assignment berdasarkan kategori pemohon dan tahap, bukan nama pejabat hard-coded. Periksa role, assignment aktif, dan tahap yang ditugaskan. Simpan aktor, waktu, keputusan, komentar dan tahap. Saat approval akhir memblokir slot, cek konflik dan constraint database dalam transaksi yang sama. Konflik dikembalikan sebagai 409; jangan timpa booking lain. Delegasi, urutan tahap, serta pengecualian gedung harus dikonfirmasi sebelum alur produksi diaktifkan.

### PaymentService dan UsageService

MVP dapat mencatat/verifikasi pembayaran manual bila disetujui. Body catatan verifikasi dibatasi 2000 karakter. Jumlah berasal dari snapshot tarif, bukan input browser. Verifikasi hanya boleh mengubah `PENDING_VERIFICATION` menjadi `VERIFIED` saat booking berstatus `AWAITING_PAYMENT`; retry pembayaran yang sudah `VERIFIED` mengembalikan hasil tanpa membuat audit/notifikasi duplikat. Hanya role berwenang mengubah status verifikasi. Petugas mencatat serah-terima/pengembalian kunci; pengelola menutup penggunaan tanpa menghapus riwayat.

Tenggat, hold slot, pembatalan, refund dan payment gateway perlu diputuskan sebelum otomatisasi.

## Anti-conflict jadwal

Interval booking memakai [startsAt, endsAt) agar waktu berurutan tepat di batas tidak dianggap bentrok. Konflik dihitung dari gedung, waktu, status pemblokir dan BuildingBlock. Periksa saat submit dan ulangi pada approval final. Submit booking, approval yang mengunci slot, dan pembuatan blokir mengambil row lock pada gedung yang sama sebelum mengecek jadwal. Mutasi booking/pembayaran/handover juga mengunci booking sebelum membaca status terbaru agar retry serentak tidak menggandakan transisi/riwayat. Constraint exclusion PostgreSQL tetap melindungi booking terkunci dari persetujuan bersamaan. Petakan constraint/serialization error menjadi HTTP 409. Hold saat menunggu perlu kebijakan.

## Keamanan dan privasi

- Jangan percaya role, requesterId, paymentStatus atau approvedBy dari payload klien tanpa verifikasi.
- Terapkan ownership check pada detail booking dan lampiran.
- Gunakan session cookie aman dan validasi request di server.
- Stub `x-user-id` hanya untuk development: ID harus UUID user aktif di database, dan role berasal dari relasi `UserRole`; role yang tidak cukup menghasilkan 403. ADMIN tidak otomatis memenuhi semua guard role: override hanya dinyatakan eksplisit pada route persetujuan dan dicatat di audit; verifikasi pembayaran memerlukan `PAYMENT_VERIFIER`, serah-terima memerlukan `BUILDING_OFFICER`. Production selalu menolak stub ini sampai provider sesi resmi tersedia.
- Frontend tidak menyimpan identitas mock di localStorage. Pada `next dev`, `NEXT_PUBLIC_DEV_USER_ID` opsional mengirim identitas demo ke API untuk simulasi; build produksi tidak mengaktifkan tindakan ini.
- Batasi payload dan rate limit login, pengajuan, dan AI.
- API key Gemini hanya ada di environment backend.
- Audit status, tarif, blokir, pembayaran, role dan aksi sensitif dengan metadata tersaring.
- Atur CSRF/CORS sesuai domain deployment; jangan gunakan origin wildcard bersama credentials.

## AI Agent baca-saja

Proposal menetapkan AI untuk pencarian gedung, jadwal, tarif dan prosedur; keputusan tetap pada pengelola. Model `gemini-3.1-flash-lite` telah diverifikasi sebagai model stabil dengan dukungan function calling pada dokumentasi Google (2026-10-09). Vercel AI SDK menyediakan provider Google melalui `@ai-sdk/google`; API key dibaca hanya dari environment backend. Contoh nama variabel tersedia di `backend/.env.example`, tanpa kredensial.

Tools baca-saja `searchBuildings`, `getBuildingDetails`, `getCurrentRate`, `checkAvailability`, dan `getProcedure` tersedia di endpoint `/api/v1/assistant`. Endpoint menerima satu pertanyaan terbatas, menolak pola umum surel, telepon Indonesia dengan pemisah, nomor identitas 16 digit, nomor berlabel NPM/NIP/NIK/KTP/paspor, serta pernyataan nama/alamat pengirim sebelum request mencapai provider. Pesan tidak disimpan; endpoint membatasi 5 permintaan per menit per proses, membatasi cache limiter hingga 10.000 client key dengan pembersihan berkala, serta membatasi putaran tool dan waktu provider. Filter ini berbasis pola dan tidak menjamin deteksi seluruh PII dalam teks bebas. Prosedur resmi menjawab belum tersedia karena sumber kebijakan belum dimuat. Jangan buat tool create/update/cancel/approve. Jangan kirim identitas, kontak, dokumen atau detail acara pribadi ke model.

Endpoint tertutup secara default. Aktifkan hanya setelah API key disediakan; saat production juga wajib ada shared rate limiter di gateway (`AI_RATE_LIMITING_CONFIGURED=true`). Batas per proses hanya untuk development dan bukan pengganti pembatasan terdistribusi.

Rujukan implementasi: [Gemini 3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite) dan [Google provider untuk Vercel AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/google).

## Konfigurasi dan komunikasi lintas aplikasi

Backend memakai DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY, APP_BASE_URL. Frontend memakai `BACKEND_API_ORIGIN` di server untuk proxy `/api/v1`; browser tetap pada origin frontend. Rahasia tidak boleh memakai prefix NEXT_PUBLIC.

Jika frontend dan backend beda origin, backend mengizinkan hanya origin frontend yang ditetapkan. Konfigurasi cookie/session dan CSRF harus diuji pada domain produksi. Lebih sederhana bila reverse proxy mengekspos keduanya pada satu domain, misalnya / untuk frontend dan /api untuk backend; pemilihan hosting masih perlu keputusan.

## Field wajib dan validasi request

POST /bookings menerima buildingId, bookingType, `applicantCategory`, startsAt, endsAt, eventName, eventDescription opsional, dan attendeeCount bila relevan; schema menolak field tak dikenal. Kategori harus cocok dengan `User.accountCategory` yang ditetapkan server; akun tanpa kategori ditolak. Kategori mahasiswa/dosen-pegawai hanya cocok dengan akun INTERNAL dan tipe INTERNAL; kategori UMUM hanya cocok dengan akun EXTERNAL dan tipe RENTAL. Sistem belum dapat membuktikan identitas mahasiswa atau dosen/pegawai saat provisioning akun. Mahasiswa dibuat sebagai DRAFT, mengunggah satu PDF maksimum 5 MB lewat route privat development, lalu memanggil `/bookings/:id/submit`. requesterId, role, tarif, dan status ditentukan/validasi oleh backend, bukan dipercaya dari browser. startsAt/endsAt harus ISO 8601 ber-offset; end harus sesudah start. Jam operasional, buffer, dokumen dan eligibility produksi tetap menunggu aturan per gedung yang disahkan.

POST `/admin/bookings/:id/review` tersedia hanya bagi ADMIN development dengan aksi START_REVIEW, REQUEST_REVISION, FORWARD, CONFIRM_STUDENT, atau REJECT. FORWARD membaca kategori yang tersimpan dan menugaskan role APPROVER generik; mahasiswa hanya dapat dikonfirmasi melalui keputusan operator eksplisit setelah berkas diperiksa. POST `/bookings/:id/revise` menerima perbaikan mahasiswa ketika status REVISION_REQUESTED, memeriksa ulang jadwal dan berkas, lalu mengirim ulang. Assignment jabatan, delegasi, dan instruksi lintas kategori harus disahkan sebelum produksi.

List endpoint memakai page/pageSize (default 20, max 100), sort dan filter yang diizinkan; daftar booking diurutkan `createdAt` lalu `id` secara menurun agar pagination stabil saat timestamp sama. GET `/api/v1/buildings` menerima filter katalog opsional `q` (nama/lokasi), `facility` (nama fasilitas), `minCapacity`, `publicRental` lama, dan `purpose=loan|rental`. `loan` memfilter `internalLoanEnabled=true`; `rental` memfilter `publicRentalEnabled=true`. GSG memiliki keduanya sehingga satu jadwal melayani dua katalog. Hasil hanya memuat gedung aktif serta tarif aktif untuk audience `EXTERNAL`; tarif `INTERNAL`/`ALL` tidak muncul di API publik. Opsi harga dengan `isBookable=false` tetap tampil sebagai informasi, tanpa menjadi snapshot booking. GET availability mengembalikan blok waktu umum saja, tanpa pemohon atau detail kegiatan, hanya melayani gedung aktif, dan membatasi satu rentang query hingga 366 hari. Response menggunakan DTO, timestamp ISO 8601 dan pagination metadata.

Pembuatan dan penghapusan blok jadwal memakai row lock gedung yang sama dengan booking/approval. Penghapusan mensyaratkan blok tersebut memang milik gedung pada URL dan menulis audit tanpa menyalin alasan bebas ke metadata.

Pembuatan/perubahan gedung hanya menerima field yang diizinkan oleh schema admin, mengharuskan status aktif, izin peminjaman internal, dan izin sewa luar kampus dipilih eksplisit saat create, memakai role ADMIN pada guard development, dan menulis audit di transaksi yang sama. Admin dapat menyimpan draf `termsAndConditions` dan `termsApprovalReference` lewat PATCH; `publishTerms=true` memerlukan kedua nilai tersebut dan menandai waktu terbit. Jika teks atau referensi diubah tanpa penerbitan ulang, status terbit dicabut. GET syarat publik hanya mengembalikan teks yang terbit dan mempunyai referensi; audit mencatat nama field yang berubah tanpa menyalin isinya. Perubahan metadata gedung mengambil row lock jadwal gedung; konflik slug dikembalikan sebagai 409. Soft-disable mencegah detail/katalog dan booking baru, tetapi tidak mengubah booking lama. Booking baru membaca kedua izin setelah lock yang sama agar tidak memakai nilai lama. Guard autentikasi production belum tersedia.

Master fasilitas dapat dibaca publik secara berpaginasi. Perubahan memerlukan ADMIN pada guard development dan diaudit di transaksi yang sama. Penghapusan mengambil lock fasilitas dan ditolak selama fasilitas masih terpasang pada gedung. Relasi fasilitas per gedung dapat dipasang, diperbarui detailnya, dan dilepas oleh ADMIN; audit hanya menyimpan ID relasi.

Administrasi tarif tersedia hanya melalui guard ADMIN development. API menerima `IDR`, audience, nominal decimal, satuan, periode efektif, status aktif, `isBookable`, dan batas durasi menit opsional. Hanya audience `EXTERNAL` dipublikasikan; booking `RENTAL` hanya memakai tarif aktif `isBookable=true`. `INTERNAL`/`ALL` tetap dalam model untuk data administrasi lama. Tarif dengan nama sama atau dua tarif bookable pada audience/periode yang sama tidak boleh tumpang tindih; beberapa opsi informasi boleh tampil bersama. Mutasi mengambil row lock jadwal gedung yang sama dengan pembuatan booking, mencatat audit, dan tidak mengubah snapshot tarif booking lama. Pemetaan inventaris dan izin publikasi produksi tetap keputusan institusi.

## Matriks izin dan status

Gunakan capability server-side dari matriks pada 00-analysis-and-decisions.md. Jangan infer hak hanya dari nama halaman. Ownership dan assignment diperiksa pada setiap endpoint detail/mutasi; approve/reject hanya menerima booking `AWAITING_APPROVAL` dan mencocokkan actor dengan user/role pada langkah `PENDING` pertama, dengan override ADMIN tercatat. Booking status mengacu pada status kanonik: AWAITING_PAYMENT dan CONFIRMED mengunci slot; pembayaran terverifikasi mengubah rental dari AWAITING_PAYMENT menjadi CONFIRMED; expiry melepaskan slot. ApprovalHistory mencatat keputusan tanpa menimpa riwayat.

## Verifikasi endpoint sebelum rilis

Cakup route contract, validasi, permission, ownership, pagination, konflik 409, idempotency, dan audit. Uji dua keputusan bersamaan pada slot yang sama; pastikan hanya satu dapat mengunci slot. Uji payment expiry dan role boundary. Rencana skenario lintas produk ada di 00-analysis-and-decisions.md.

## Endpoint pengelolaan dan notifikasi

Endpoint operasional `GET /api/health` memeriksa koneksi database saat ada request. Respons sukses hanya menyatakan `status`, `timestamp`, dan `db: connected`; kegagalan mengembalikan status 503 dan `db: error` tanpa rincian koneksi.

`StorageProvider` dan `LocalStorageProvider` menyimpan blob ber-ID acak di luar folder publik, memakai permission privat pada filesystem lokal, serta membatasi key menjadi UUID untuk mencegah traversal. Local provider tidak membuat URL publik/signed. Upload, download, dan penghapusan berkas draft/revisi kini memakai route dengan session development serta pemeriksaan ownership; admin development dapat mengunduh untuk review. Provider lokal dan session development menolak produksi. Retensi/penghapusan berkas setelah status terminal, backup object, serta object storage production masih menunggu kebijakan dan infrastruktur.

Route berikut melengkapi tabel API awal agar kebutuhan FR-09 dan FR-12 dapat dibangun:

| Method/path                      | Akses                         | Fungsi                                                |
| -------------------------------- | ----------------------------- | ----------------------------------------------------- |
| GET /admin/buildings             | Admin                         | Daftar gedung untuk dikelola                          |
| GET /admin/bookings              | Admin development             | Daftar aktif tanpa identitas pemohon        |
| GET /admin/bookings/:id          | Admin development             | Detail untuk review tanpa data requester                          |
| GET /admin/bookings/summary      | Admin development             | Agregat jumlah booking per status                     |
| GET /admin/usage                 | Admin/petugas gedung development | Daftar booking terkonfirmasi dan status serah-terima |
| GET /admin/usage/history         | Admin/petugas gedung development | Riwayat serah-terima dan tindakan petugas berpaginasi, tanpa identitas pemohon atau catatan kondisi |
| GET /admin/payments              | Verifier development          | Antrean pembayaran menunggu verifikasi                 |
| POST /admin/buildings            | Admin                         | Membuat gedung                                        |
| PATCH /admin/buildings/:id       | Admin                         | Memperbarui/mengaktifkan/menonaktifkan gedung         |
| POST /admin/buildings/:id/rates  | Admin tarif                   | Membuat tarif dengan periode berlaku                  |
| PATCH /admin/rates/:id           | Admin tarif                   | Mengubah tarif tanpa mengubah snapshot booking lama   |
| GET /buildings/:slug/blocks      | Admin development             | Membaca blok jadwal gedung dengan pagination          |
| POST /buildings/:slug/blocks     | Admin development             | Membuat periode tidak tersedia                        |
| DELETE /buildings/:slug/blocks/:id | Admin development           | Menghapus blokir dan mencatat audit                   |
| POST /bookings/:id/payments      | Pemilik booking development   | Mencatat referensi transfer manual dari snapshot tarif |
| POST /payments/:id/reject        | Verifier development          | Menolak referensi dengan catatan dan memberi notifikasi |
| POST /payments/:id/verify        | Verifier                      | Verifikasi pembayaran dan konfirmasi booking atomik   |
| POST /bookings/:id/documents     | Pemilik draft mahasiswa development | Unggah/ganti satu PDF privat maksimal 5 MB |
| GET/DELETE /bookings/:id/documents/:documentId | Pemilik development; GET juga admin | Unduh privat atau hapus draft/revisi |
| POST /bookings/:id/submit        | Pemilik draft mahasiswa development | Kirim setelah satu PDF tersimpan |
| POST /admin/bookings/:id/review  | Admin development             | Pemeriksaan, revisi, routing, keputusan mahasiswa |
| GET /notifications               | Pengguna masuk                | Membaca inbox milik sendiri                           |
| POST /notifications/:id/read     | Pemilik notifikasi            | Menandai sudah dibaca                                 |

Endpoint admin tetap memerlukan pemeriksaan capability per resource. Perubahan tarif/blokir menulis AuditEvent dan tidak mengubah transaksi yang sudah tersimpan.

## Perilaku pembayaran dan notifikasi

Persetujuan akhir rental mengubah booking ke AWAITING_PAYMENT dan mengunci slot sesuai baseline proyek. `paymentDueAt` tetap null sampai tenggat disahkan; tidak ada expiry otomatis. Pemohon development dapat mencatat referensi transfer manual; jumlah/mata uang diambil dari snapshot tarif. Verifier development dapat menolak dengan catatan atau memverifikasi; verifikasi sukses mengubah Payment menjadi VERIFIED dan Booking menjadi CONFIRMED dalam transaksi. Referensi yang sama saat masih pending dan retry verifikasi yang sudah sukses tidak menggandakan event.

Notifikasi in-app dibuat sesudah pengajuan diterima, perubahan review/keputusan, routing ke role approver, revisi mahasiswa, pencatatan/penolakan/verifikasi pembayaran, pembatalan awal, dan aksi serah-terima yang sudah diimplementasikan. Gagal membuat notifikasi tidak membatalkan transaksi bisnis. Pemicu dan kebijakan notifikasi produksi masih memerlukan audit bersama pemilik proses.

## Rujukan lintas dokumen

Status, matriks akses, error contract, target NFR dan keputusan pemilik kebijakan dirinci pada 00-analysis-and-decisions.md. PRD menjadi sumber tujuan produk; dokumen ini menjadi sumber implementasi API/server.
