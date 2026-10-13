**PRODUCT REQUIREMENTS DOCUMENT**

# VenueConnect Polinela

Sistem digital peminjaman dan pengelolaan gedung untuk sivitas akademika dan publik

| Informasi dokumen        | Nilai                                                      |
| ------------------------ | ---------------------------------------------------------- |
| Versi                    | 0.2 — baseline proyek untuk ditinjau                        |
| Tanggal                  | 12 Oktober 2026                                             |
| Dasar penyusunan         | Proposal VenueConnect FIX yang diberikan pengguna, keputusan baseline proyek, dan spesifikasi workspace |
| Status                   | Draft; belum disahkan pemilik proses Polinela               |
| Pemilik produk sementara | Tim Proyek Mandiri Manajemen Informatika                   |

Catatan penggunaan: kebutuhan yang dinyatakan proposal ditulis sebagai dasar produk. Rincian yang belum ditetapkan proposal ditandai sebagai usulan atau keputusan yang perlu dikonfirmasi sebelum implementasi.

## 1. Ringkasan Produk

VenueConnect Polinela adalah aplikasi web untuk memusatkan informasi gedung, kalender ketersediaan, pengajuan peminjaman internal, penyewaan oleh publik, proses persetujuan, serta pencatatan penggunaan. Sistem ditujukan untuk mengurangi pengecekan manual, pengajuan ulang akibat jadwal yang sudah terpakai, dan miskomunikasi antara peminjam, pengelola, serta petugas gedung.

AI Agent menjadi asisten informasi yang membantu pengguna menemukan gedung, tarif, jadwal, dan prosedur. AI tidak memutuskan persetujuan dan tidak mengubah data peminjaman. Keputusan transaksi tetap melewati alur aplikasi dan petugas berwenang.

PRD ini mengubah gagasan proposal menjadi kebutuhan produk yang dapat dirancang dan diuji. Dokumen ini bukan keputusan kebijakan Polinela; aturan operasional seperti kewenangan persetujuan, syarat dokumen, tenggat pembayaran, dan publikasi tarif masih memerlukan konfirmasi pengelola.

## 2. Masalah dan Peluang

Proses saat ini melibatkan surat, pengecekan ke subbagian rumah tangga, memo, petugas kunci, jaminan KTM untuk peminjam internal, dan konfirmasi setelah kegiatan. Ketersediaan gedung belum mudah diperiksa lebih awal. Pengajuan dapat perlu diubah ketika waktu atau gedung ternyata sudah digunakan pihak lain. Polinela juga menyediakan penyewaan fasilitas kepada publik, sehingga informasi jadwal dan tarif perlu dikelola dalam sumber data yang sama.

Survei sumber yang diberikan pengguna menguatkan sinyal kebutuhan: 29 dari 45 mahasiswa menjawab `Sering` kesulitan mengetahui ketersediaan; 12 dari 13 respons umum menilai informasi ketersediaan sangat penting. Audit pada `docs/14-validasi-survei-sumber.md` mencatat satu jawaban kosong pada pertanyaan bentrok mahasiswa, 16 jawaban penggunaan mahasiswa yang tidak konsisten secara literal, satu jawaban manfaat website yang ambigu, serta lima nama kosong pada survei umum. Lingkup pratinjau terbaru: empat gedung untuk peminjaman (CB, QB, Sakura, GSG) dan dua belas pilihan sewa (GSG serta sebelas ruang/layanan dari tabel pengguna), dengan GSG satu gedung pada kedua alur. Alamat hanya diberikan untuk empat gedung awal. Rincian di `docs/15-inventaris-peminjaman-penyewaan.md`.

## 3. Tujuan dan Ukuran Keberhasilan

