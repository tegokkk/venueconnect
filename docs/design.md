# VenueConnect Polinela — UI/UX Design Brief untuk Google Stitch

Dokumen ini adalah brief desain produk dan prompt kerja untuk menghasilkan prototipe multi-halaman di Google Stitch. Gunakan enam dokumen spesifikasi VenueConnect sebagai sumber kebutuhan. Prioritaskan pengalaman pengguna dan konsistensi antarlayar; detail teknis backend tidak perlu divisualisasikan.

## 1. Ringkasan produk

VenueConnect adalah layanan web kampus untuk menemukan gedung, memeriksa ketersediaan dan tarif, mengajukan peminjaman internal atau penyewaan, mengikuti status pengajuan, serta membantu pengelola memproses booking dan operasional gedung.

Pengguna utama:

- **Pengunjung/pemohon publik:** mencari gedung dan informasi penyewaan, melihat jadwal umum, lalu masuk atau mendaftar sesuai kebijakan yang berlaku.
- **Pemohon internal:** dosen, mahasiswa, atau pegawai yang mengajukan penggunaan gedung dan memantau pengajuannya.
- **Admin/pengelola:** memeriksa kelengkapan, mengelola gedung/tarif/blokir jadwal, dan meneruskan atau memutuskan pengajuan sesuai kewenangan.
- **Pengambil keputusan:** user/role yang ditetapkan lewat assignment pemilik proses. Jabatan Ketua Jurusan atau Wakil Direktur II tidak di-hard-code karena proposal FIX tidak memastikan urutan approver digital. Mahasiswa melampirkan dokumen pada baseline proyek tanpa approval WD III di dalam sistem.
- **Petugas gedung:** melihat jadwal tugas dan mencatat serah-terima/pengembalian kunci.
- **Verifikator pembayaran:** meninjau pembayaran rental yang menjadi tugasnya.

Tujuan pengalaman:

1. Membantu orang menemukan gedung dan memahami kelayakan waktu sebelum mengajukan.
2. Membuat alur pengajuan terasa jelas, singkat, dan dapat dipulihkan bila terjadi konflik atau kesalahan.
3. Membuat status dan langkah berikutnya mudah dipahami tanpa pengguna harus mengetahui istilah status internal sistem.
4. Membantu petugas bekerja cepat dengan antrean yang dapat dipindai dan detail yang sesuai tugasnya.
5. Menjaga informasi pribadi hanya tampil pada konteks yang berwenang.

## 2. Kesimpulan analisis spesifikasi

### Sudah cukup jelas untuk didesain

- Alur umum: cari gedung → periksa kalender/tarif/syarat → ajukan → pemeriksaan/persetujuan → pembayaran untuk rental jika disetujui → serah-terima → selesai.
- Jenis booking: peminjaman internal dan penyewaan publik.
- Kalender publik menunjukkan ketersediaan umum tanpa nama pemohon atau nama acara.
- Pemohon membutuhkan daftar pengajuan, detail, timeline status, alasan revisi/penolakan, dan tindakan berikutnya.
- Operator memiliki tampilan berdasarkan role; approver melihat tugasnya, petugas melihat jadwal/serah-terima, dan verifikator pembayaran melihat pembayaran yang perlu diverifikasi.
- Status UI harus mempunyai label teks; warna hanya penguat makna.
- Pengajuan menggunakan data minimum: gedung, waktu, nama kegiatan, deskripsi singkat, jumlah peserta bila relevan, serta kontak dari profil atau konfirmasi pemohon.
- Kalender dan formulir perlu mendukung kondisi loading, kosong, error, sesi habis, tanpa izin, konflik, sukses, dan data yang sudah berubah.
- Asisten AI hanya menjawab pertanyaan informasi gedung, jadwal, tarif, dan prosedur; AI bukan pengambil keputusan dan kegagalannya tidak boleh menghalangi alur booking.

### Belum boleh dianggap sebagai kebijakan final

Tampilkan hal-hal berikut sebagai konfigurasi/placeholder yang dapat diganti. Jangan isi dengan kebijakan rekaan:

