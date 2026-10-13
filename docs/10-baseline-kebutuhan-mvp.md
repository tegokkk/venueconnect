# Baseline Kebutuhan dan MVP VenueConnect

> **Status: baseline proyek untuk ditinjau pemilik proses.** Disusun 12 Oktober 2026 dari proposal FIX, spesifikasi yang ada, dan keputusan proyek pengguna. Ini bukan persetujuan kebijakan Polinela. Fitur produksi tetap nonaktif sampai unit berwenang mengesahkan alur, data, akses, dan operasi.

## 1. Tujuan dan bukti kebutuhan

VenueConnect membantu pemohon menemukan informasi gedung dan ketersediaan sebelum mengajukan, lalu membantu pengelola mencatat pemeriksaan, keputusan, pembayaran sewa, dan penggunaan. Masalah inti yang menjadi sasaran adalah pengecekan jadwal secara manual, bentrok waktu, pengajuan yang harus diubah, dan koordinasi pemohon dengan pengelola serta petugas kunci.

Proposal FIX melaporkan wawancara dengan Kepala Subbagian Umum dan kuesioner kepada 45 mahasiswa serta 13 respons masyarakat umum. Dua workbook jawaban yang diberikan pengguna telah direkonsiliasi di `docs/14-validasi-survei-sumber.md`: 29/45 mahasiswa memilih `Sering` kesulitan mengetahui ketersediaan; 38/45 memilih pernah mengalami **atau mengetahui** bentrok, dengan satu jawaban kosong pada pertanyaan tersebut; 12/13 respons umum menilai informasi ketersediaan sangat penting. Terdapat inkonsistensi jawaban penggunaan mahasiswa dan satu jawaban bebas umum yang ambigu. Notulen wawancara tetap belum tersedia.

## 2. Pengguna dan pekerjaan utama

| Pengguna | Pekerjaan yang perlu didukung |
| --- | --- |
| Mahasiswa/organisasi mahasiswa | Menemukan gedung dan slot, mengirim pengajuan beserta satu berkas yang disyaratkan, lalu memahami tindak lanjut pengelola. Tidak ada approval WD III di dalam sistem. |
| Dosen/pegawai | Menemukan gedung dan slot, mengirim pengajuan, memantau pemeriksaan serta keputusan berdasarkan assignment yang berlaku. Sistem tidak mengunci nama approver sebelum ditetapkan. |
| Penyewa publik | Melihat informasi publik yang disahkan, mengirim permohonan sewa, mengikuti keputusan BLU, dan membayar melalui proses manual yang kelak disahkan. |
| Subbagian Rumah Tangga/pengelola | Memeriksa kelengkapan, mencatat catatan dan status, meminta revisi atau meneruskan untuk keputusan, serta mengelola gedung dan jadwal sesuai haknya. |
| Verifier BLU dan petugas gedung | Memproses pembayaran manual atau serah-terima/pengembalian kunci hanya pada transaksi yang ditugaskan. |

**Pemisahan layanan yang diputuskan pengguna (13 Oktober 2026):** mahasiswa, dosen, dan pegawai/civitas akademika Polinela memakai alur **peminjaman** melalui akun internal. Orang atau instansi luar kampus memakai alur **penyewaan** melalui akun eksternal. Harga yang ditampilkan publik hanya tarif penyewaan luar kampus (`EXTERNAL`) yang sudah diverifikasi; peminjaman internal tidak memakai harga sewa tersebut. Kategori `DOSEN_PEGAWAI` dalam model saat ini mencakup dosen dan civitas internal non-mahasiswa; pengesahan verifikasi identitas akun tetap menjadi gerbang produksi.

## 3. Batas MVP proyek

### Termasuk dalam MVP non-produksi