| Tujuan                                | Ukuran keberhasilan yang diusulkan                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Memudahkan pencarian informasi        | Pengguna dapat menemukan gedung, fasilitas, tarif publik, syarat, dan jadwal tanpa meminta pengecekan manual.               |
| Mengurangi bentrok jadwal             | Aplikasi menolak persetujuan jika gedung memiliki pengajuan disetujui yang waktunya bertumpang tindih.                      |
| Memusatkan pemrosesan                 | Pengajuan, status, keputusan, pembayaran (jika berlaku), serah-terima, dan riwayat tercatat pada satu sistem.               |
| Mendukung layanan mandiri             | Pengguna dapat mengajukan dan memantau status melalui web responsif.                                                        |
| Menyajikan bantuan AI yang terkontrol | Jawaban tentang jadwal/tarif bersumber dari data aplikasi; AI tidak memiliki kewenangan menyetujui atau mengubah transaksi. |

Target awal untuk diuji adalah: minimal 80% percobaan tugas inti selesai tanpa bantuan; minimal 80% peserta dapat menjelaskan langkah selanjutnya dari status; median waktu cek slot pada prototype paling lama 50% dari median proses manual yang diukur pada tugas setara; nol bentrok pada booking uji terkonfirmasi; dan nol akses lintas pemohon/dokumen tanpa izin. Target tersebut adalah ukuran proyek sementara, bukan SLA institusi. Metode dan target tercatat di `docs/10-baseline-kebutuhan-mvp.md` dan perlu disepakati pemilik proses sebelum UAT.

## 4. Pengguna dan Hak Akses

| Peran                                        | Kebutuhan utama                                                                                | Akses yang diusulkan                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Peminjam internal: mahasiswa, dosen, dan pegawai/civitas akademika Polinela | Melihat jadwal, mengajukan peminjaman gedung, memantau keputusan. | Melihat informasi publik; membuat dan melihat pengajuan miliknya. |
| Penyewa eksternal: orang/instansi luar kampus | Melihat gedung, jadwal, tarif sewa luar kampus, syarat; mengajukan sewa dan memenuhi pembayaran bila disetujui. | Melihat informasi publik; membuat dan melihat pengajuan miliknya. |
| Admin/pengelola gedung                       | Memeriksa data dan jadwal, memverifikasi, memproses pengajuan, memperbarui informasi gedung.   | Mengelola data operasional sesuai kewenangan.                     |
| Pengambil keputusan sesuai assignment        | Menilai pengajuan yang ditugaskan dan mencatat keputusan sesuai kewenangan.                     | Melihat item yang ditugaskan; jabatan/role spesifik ditetapkan pemilik proses, tidak di-hard-code. |
| Petugas gedung/pemegang kunci                | Mengetahui jadwal disetujui dan mencatat penyerahan/pengembalian kunci.                        | Melihat jadwal tugas; memperbarui serah-terima sesuai kewenangan. |

Usulan akses: akun internal menggunakan mekanisme autentikasi yang disetujui Polinela; akun publik menggunakan pendaftaran dan login. Penyedia identitas dan proses verifikasi akun belum ditentukan di proposal dan harus diputuskan sebelum implementasi.

Keputusan pengguna 13 Oktober 2026 menetapkan peminjaman hanya untuk civitas akademika Polinela dan penyewaan hanya untuk pihak luar kampus. Harga pada katalog/detail/asisten publik hanya tarif sewa luar kampus (`EXTERNAL`) setelah data per gedung disahkan. Pengajuan peminjaman internal tidak menggunakan tarif sewa luar kampus; tarif `INTERNAL`/`ALL` yang tersimpan sebagai data administrasi lama tidak dipublikasikan dan tidak menjadi fallback booking sewa.

## 5. Lingkup Produk

### Termasuk MVP proyek (lingkungan non-produksi)