- PNG lambang Polinela dari pengguna tersedia untuk pratinjau; izin publikasi institusi, warna merek resmi, dan aset foto berlisensi masih perlu dikonfirmasi.
- Tarif final, satuan tarif, jam operasional, kapasitas yang berlaku, buffer waktu, durasi maksimum, dan aturan tiap gedung.
- Metode pembayaran, instruksi pembayaran, tenggat pembayaran, refund, serta pembatalan/no-show.
- SSO, metode login/daftar, syarat verifikasi akun internal/publik, dan field identitas tambahan.
- Pengesahan institusi atas tindak lanjut berkas mahasiswa, meskipun baseline proyek telah menetapkan status awal, pemeriksaan pengelola, catatan, dan pemilik tindak lanjut.
- Alamat/kontak resmi, prosedur institusi, serta konten bantuan yang belum disediakan.

Tampilkan berkas mahasiswa sebagai satu PDF maksimum 5 MB pada baseline proyek, tanpa langkah approval Wakil Direktur III dan tanpa menganggap pengajuan langsung disetujui. Preview hanya boleh memilih file lokal; jangan mengirim/menyimpan dokumen. Untuk dosen/pegawai dan penyewaan publik, jelaskan pemeriksaan pengelola dan assignment tanpa menetapkan jabatan approver. Gunakan label **“Informasi akan ditampilkan setelah ditetapkan pengelola”** untuk data yang belum sah. Jangan tampilkan nomor rekening, QR pembayaran, minta KTP/NPM/NIP sebagai default, tetapkan tenggat fiktif, atau janjikan persetujuan otomatis.

## 3. Prinsip desain

- **Formal dan ramah kampus:** terasa resmi, tertata, dan mudah didekati; hindari gaya korporat yang dingin atau dekorasi berlebihan.
- **Utamakan tugas:** pencarian, jadwal, tarif, syarat, status, dan aksi utama menjadi fokus visual.
- **Jelaskan langkah berikutnya:** setiap status penting disertai makna singkat dan aksi yang tersedia.
- **Ringkas sebelum bertindak:** tampilkan ringkasan gedung, rentang waktu, jenis penggunaan, tarif/syarat yang tersedia, serta konfirmasi sebelum submit.
- **Mobile-first:** pemohon mungkin mengakses lewat ponsel; aksi utama harus mudah dijangkau dan kalender memiliki tampilan agenda.
- **Privasi sejak desain:** kalender publik tidak berisi identitas maupun nama kegiatan; detail privat hanya ada di halaman sesuai role.
- **Aksesibel:** kontras memadai, fokus keyboard terlihat, label selalu tampak, status tidak hanya dibedakan dengan warna, dan area tekan minimal 44 px.
- **Tidak menyalahkan pengguna:** pesan konflik/error memberi sebab dan jalan pemulihan, sambil mempertahankan isian yang sudah diisi.

## 4. Arah visual dan design system

Gunakan palet sementara dari style guide, bukan sebagai brand final. Buat token mudah diganti setelah Humas/Polinela memberi pedoman resmi.

### Warna

| Token      | Nilai sementara | Penggunaan                                      |
| ---------- | --------------- | ----------------------------------------------- |
| Brand 900  | `#173B32`       | Teks/elemen brand paling kuat, sidebar operator |
| Brand 700  | `#245C4D`       | Tombol utama, navigasi aktif, tautan penting    |
| Brand 600  | `#2F7662`       | Aksen interaksi dan ikon aktif                  |
| Brand 100  | `#E8F2EE`       | Latar lembut untuk panel/label brand            |
| Accent 600 | `#B7791F`       | Aksen hangat seperlunya, bukan status utama     |
| Accent 100 | `#FFF4D6`       | Sorotan informatif ringan                       |
| Text       | `#1F2933`       | Teks utama                                      |
| Muted      | `#5F6B76`       | Teks sekunder                                   |
| Border     | `#D8E0E5`       | Garis, pembatas, outline input                  |
| Surface    | `#FFFFFF`       | Kartu dan panel                                 |
| Page       | `#F6F8F7`       | Latar halaman                                   |

Status booking harus memakai label dan ikon/penanda visual bersama warna:

| Label yang ditampilkan         | Makna                   | Treatment                                                               |
| ------------------------------ | ----------------------- | ----------------------------------------------------------------------- |
| Terkirim                       | `SUBMITTED`             | Kuning lembut / warning                                                 |
| Sedang diperiksa               | `UNDER_REVIEW`          | Biru / info                                                             |
| Perlu perbaikan                | `REVISION_REQUESTED`    | Kuning / warning, tampilkan catatan dan tombol perbaiki                 |
| Menunggu persetujuan           | `AWAITING_APPROVAL`     | Kuning / warning                                                        |
| Disetujui, menunggu pembayaran | `AWAITING_PAYMENT`      | Kuning atau biru; tampilkan tenggat/instruksi hanya jika tersedia resmi |
| Disetujui                      | `CONFIRMED`             | Hijau / success                                                         |
| Ditolak                        | `REJECTED`              | Merah / danger, sertakan alasan bila boleh dibagikan                    |
| Dibatalkan / Kedaluwarsa       | `CANCELLED` / `EXPIRED` | Abu-abu / muted                                                         |
| Selesai                        | `COMPLETED`             | Abu-abu / muted                                                         |

Jangan tampilkan label “Disetujui” untuk `AWAITING_PAYMENT` secara tunggal; slot baru benar-benar terkonfirmasi pada status `CONFIRMED`.

### Tipografi, grid, dan bentuk

- Font: Inter atau font sans-serif sistem sebagai fallback.
- Body desktop/mobile: 16 px; teks sekunder minimal 14 px.
- H1: 32–40 px desktop, 28–32 px mobile. H2: 24–28 px. H3: 18–20 px.
- Bobot: 400 body, 500 label, 600 judul dan aksi utama.
- Spacing berbasis 4 px: 4, 8, 12, 16, 24, 32, 48, 64.
- Konten maksimal sekitar 1200 px, gutter 16 px mobile dan 24–32 px desktop.
- Kartu radius 10–12 px; input/tombol radius 8 px; border halus dan shadow ringan.
- Gunakan satu keluarga ikon outline yang konsisten. Jangan memakai emoji untuk navigasi atau status resmi.

### Komponen inti

- Header publik, footer, navigasi akun, sidebar operator, breadcrumb.
- Tombol primary/secondary/tertiary/destructive; minimum tinggi 44 px.
- Input teks, pencarian, select, date picker, time picker, checkbox, helper text, error field.
- Kartu gedung, kartu ringkasan, badge status, alert, toast, dialog konfirmasi.
- Toolbar kalender, legenda, event ketersediaan, tampilan agenda mobile.
- Stepper pengajuan, panel ringkasan, timeline status, tabel responsif, filter antrean.
- Empty state, skeleton/loading, error state dengan tombol coba lagi.
- Assistant launcher dan panel percakapan baca-saja.

## 5. Arsitektur informasi dan navigasi

### Pengunjung/pemohon

- Beranda
- Gedung
- Jadwal
- Prosedur/Bantuan
- Masuk
- Setelah login: Pengajuan Saya, Pengajuan Baru, Notifikasi, Profil

### Operator

Navigasi sesuai capability/role, bukan sekadar satu menu yang sama untuk semua:

- Ringkasan/Antrean
- Kalender operasional
- Pengajuan yang ditugaskan
- Gedung dan fasilitas (admin gedung)
- Tarif (role yang berwenang)
- Pembayaran untuk verifikasi (verifikator)
- Serah-terima/jadwal tugas (petugas)
- Riwayat yang dapat diakses role

Jangan tampilkan aksi atau data yang tidak relevan untuk role aktif. Sediakan identitas role/konteks kerja secara ringkas agar operator memahami antrean yang sedang dilihat.

## 6. Layar yang perlu dibuat di Google Stitch

Buat satu sistem visual koheren dengan variasi desktop dan mobile. Jadikan layar 1–8 prioritas prototipe utama; layar operator melengkapi alur operasional.

### 1. Beranda publik

- Header identitas VenueConnect/Polinela, menu Gedung, Jadwal, Prosedur, tombol Masuk.
- Hero dengan judul lugas: **“Temukan ruang yang tepat untuk kegiatan Anda”**.
- Form pencarian cepat: kata kunci gedung/lokasi, tanggal, jumlah peserta atau fasilitas bila relevan, tombol Cari gedung.
- Ringkasan langkah: Temukan gedung → Cek jadwal → Ajukan penggunaan.
- Pilihan gedung unggulan sebagai kartu foto, lokasi, kapasitas, fasilitas utama, dan CTA “Lihat detail”.
- CTA sekunder ke kalender dan prosedur.
- Footer untuk kontak/prosedur resmi sebagai placeholder sampai informasi tersedia.

### 2. Katalog gedung