- Katalog peminjaman untuk **Gedung CB, Gedung QB, Gedung Sakura, dan Gedung GSG**; katalog penyewaan untuk **GSG dan sebelas ruang/layanan tambahan** pada tabel tarif pengguna. GSG adalah satu gedung pada kedua alur. Empat alamat awal berasal dari pengguna; lokasi baru dibiarkan kosong. Delapan belas opsi harga `EXTERNAL` yang terlihat pada cuplikan diisi pada seed development, dengan batas otomatisasi tagihan. Rincian dan data yang perlu diverifikasi ada di `docs/15-inventaris-peminjaman-penyewaan.md`. Publikasi produksi tetap menunggu persetujuan pemilik data/BLU.
- Kalender ketersediaan yang hanya menampilkan rentang waktu/status umum.
- Formulir kategori pemohon, gedung, waktu, kegiatan, deskripsi, perkiraan peserta bila relevan, kontak akun, dan berkas mahasiswa sesuai baseline proyek.
- Alur status yang dapat ditinjau: `SUBMITTED`, `UNDER_REVIEW`, `REVISION_REQUESTED`, `AWAITING_APPROVAL` bila ada assignment, `AWAITING_PAYMENT` untuk sewa yang disetujui, `CONFIRMED`, dan status penutupan.
- Antrean pengelola, riwayat status/catatan, pembayaran transfer manual dalam data uji, handover, audit, dan notifikasi in-app.
- Asisten AI hanya membaca data publik yang disetujui; kegagalannya tidak menghalangi katalog atau kalender.

### Di luar MVP produksi sampai gerbang persetujuan terpenuhi

- Akun nyata, SSO, atau pendaftaran publik; keputusan pengguna menetapkan produksi tetap nonaktif.
- Pengunggahan dokumen nyata. Baseline proyeknya satu PDF maksimal 5 MB, akses privat, dan usulan penghapusan 90 hari setelah status terminal; aturan ini tetap memerlukan persetujuan TI/pemilik arsip sebelum digunakan pada data nyata.
- Publikasi tarif, syarat, kapasitas, fasilitas, logo, atau jadwal sebelum pemilik data mengizinkannya.
- Payment gateway, refund otomatis, tenggat pembayaran default, atau penetapan jabatan approver secara hard-coded.
- Hosting/domain/origin produksi, backup operasional, notifikasi eksternal, dan AI dengan biaya tak terbatas.

## 4. Baseline alur untuk desain dan lingkungan uji

1. Pengunjung mencari gedung dan melihat tarif/syarat hanya jika datanya disetujui untuk publikasi.
2. Pemohon memilih kategori, gedung, waktu, dan rincian kegiatan. API dan frontend development menyimpan mahasiswa sebagai draft, menerima satu PDF privat, lalu mengirim draft setelah berkas ada. Produksi tetap menonaktifkan pengiriman.
3. Setelah dikirim, booking menjadi `SUBMITTED`; slot belum ditahan. Pengelola memeriksa dan mencatat aktor, waktu, dan catatan pada `UNDER_REVIEW`.
4. Pengelola meminta revisi atau meneruskan ke pengambil keputusan yang ditugaskan. Pengajuan mahasiswa tidak diarahkan ke WD III dan tidak disetujui otomatis.
5. Keputusan internal yang disetujui menjadi `CONFIRMED`. Sewa publik yang disetujui menjadi `AWAITING_PAYMENT`; transfer/verifikasi manual mengikuti instruksi resmi. Hanya `AWAITING_PAYMENT` dan `CONFIRMED` mengunci slot pada baseline proyek.
6. Petugas yang ditugaskan mencatat serah-terima/pengembalian. Pengelola mencatat penyelesaian.

Nama jabatan, delegasi, SLA, jam operasional, kapasitas yang berlaku, tenggat, dan pengecualian tetap berupa assignment/configuration sampai dikonfirmasi pemilik proses. Baseline ini tidak mengubah proses manual institusi.

## 5. Ukuran keberhasilan proyek yang diusulkan

Angka di bawah adalah target evaluasi proyek awal agar dapat diukur, bukan SLA Polinela. Pemilik proses dan tim proyek perlu menyetujui target sebelum UAT.