- Katalog gedung dengan lokasi, kapasitas, fasilitas, aturan penggunaan, tarif sewa publik, dan kontak/prosedur yang disahkan pengelola.
- Kalender ketersediaan per gedung dan rentang tanggal/waktu dengan informasi yang tidak membocorkan identitas atau data pribadi pemesan.
- Formulir pengajuan peminjaman internal dan penyewaan eksternal, dengan isian yang dapat disesuaikan kebijakan.
- Pemeriksaan bentrok jadwal dan status pengajuan yang dapat dilihat pemohon.
- Dashboard pengelola untuk meninjau, menyetujui/menolak, memberi alasan, dan mengelola data gedung serta tarif.
- Pencatatan pembayaran transfer manual untuk sewa setelah persetujuan; tidak menggunakan gateway atau refund otomatis pada baseline proyek.
- Pencatatan serah-terima kunci dan penyelesaian penggunaan oleh petugas/pengelola.
- Riwayat pengajuan dan audit perubahan penting.
- AI Agent untuk pencarian informasi dengan akses baca terbatas ke fungsi backend yang disediakan aplikasi.

### Gerbang yang menahan pemakaian produksi

- Pengguna menetapkan produksi tetap nonaktif sampai autentikasi, pemilik role, assignment, data gedung/tarif, kebijakan dokumen, payment flow, hosting, backup, dukungan, dan publikasi disahkan.
- Baseline proyek dokumen mahasiswa adalah satu PDF maksimum 5 MB, privat, akses pemohon dan petugas yang ditugaskan, dengan usulan retensi 90 hari setelah status terminal. Upload nyata dan penghapusan otomatis belum boleh diaktifkan sebelum persetujuan TI/pemilik arsip.
- Nilai jam operasional, kapasitas aktif, durasi, buffer, SLA, dan deadline tidak di-hard-code tanpa data pengelola.

### Di luar lingkup MVP kecuali disetujui kemudian

- Persetujuan otomatis oleh AI atau AI yang mengubah transaksi.
- Integrasi pembayaran daring, tanda tangan elektronik, notifikasi WhatsApp/SMS, atau SSO kampus sebelum penyedia dan kebijakannya ditetapkan.
- Pemeliharaan fasilitas, inventaris aset umum, pengelolaan acara, dan penagihan akuntansi di luar transaksi sewa gedung.
- Aplikasi native iOS/Android; produk awal berupa website responsif.

## 6. Alur Utama

### 6.1 Pengajuan peminjaman internal

1. Pengguna masuk dan memilih gedung serta tanggal/waktu pada kalender.
1. Sistem menampilkan jadwal tersedia dan aturan penggunaan; pengguna mengisi detail kegiatan dan persyaratan yang berlaku.
1. Sistem memvalidasi kelengkapan serta bentrok. Pengajuan yang lolos dicatat dengan status Menunggu pemeriksaan.
1. Mahasiswa melampirkan satu PDF sesuai baseline proyek; sistem tidak membuat langkah approval Wakil Direktur III dan tidak menyetujui otomatis.
1. Pengajuan menjadi `SUBMITTED`, lalu pengelola melakukan pemeriksaan awal `UNDER_REVIEW` dan mencatat aktor/waktu/catatan.
1. Pengelola meminta revisi atau meneruskan ke pengambil keputusan yang ditugaskan; tidak ada jabatan approver hard-coded.
1. Pemohon menerima status dan catatan yang boleh dibagikan. Slot tidak ditahan saat pemeriksaan; keputusan internal yang disetujui menjadi `CONFIRMED`.
1. Petugas melihat jadwal, mencatat serah-terima kunci, lalu pengelola menutup penggunaan dan menyimpan riwayat.

### 6.2 Penyewaan oleh publik