- Judul, jumlah hasil, search field dan filter lokasi, kapasitas, fasilitas, ketersediaan tanggal.
- Desktop: filter di sisi kiri atau toolbar ringkas; hasil dalam grid 3 kolom.
- Mobile: filter dalam bottom sheet/drawer, hasil satu kolom.
- Kartu: foto konsisten, nama gedung, lokasi, kapasitas, fasilitas utama, tarif publik bila tarif resmi tersedia, dan tombol “Lihat detail”.
- Sediakan hasil kosong dengan tombol hapus filter dan error/loading state.

### 3. Detail gedung

- Breadcrumb, nama gedung, lokasi, galeri foto, deskripsi, kapasitas, fasilitas, aturan yang sudah disahkan.
- Panel ringkasan di desktop: tarif yang berlaku untuk tipe pengguna, unit tarif, CTA “Cek jadwal” dan “Ajukan penggunaan”. Tarif yang belum final ditandai “Belum tersedia”.
- Kalender ketersediaan yang menampilkan waktu/status umum saja; tampilkan zona waktu WIB/Asia Jakarta dan legenda.
- Mobile: CTA utama mudah ditemukan, ringkasan tarif dan info dapat dibuka/tutup tanpa menyembunyikan syarat penting.
- Jangan mengisi fasilitas, tarif, kebijakan, atau foto seolah data resmi jika hanya konten contoh.

### 4. Jadwal ketersediaan

- Pilih gedung, rentang tanggal, dan kontrol sebelumnya/berikutnya.
- Desktop: tampilan minggu/bulan dengan legenda “Tersedia”, “Tidak tersedia”, “Blokir operasional” hanya jika sumber data membedakannya.
- Mobile: tampilan agenda/list yang mudah dipindai; jangan memaksa kalender bulanan kecil.
- Event publik tidak pernah menampilkan nama pemohon, kontak, atau nama kegiatan.
- Tombol menuju detail gedung/pengajuan hanya tersedia sesuai konteks.
- Pesan konflik saat memilih slot menjelaskan bahwa waktu tidak lagi tersedia dan mempertahankan detail kegiatan yang telah dimasukkan.

### 5. Masuk/daftar

- Desain sederhana dan percaya diri, dengan identitas aplikasi dan tautan kembali ke katalog.
- Bentuk login/daftar dan pilihan internal/publik mengikuti konfigurasi yang akan ditetapkan; jangan mengasumsikan SSO atau verifikasi tertentu.
- Beri bantuan format input dan status error yang jelas. Jangan meminta NPM/NIP/KTP sebagai default.
- Buat state sesi kedaluwarsa dan pemulihan akses sebagai varian prototipe, tanpa menetapkan prosedur yang belum ada.

### 6. Wizard pengajuan

Gunakan stepper desktop dan layout satu kolom mobile. Tampilkan progres dan simpan konteks pemohon secara aman; jangan menampilkan konsep penyimpanan lokal sensitif.

1. **Jenis penggunaan & kegiatan:** internal/rental sesuai eligibility; nama kegiatan, deskripsi singkat, jumlah peserta bila relevan.
2. **Gedung & waktu:** pencarian gedung, tanggal, jam mulai/selesai, fasilitas/kapasitas, ketersediaan saat ini.
3. **Data pemohon & persyaratan:** kategori pemohon dan kontak akun yang relevan; untuk mahasiswa tampilkan satu PDF, maksimum 5 MB sesuai baseline proyek. Prototype hanya memvalidasi pilihan lokal dan tidak mengunggah. Akses/storage nyata menunggu sign-off TI/pemilik arsip.
4. **Tinjau pengajuan:** gedung, waktu, kegiatan, jumlah peserta, tarif/syarat resmi yang berlaku, ringkasan pembayaran hanya bila rental dan datanya tersedia, pernyataan yang disahkan.
5. **Konfirmasi:** nomor pengajuan, label “Terkirim”, perkiraan langkah selanjutnya tanpa menjanjikan durasi layanan.

Interaksi wajib:

- Validasi dekat field, label permanen, penanda wajib, helper text dan error yang dapat dibaca screen reader.
- Saat bentrok, sorot pilihan waktu, sarankan kembali ke kalender, dan pertahankan field lain.
- Jika submit gagal/jaringan putus, beri opsi coba lagi dan jangan mengklaim pengajuan tersimpan.
- Jika pengguna belum masuk, arahkan ke autentikasi dan kembali ke proses setelah login bila implementasi memungkinkan.
- Konfirmasi sebelum submit menampilkan ringkasan dan tombol utama konkret “Kirim pengajuan”.