| Ukuran | Target awal | Cara ukur |
| --- | --- | --- |
| Keberhasilan tugas inti | Minimal 80% percobaan tanpa bantuan untuk mencari gedung, menemukan status slot, memulai pengajuan, dan menemukan langkah berikutnya; laporkan per kategori peserta. | Sesi prototipe teramati; pencatat menandai berhasil/gagal dan bantuan yang diperlukan. |
| Kejelasan status | Minimal 80% peserta dapat menjelaskan langkah berikutnya setelah melihat status contoh. | Pertanyaan moderator sesudah tugas status/revisi. |
| Efisiensi cek ketersediaan | Median waktu untuk memastikan slot di prototipe paling lama 50% dari median proses manual yang diukur pada tugas setara. | Catat waktu manual dan prototipe dengan gedung/waktu uji yang sama; jangan mengarang baseline jika belum diukur. |
| Integritas jadwal | Nol booking uji `CONFIRMED` yang saling tumpang tindih pada gedung yang sama. | Verifikasi skenario satu pemroses dan permintaan bersamaan pada lingkungan terisolasi. |
| Privasi dan otorisasi | Nol pembacaan booking/dokumen lintas pemohon tanpa izin; kalender publik tidak mengungkap identitas atau nama kegiatan. | Skenario akses negatif dan inspeksi respons API/UI tanpa data pribadi nyata. |
| Akurasi informasi | Seluruh data yang ditampilkan pada prototipe cocok dengan fixture yang disetujui; data yang belum disetujui ditandai belum tersedia. | Cocokkan setiap field katalog/tarif/syarat dengan daftar sumber yang disetujui. |
| Respons API | P95 baca katalog/ketersediaan <2,5 detik dan mutasi <3 detik pada profil uji yang disepakati. | Pengukuran pada staging/dataset uji; dikecualikan layanan eksternal. |

## 6. Kriteria penerimaan MVP

- Pengguna dapat mencari dan membandingkan gedung dari field yang disetujui serta membuka kalender tanpa melihat identitas pemesan.
- Formulir menyimpan kategori dan data minimum; field/dokumen mahasiswa menerapkan baseline satu PDF 5 MB hanya pada lingkungan uji.
- Submit menghasilkan referensi dan `SUBMITTED`, bukan konfirmasi; pemeriksaan pengelola tercatat sebagai `UNDER_REVIEW`.
- Pengelola dapat meminta revisi atau meneruskan ke assignment yang tersedia; tidak ada routing WD III untuk mahasiswa atau jabatan tetap yang belum ditetapkan.
- Slot tidak tertahan pada pemeriksaan. Konflik interval setengah terbuka dicegah secara transaksional; hanya status pengunci pada baseline yang mengunci.
- Keputusan, pembayaran, dan handover memiliki aktor, waktu, status, catatan seperlunya, dan riwayat.
- Data dan tarif publik hanya muncul setelah disetujui pemiliknya. Sewa belum `CONFIRMED` sebelum pembayaran diverifikasi.
- Akses tanpa sesi/capability yang sah ditolak; AI hanya memakai fungsi baca-saja dan tidak menerima PII atau dokumen.
- Skenario berhasil, revisi, penolakan, konflik, akses tanpa izin, payment mismatch, dan error layanan memiliki hasil yang bisa diperiksa.
- Semua rilis produksi tetap tertutup sampai gerbang autentikasi, proses, dokumen, tarif, hosting, backup, dukungan, dan publikasi disetujui.

## 7. Status validasi

| Bagian | Status |
| --- | --- |
| Desk review proposal FIX dan keputusan baseline pengguna | Selesai untuk baseline desain proyek. |
| Wawancara/validasi alur dengan pengelola | Proposal menyatakan wawancara dilakukan, tetapi notulen dan persetujuan langkah demi langkah belum tersedia; validasi ulang masih diperlukan. |
| Validasi dengan calon pengguna | Dua workbook survei sudah diaudit pada `docs/14-validasi-survei-sumber.md`; evaluasi prototipe bersama calon pengguna dan sesi tugas usability belum dilakukan. |
| Pengesahan target MVP | Menunggu review bersama Subbagian Rumah Tangga, BLU, TI, pemilik data, dan pemilik proses terkait. |

## Sumber

- Proposal FIX yang diberikan pengguna, bagian 1.1, 3.3.3, 3.3.4, dan 3.3.5: `C:\Users\user\Downloads\VenueConnect Polinela11 (1) (1) (1) FIX.docx`.
- Keputusan proyek pengguna dalam percakapan: mahasiswa tanpa approval WD III, baseline proyek untuk keputusan 2–7 dan 9, serta produksi nonaktif.
- Spesifikasi terkait: `docs/00-analysis-and-decisions.md`, `docs/VenueConnect_Polinela_PRD.md`, dan `docs/06-system-diagrams.md`.