1. Pengguna publik mencari gedung, tanggal, ketersediaan, tarif, dan syarat.
1. Pengguna mendaftar/masuk, mengirim permohonan sewa beserta informasi kegiatan dan persyaratan.
1. Sistem mencatat pengajuan untuk dikelola pengelola/Subbagian Rumah Tangga dan BLU; keputusan diteruskan melalui assignment resmi, bukan nama jabatan tetap. Persetujuan belum berarti pembayaran diterima.
1. Setelah disetujui, status menjadi `AWAITING_PAYMENT`; pemohon mengikuti instruksi transfer manual yang telah ditetapkan BLU dan verifier BLU memeriksa bukti/nominal. Deadline hanya berlaku bila ditetapkan.
1. Sistem menandai pemesanan terkonfirmasi sesuai kebijakan, mengunci jadwal, dan menampilkan instruksi penggunaan.
1. Petugas mencatat serah-terima; pengelola mencatat penyelesaian dan menutup transaksi.
   Kebijakan hold jadwal selama menunggu pembayaran, pembatalan, pengembalian dana, dan tenggat pembayaran adalah keputusan terbuka. Sistem harus menerapkan satu kebijakan yang konsisten sebelum transaksi publik diaktifkan.

Proposal FIX menjelaskan proses manual dan pengelolaan aset BLU, tetapi baseline sistem menggunakan assignment untuk keputusan. Urutan final, delegasi, pengecualian per gedung, dan pemilik assignment perlu disetujui institusi sebelum konfigurasi produksi.

## 7. Kebutuhan Fungsional

FR-01 Katalog dan detail gedung [Must]

Pengguna dapat mencari dan melihat informasi gedung, fasilitas, kapasitas, lokasi, aturan, tarif publik, dan syarat yang diterbitkan pengelola.

Kriteria penerimaan: Admin dapat membuat/mengubah data; perubahan tampil pada halaman publik setelah disimpan; tarif dan syarat memiliki status aktif/nonaktif atau periode berlaku.

FR-02 Kalender ketersediaan [Must]

Pengguna memilih gedung dan rentang waktu untuk melihat jadwal yang tersedia dan jadwal yang telah diblokir.

Kriteria penerimaan: Kalender menampilkan status/waktu sesuai zona waktu yang ditetapkan; tidak menampilkan nama atau detail pribadi pemohon; sumber jadwal adalah data transaksi sistem.

FR-03 Pembuatan pengajuan [Must]

Pengguna internal dan eksternal dapat membuat pengajuan dengan tipe permohonan, gedung, waktu, detail kegiatan, kontak, dan persyaratan yang berlaku. Mahasiswa wajib mengunggah berkas peminjaman gedung; alur sistem mahasiswa tidak mencakup approval langsung oleh Wakil Direktur III.

Kriteria penerimaan: Pada lingkungan uji, mahasiswa dapat memilih satu PDF maksimum 5 MB; file tidak dikirim oleh prototype dan upload nyata menunggu sign-off storage/arsip. Pengajuan menerima nomor dan status `SUBMITTED`; berkas nyata hanya dapat diakses pemohon dan petugas yang ditugaskan setelah kebijakan resmi tersedia.

FR-04 Validasi ketersediaan [Must]

Sistem memeriksa bentrok berdasarkan gedung, waktu mulai, waktu selesai, dan status transaksi.

Kriteria penerimaan: Sistem menolak waktu selesai yang tidak setelah waktu mulai; transaksi persetujuan yang bertumpang tindih tidak dapat tersimpan, termasuk saat dua admin memproses bersamaan.

FR-05 Alur pemeriksaan dan keputusan [Must]

Mahasiswa tidak memiliki langkah approval WD III dalam sistem. Untuk semua kategori, pengelola mencatat pemeriksaan awal dan mengarahkan keputusan melalui assignment yang ditetapkan pemilik proses. Baseline mahasiswa mengikuti `SUBMITTED` → `UNDER_REVIEW` → revisi atau keputusan pengelola; tidak ada persetujuan otomatis. Penyewaan publik tetap mengikuti administrasi aset BLU dan pembayaran manual.

Kriteria penerimaan: Setiap pemeriksaan/keputusan menyimpan aktor, waktu, status, serta catatan yang diperlukan; hanya assignee berwenang dapat memutuskan; mahasiswa tidak memiliki ApprovalStep WD III; riwayat status tetap utuh.

FR-06 Status dan riwayat pemohon [Must]