### 7. Dashboard pemohon dan detail pengajuan

- Ringkasan pengajuan aktif, tombol “Ajukan penggunaan”, filter status, dan daftar booking.
- Desktop dapat memakai tabel dengan kolom referensi, gedung, waktu, jenis, status, diperbarui; mobile memakai kartu.
- Detail menampilkan nama kegiatan, gedung, rentang waktu WIB, timeline, riwayat perubahan yang boleh dilihat pemohon, catatan revisi/penolakan, dan aksi yang masih diizinkan.
- Untuk `AWAITING_PAYMENT`, tampilkan “Disetujui, menunggu pembayaran”; hanya tampilkan due date/metode/instruksi apabila backend memuat informasi resmi.
- Untuk `CONFIRMED`, tampilkan status pasti, informasi jadwal, dan persiapan berikutnya.
- Untuk pengajuan mahasiswa, gunakan `Terkirim` lalu `Sedang diperiksa`; jelaskan bahwa pengelola memeriksa berkas, tidak ada approval WD III di sistem, dan pengajuan belum disetujui otomatis.
- Empty state menjelaskan belum ada pengajuan dan menyediakan CTA.

### 8. Bantuan dan assistant AI

- Halaman bantuan memiliki prosedur statis/kontak resmi sebagai sumber utama yang tetap berguna tanpa AI.
- Panel chat membantu mencari gedung, tarif, ketersediaan, dan prosedur; sediakan pertanyaan contoh.
- Tandai bahwa jawaban AI bersifat informatif dan keputusan booking tetap diproses pengelola.
- Tampilkan sumber/tautan gedung atau prosedur bila data aplikasi tersedia.
- State timeout/error: “Asisten sedang tidak tersedia. Anda tetap dapat melihat gedung, jadwal, dan prosedur.” sertakan CTA ke halaman terkait.
- State tidak yakin: sarankan menghubungi pengelola melalui kontak resmi yang telah diisi.
- Jangan menawarkan AI untuk menyetujui, mengubah, membatalkan, atau memverifikasi booking.

### 9. Ringkasan operator dan antrean

- Dashboard desktop dengan sidebar role-aware, header pencarian/akun, kartu ringkasan jumlah item per status, filter, dan tabel antrean.
- Daftar menunjukkan referensi, pemohon (hanya untuk role berwenang), gedung, waktu, jenis, status, umur pengajuan, dan aksi “Tinjau”.
- Filter status, jenis, gedung, tanggal, dan pencarian referensi; kontrol filter harus jelas dan dapat di-reset.
- Mobile operator memakai kartu dan aksi utama yang tidak memerlukan tabel horizontal.
- Approver hanya melihat item yang ditugaskan; pemisahan ini harus terlihat dari judul/konteks antrean.

### 10. Detail review dan keputusan

- Layout dua kolom desktop: ringkasan permohonan dan ketersediaan di konten utama; panel review/keputusan di sisi kanan.
- Rincian privat hanya tampil ke role berwenang.
- Tampilkan konflik/ketersediaan terbaru, snapshot tarif bila relevan, dokumen hanya bila secara resmi diwajibkan, dan timeline keputusan sebelumnya.
- Aksi sesuai assignment: “Minta perbaikan”, “Tolak”, “Teruskan/Setujui” sesuai tahap. Aksi berisiko memakai dialog konfirmasi.
- Keputusan memiliki catatan; revisi/penolakan menyertakan alasan yang dapat dipahami pemohon.
- Bila slot berubah atau konflik muncul, tampilkan alert dan nonaktifkan aksi yang tak lagi sah, dengan cara kembali ke antrean.

### 11. Kalender operasional, gedung, tarif, pembayaran, dan serah-terima

Desain sebagai kelompok layar operator konsisten, dapat dijadikan halaman tambahan atau varian dari dashboard:

- **Kalender operasional:** filter gedung/tanggal/status, agenda tugas, blok operasional dan booking confirmed yang hanya terlihat untuk role berwenang.
- **Manajemen gedung:** daftar, aktif/nonaktif, fasilitas, kapasitas, lokasi, detail. Gunakan form ringkas dan dialog konfirmasi perubahan.
- **Manajemen tarif:** audience internal/eksternal, nilai, mata uang IDR, unit dan periode berlaku. Semua merupakan field admin, bukan klaim tarif untuk publik sebelum diterbitkan.
- **Verifikasi pembayaran:** jumlah berdasarkan snapshot server, status/reference yang tersedia, kontrol verifikasi khusus role, dan konfirmasi tindakan. Jangan membuat gateway/QR fiktif.
- **Serah-terima:** jadwal tugas, gedung/waktu, catatan kondisi sebelum/sesudah, tombol catat pemberian/pengembalian kunci; tampilkan identitas yang diperlukan petugas saja.
- Semua mutasi penting memberi hasil sukses/gagal yang spesifik dan tidak menghilangkan konteks kerja.

## 7. Alur prototipe yang harus dapat diklik

1. Beranda → katalog → detail gedung → kalender → mulai pengajuan.
2. Wizard → review ringkasan → konfirmasi submit → detail pengajuan bertanda “Terkirim”.
3. Pemohon membuka daftar dan detail → melihat timeline → memperbaiki pengajuan bila status “Perlu perbaikan”.
4. Operator membuka antrean → mencatat pemeriksaan `UNDER_REVIEW` → meminta revisi atau meneruskan keputusan ke assignment yang telah ditetapkan. Jangan tampilkan persetujuan otomatis.
5. Rental yang disetujui menuju state “Disetujui, menunggu pembayaran”; lanjut ke “Disetujui” setelah pembayaran terverifikasi, tanpa memvisualisasikan metode yang belum ditetapkan.
6. Petugas membuka jadwal tugas → catat serah-terima/pengembalian → tandai penggunaan selesai.
7. Pengguna membuka bantuan/AI → mendapat rujukan informasi; saat AI gagal, navigasi ke katalog/jadwal tetap berfungsi.

Gunakan konten demo yang konsisten lintas halaman (nama gedung, kapasitas, waktu, nomor referensi), tetapi tandai sebagai data contoh dan jangan menyajikan nilai/tarif/syarat sensitif sebagai keputusan resmi.

## 8. Responsive behavior dan aksesibilitas

- Desktop (≥1024 px): konten terpusat hingga 1200 px, katalog 3 kolom, sidebar operator, tabel dengan kolom penting, kalender mingguan/bulanan.
- Tablet (768–1023 px): grid katalog 2 kolom, filter collapsible, panel review dapat menjadi tab atau stacked.
- Mobile (<768 px): grid satu kolom, navigasi ringkas, filter drawer/bottom sheet, kalender agenda, tabel berubah menjadi kartu, tombol CTA utama mudah dijangkau.
- Jangan mengandalkan hover untuk menemukan fungsi. Semua kontrol keyboard-accessible.
- Focus ring terlihat, urutan fokus logis, dialog mengunci fokus dengan benar, dan label input tetap ada.
- Berikan teks untuk ikon, status, legenda, dan error; jangan memakai warna saja.
- Gunakan bahasa Indonesia yang lugas, tanggal lokal seperti “4 Nov 2026”, jam 24 jam, dan zona WIB bila konteks waktu tampil.
- Target WCAG 2.2 AA sebagai arah desain; pastikan kontras badge, teks, tombol, dan state fokus tetap terbaca.

## 9. Copywriting UI

Gunakan kata kerja konkret dan kalimat singkat:

- “Cari gedung”, “Lihat jadwal”, “Ajukan penggunaan”, “Kirim pengajuan”, “Tinjau pengajuan”, “Minta perbaikan”, “Simpan perubahan”.
- Status memakai istilah ramah pengguna yang dipetakan di bagian design system, bukan enum teknis.
- Empty state: jelaskan keadaan dan satu tindakan berikutnya.
- Error: jelaskan yang gagal dan opsi pemulihan. Contoh konflik: **“Waktu ini baru saja tidak tersedia. Pilih waktu lain; detail kegiatan Anda tetap tersimpan.”**
- Keberhasilan submit: **“Pengajuan berhasil dikirim”** disertai nomor referensi dan langkah berikutnya, tanpa menjanjikan kapan keputusan keluar.
- Hindari jargon backend, istilah status mentah, pesan menyalahkan, lorem ipsum pada CTA, atau instruksi kebijakan yang belum disahkan.

## 10. Prompt utama untuk Google Stitch

Salin bagian ini sebagai prompt utama Stitch. Gunakan spesifikasi layar dan design system di atas sebagai arahan detail.