Pemohon dapat melihat daftar pengajuan miliknya, status terkini, catatan yang dapat dibagikan, dan riwayat perubahan.

Kriteria penerimaan: Pengguna tidak dapat melihat pengajuan pengguna lain; status terbaru sesuai catatan backend.

FR-07 Tarif dan pembayaran sewa [Must untuk proses manual; integrasi gateway TBD]

Pengelola mengatur tarif dan menandai pembayaran sewa setelah persetujuan.

Kriteria penerimaan: Tagihan merujuk tarif dan aturan yang berlaku saat pengajuan; status pembayaran dan verifikator tercatat; implementasi gateway hanya setelah diputuskan.

FR-08 Serah-terima dan penyelesaian [Must]

Petugas/pengelola mencatat penyerahan dan pengembalian kunci serta status penggunaan selesai.

Kriteria penerimaan: Catatan memuat waktu, petugas, status dan keterangan; transaksi selesai masuk riwayat dan tidak lagi dianggap jadwal aktif.

FR-09 Manajemen gedung dan jadwal [Must]

Admin dapat memperbarui profil gedung, fasilitas, tarif, periode tidak tersedia, serta jadwal yang diblokir untuk pemeliharaan atau kegiatan resmi.

Kriteria penerimaan: Semua perubahan tercatat; perubahan jadwal tidak menimpa pemesanan terkonfirmasi tanpa alur pembatalan/penanganan konflik.

FR-10 AI Agent informasi [Must terbatas]

Asisten menjawab pertanyaan prosedur dan mengambil data gedung, tarif, serta ketersediaan melalui fungsi backend yang diizinkan.

Kriteria penerimaan: Jawaban jadwal/tarif berasal dari hasil fungsi; AI menyebutkan saat data tidak ditemukan; AI tidak menyetujui, menolak, membuat, mengubah, atau membatalkan transaksi.

FR-11 Audit dan kontrol akses [Must]

Sistem menerapkan hak akses berbasis peran dan mencatat tindakan sensitif.

Kriteria penerimaan: Akses ditolak secara default untuk peran tanpa izin; audit menyimpan aktor, tindakan, objek, dan waktu tanpa mencatat rahasia seperti API key.

FR-12 Notifikasi [Should; kanal TBD]

Sistem memberi tahu perubahan status kepada pemohon dan petugas yang ditugaskan.

Kriteria penerimaan: Notifikasi sekurangnya terlihat di aplikasi; kanal email/pesan eksternal diputuskan kemudian; kegagalan notifikasi tidak menghapus transaksi.

## 8. Aturan Bisnis dan Status

| Objek             | Status yang diusulkan                                                                                | Aturan                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pengajuan         | Menunggu pemeriksaan; Perlu perbaikan; Menunggu persetujuan; Disetujui; Ditolak; Dibatalkan; Selesai | Perubahan status hanya melalui aksi berwenang dan disimpan dalam riwayat.               |
| Pembayaran sewa   | Belum dibayar; Menunggu verifikasi; Terverifikasi; Gagal/kedaluwarsa; Dikembalikan bila berlaku      | Status dan akibatnya pada jadwal mengikuti kebijakan pembayaran yang disetujui.         |
| Penggunaan gedung | Terjadwal; Kunci diserahkan; Sedang digunakan; Kunci dikembalikan; Selesai                           | Petugas/pengelola mencatat serah-terima; penyelesaian menutup transaksi.                |
| Ketersediaan      | Tersedia; Terjadwal; Tidak tersedia                                                                  | Periode terkonfirmasi, blokir pengelola, dan kebijakan hold menentukan status kalender. |

- Bentrok ditentukan oleh gedung dan irisan rentang waktu; aturan jeda persiapan/pembersihan harus dikonfirmasi.
- Zona waktu sistem: Asia/Jakarta sebagai usulan karena lokasi Polinela di Bandar Lampung; perlu disepakati dan digunakan konsisten pada tampilan serta penyimpanan.
- Jadwal publik hanya mengungkap ketersediaan/status umum. Informasi pemohon dan detail acara bersifat terbatas.
- Tarif yang ditampilkan berasal dari data yang disahkan pengelola, termasuk keputusan tarif layanan BLU yang berlaku. Mekanisme pembaruan/periode tarif dikonfirmasi oleh pemilik data.