> Rancang prototipe web responsif multi-halaman bernama VenueConnect Polinela, layanan kampus untuk mencari gedung, memeriksa kalender ketersediaan, dan mengajukan peminjaman internal atau penyewaan. Buat sistem desain yang formal, bersih, ramah kampus, mudah dipindai, dan fokus pada tugas. Gunakan palet hijau tua/hijau kampus sementara dengan latar putih dan abu kehijauan, tipografi sans-serif mirip Inter, kartu ber-radius ringan, border halus, ikon outline konsisten, dan kontras aksesibel. Palet bukan brand resmi dan harus mudah diganti.
>
> Buat layar yang saling terhubung: beranda dengan pencarian cepat; katalog gedung dengan filter dan kartu foto; detail gedung dengan fasilitas, kapasitas, tarif yang dapat diberi placeholder, kalender publik yang menjaga privasi, dan CTA; halaman jadwal dengan tampilan agenda mobile; masuk/daftar yang tidak mengasumsikan metode identitas tertentu; wizard pengajuan bertahap; dashboard dan detail pengajuan pemohon dengan timeline; halaman bantuan dan panel AI baca-saja; dashboard operator dengan antrean; detail review; serta varian kalender operasional, pengelolaan gedung/tarif, verifikasi pembayaran, dan serah-terima.
>
> Gunakan bahasa Indonesia. Tampilkan tanggal lokal dan jam 24 jam WIB. Status selalu berupa badge berlabel teks: Terkirim, Sedang diperiksa, Perlu perbaikan, Menunggu persetujuan, Disetujui menunggu pembayaran, Disetujui, Ditolak, Dibatalkan/Kedaluwarsa, dan Selesai. Bedakan status dengan ikon/teks selain warna. Kalender publik hanya menampilkan rentang waktu/status ketersediaan; jangan tampilkan nama pemohon, kontak, atau nama acara. Operator melihat data berdasarkan perannya.
>
> Pisahkan katalog peminjaman Gedung CB, Gedung QB, Gedung Sakura, dan Gedung GSG dari katalog penyewaan GSG serta sebelas ruang/layanan pada tabel tarif pengguna; GSG memakai satu entri gedung pada kedua alur. Tampilkan hanya harga sewa luar kampus yang terlihat pada sumber, dengan opsi hitungan yang belum aman ditandai informasi saja. PNG lambang Polinela yang diberikan pengguna dapat dipakai dalam pratinjau; izin publikasi institusi tetap menunggu konfirmasi. Jangan mengarang kebijakan kampus, lokasi, foto, kapasitas pasti dari rentang, atau tanggal efektif tarif. Detail yang belum bersumber berupa placeholder jelas. Jangan menampilkan QR/rekening pembayaran, meminta KTP/NPM/NIP sebagai default, menjanjikan persetujuan otomatis, atau menyiratkan rental sudah confirmed sebelum pembayaran diverifikasi.
>
> Rancang state loading, empty, error, konflik jadwal, sesi habis, tanpa izin, sukses, data berubah, AI tidak tersedia, dan AI tidak yakin. Saat terjadi konflik, pertahankan input kegiatan. Sediakan CTA yang konkret, label input permanen, fokus keyboard terlihat, area tekan minimal 44 px, serta adaptasi mobile-first: kartu menggantikan tabel, kalender menjadi agenda, dan filter menjadi drawer/bottom sheet. Buat prototipe dengan alur klik dari pencarian gedung hingga pengajuan terkirim, serta alur operator dari antrean ke review.

## 11. Checklist evaluasi hasil Stitch

- [ ] Visual bahasa Indonesia konsisten di semua halaman dan status.
- [ ] Pengguna dapat bergerak dari beranda ke pengajuan tanpa mencari CTA.
- [ ] Katalog dan detail membantu membandingkan gedung, fasilitas, kapasitas, jadwal, dan tarif yang tersedia.
- [ ] Kalender publik tidak membocorkan identitas atau nama acara.
- [ ] Wizard memiliki ringkasan sebelum kirim dan state konflik yang mempertahankan input.
- [ ] Dashboard menjelaskan status dan langkah selanjutnya.
- [ ] Aksi dan informasi operator sesuai role.
- [ ] Tidak ada kebijakan, nominal, metode bayar, dokumen, atau brand resmi yang dikarang.
- [ ] Layout tetap mudah digunakan pada lebar mobile.
- [ ] Status, fokus, label, error, dan kontrol dapat dipahami tanpa mengandalkan warna atau hover.