## 9. Kebutuhan AI Agent

Desain usulan mengikuti proposal: Gemini API melalui Vercel AI SDK dengan function calling pada backend. Model disebut dalam proposal sebagai gemini-3.1-flash-lite; ketersediaan dan konfigurasi model perlu diverifikasi saat implementasi. API key hanya berada pada environment server, tidak pada frontend.

| Fungsi backend baca saja | Parameter minimum                             | Batas keluaran                                              |
| ------------------------ | --------------------------------------------- | ----------------------------------------------------------- |
| Cari gedung              | Kata kunci/lokasi/kapasitas/fasilitas         | Daftar gedung dari katalog aktif.                           |
| Lihat tarif dan syarat   | ID gedung dan tanggal berlaku bila diperlukan | Tarif/syarat yang tersimpan dan berlaku.                    |
| Cek ketersediaan         | ID gedung, tanggal, waktu mulai/selesai       | Status ketersediaan tanpa identitas pemesan.                |
| Jelaskan prosedur        | Tipe pengguna dan tahap alur                  | Informasi dari basis pengetahuan resmi yang dikelola admin. |

- AI tidak boleh memutuskan akses dari instruksi percakapan; validasi izin tetap dilakukan backend.
- Kirim data minimum. Jangan mengirim data pribadi pemohon atau isi dokumen persyaratan ke penyedia AI.
- Tampilkan bahwa jawaban dihasilkan AI dan sediakan jalur ke informasi resmi/pengelola saat jawaban tidak pasti.
- Catat metrik teknis secukupnya tanpa menyimpan percakapan sensitif secara default; kebijakan retensi perlu disepakati.
- Batasi permintaan, tangani timeout/error layanan, dan pastikan halaman peminjaman tetap dapat digunakan tanpa AI.

## 10. Kebutuhan Nonfungsional

| Area                        | Kebutuhan                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsif dan aksesibilitas | Tampilan dapat digunakan pada ponsel dan desktop; formulir memiliki label, pesan validasi jelas, navigasi keyboard, dan kontras memadai.                                   |
| Kinerja                     | Kalender, katalog, dan status harus terasa responsif pada koneksi kampus/seluler. Target angka P95 perlu ditetapkan setelah baseline dan lingkungan hosting diketahui.     |
| Keamanan                    | Gunakan autentikasi dan otorisasi sisi server; validasi input; lindungi sesi; rahasiakan API key; terapkan perlindungan terhadap akses lintas pengguna dan aksi tanpa hak. |
| Privasi                     | Minimalkan data pribadi, batasi akses dan pengungkapan, serta tetapkan retensi/penghapusan dengan kebijakan Polinela.                                                      |
| Integritas data             | Gunakan transaksi/constraint basis data untuk menjaga konsistensi pengajuan dan pencegahan bentrok, bukan hanya pemeriksaan UI.                                            |
| Ketersediaan dan pemulihan  | Tetapkan target uptime, backup, pemulihan data, pemantauan, dan prosedur insiden sesuai lingkungan hosting yang dipilih.                                                   |
| Kompatibilitas              | Uji pada browser desktop dan mobile yang disepakati tim; proposal menargetkan akses melalui smartphone, laptop, dan perangkat berinternet.                                 |

Target numerik keamanan, kinerja, ketersediaan, dan retensi belum ditetapkan proposal. Pemilik sistem perlu menyetujuinya sebelum rilis produksi.

## 11. Data Utama

| Entitas konseptual    | Data penting (rancangan awal)                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| User dan Role         | ID, identitas/login, tipe pengguna, status akun, peran.                                                            |
| Building dan Facility | ID, nama, lokasi, kapasitas, fasilitas, deskripsi, status.                                                         |
| Tariff dan Policy     | Gedung, tarif, periode berlaku, syarat, kategori pengguna.                                                         |
| Booking Request       | Pemohon, tipe internal/eksternal, tujuan kegiatan, gedung, rentang waktu, status, dokumen/rujukan bila diperlukan. |
| Approval History      | Pengajuan, pemberi keputusan, keputusan, waktu, komentar.                                                          |
| Payment Record        | Pengajuan sewa, jumlah, metode/rujukan, status, verifikator, waktu.                                                |
| Usage Handover        | Pengajuan, petugas, waktu serah-terima/pengembalian, kondisi/catatan.                                              |
| Audit Event           | Aktor, aksi, objek, waktu, metadata aman yang dibutuhkan.                                                          |

Model data final perlu mengikuti kebijakan pencatatan dan persetujuan Polinela. Hindari menyimpan data yang tidak diperlukan untuk operasional atau audit.

## 12. Kriteria Penerimaan MVP

1. Pengguna dapat menemukan gedung dan melihat fasilitas, tarif (untuk publik), syarat, serta ketersediaan dari halaman web responsif.
1. Peminjam internal dan penyewa umum dapat mengirim pengajuan sesuai formulir dan melihat status pengajuan masing-masing.
1. Admin dapat meninjau dan mencatat keputusan; pemberi persetujuan yang ditugaskan dapat mencatat keputusan sesuai haknya.
1. Sistem mencegah dua transaksi disetujui memakai gedung yang sama pada rentang waktu yang bertumpang tindih, termasuk dua proses persetujuan bersamaan.
1. Informasi pribadi pemohon tidak muncul pada kalender publik dan tidak dikirim ke fungsi AI jika tidak dibutuhkan.
1. AI dapat menjawab pertanyaan katalog/jadwal menggunakan data aplikasi, menyatakan bila data tidak tersedia, dan tidak dapat mengubah status transaksi.
1. Petugas/pengelola dapat mencatat serah-terima, pengembalian kunci, dan penyelesaian penggunaan.
1. Pengujian mencakup alur berhasil, input tidak valid, bentrok waktu, akses tanpa izin, kegagalan AI, dan kegagalan notifikasi. Hasil dan bukti uji tersimpan untuk evaluasi proyek.

## 13. Tahapan Pengembangan (RAD)

| Tahap                             | Aktivitas dan keluaran                                                                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirement Planning              | Validasi alur manual dengan subbagian rumah tangga, pengelola gedung, pemegang kunci, perwakilan internal, dan penyewa umum; putuskan kebijakan yang masih terbuka; susun baseline kebutuhan. |
| User Design / RAD Design Workshop | Prototipe katalog, kalender, pengajuan, dashboard, alur persetujuan, dan asisten AI; tinjau bersama pengguna; revisi use case, activity diagram, ERD, dan UI.                                 |
| Implementation                    | Bangun bertahap: katalog dan kalender, pengajuan/status, admin dan persetujuan, pembayaran pencatatan, serah-terima, lalu AI baca saja.                                                       |
| Validasi dan perbaikan            | Uji fungsional, integritas jadwal, hak akses, responsivitas, dan UAT; perbaiki temuan sebelum rilis.                                                                                          |
| Rilis dan serah terima            | Publikasikan setelah data gedung/tarif disahkan; siapkan panduan admin, backup, pemantauan, dan prosedur dukungan.                                                                            |

Jadwal rinci perlu mengisi minggu pelaksanaan September–Desember 2026 pada proposal. Jadwal saat ini di dokumen sumber belum menandai periode setiap kegiatan.

## 14. Risiko dan Mitigasi

| Risiko                                                                 | Mitigasi produk/proyek                                                                                                                 |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Kebijakan peminjaman internal dan publik berbeda atau belum disepakati | Lakukan lokakarya dengan pengelola; simpan aturan sebagai konfigurasi; jangan rilis alur transaksi sebelum persetujuan kebijakan.      |
| Data tarif/jadwal tidak mutakhir                                       | Tetapkan pemilik data, proses pembaruan, audit perubahan, dan waktu terakhir diperbarui.                                               |
| Bentrok akibat permintaan bersamaan                                    | Terapkan constraint/transaksi di basis data saat keputusan atau konfirmasi; uji konkurensi.                                            |
| AI memberi jawaban keliru atau data terlalu luas                       | Gunakan fungsi backend terbatas, data resmi, minimisasi data, batasan akses, pesan ketidakpastian, serta jalur ke petugas.             |
| Ketergantungan pada layanan eksternal/API key                          | Simpan rahasia di server, batasi biaya/pemakaian, tangani timeout, dan sediakan alur manual tanpa AI.                                  |
| Jadwal, biaya, atau sumber daya kelompok tidak sesuai                  | Rinci pemilik tugas, deliverable mingguan, biaya hosting/domain/API dan verifikasi apakah biaya pengembangan merupakan jasa eksternal. |

## 15. Keputusan Terbuka Sebelum Implementasi

| Keputusan                                                                                                      | Pihak yang perlu mengonfirmasi                 |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Bagaimana urutan pemeriksaan/pencatatan dan tindak lanjut berkas peminjaman mahasiswa setelah diunggah? Apakah ada delegasi atau pengecualian gedung? | Subbagian rumah tangga/pimpinan terkait. |
| Apakah jadwal yang menunggu persetujuan atau pembayaran menahan slot? Berapa lama dan bagaimana pembatalannya? | Pengelola gedung dan pengelola tarif/BLU.      |
| Format, ukuran maksimum, jenis file, dan masa simpan apa yang berlaku untuk berkas peminjaman mahasiswa serta dokumen pemohon lain? | Pemilik proses dan unit layanan. |
| Bagaimana pembayaran dilakukan dan diverifikasi? Apakah hanya pencatatan manual atau perlu payment gateway?    | Pengelola keuangan/BLU dan tim TI.             |
| Bagaimana autentikasi pengguna internal? Apakah ada SSO atau verifikasi akun kampus?                           | Tim TI/administrator identitas.                |
| Kanal notifikasi apa yang disetujui? Apa kebijakan retensi, privasi, backup, dan publikasi jadwal?             | Tim TI dan pemilik data.                       |
| Siapa pemilik operasional sistem setelah proyek, dan hosting/domain/API dibiayai oleh siapa?                   | Program studi, unit pengelola, dan tim proyek. |

## 16. Asumsi dan Ketergantungan

- Informasi gedung dan tarif disediakan serta disahkan oleh unit Polinela yang berwenang.
- Pengelola bersedia menunjuk petugas untuk memperbarui jadwal dan memproses pengajuan.
- Aplikasi awal berbentuk website responsif dengan Next.js, PostgreSQL, Prisma ORM, Tailwind CSS, FullCalendar, dan Vercel AI SDK sebagaimana direncanakan dalam proposal.
- Penyedia hosting, domain, autentikasi, model AI, dan mekanisme pembayaran final belum dikonfirmasi.
- Penggunaan data nyata, dokumen persyaratan, dan informasi pembayaran memerlukan persetujuan serta kebijakan pengelolaan data Polinela.

## Lampiran A. Jejak ke Proposal

PRD ini bersandar pada proposal VenueConnect Polinela: latar belakang proses manual dan bentrok jadwal; sasaran sivitas akademika serta publik; peran admin, pemberi persetujuan dan petugas kunci; rencana kalender, pengajuan, tarif, riwayat, dan AI Agent; metode RAD; serta tumpukan Next.js, PostgreSQL, Prisma ORM, Tailwind CSS, FullCalendar, Vercel AI SDK dan Gemini API. Hal-hal yang belum rinci di proposal ditulis sebagai usulan atau keputusan terbuka, bukan sebagai kebijakan yang telah disahkan.
