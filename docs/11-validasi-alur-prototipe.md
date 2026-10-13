# Panduan Validasi Alur dan Prototipe VenueConnect

> Panduan ini menyiapkan validasi bersama pengelola dan calon pengguna. Dua workbook survei telah diaudit secara agregat pada `docs/14-validasi-survei-sumber.md`; notulen wawancara dan hasil uji prototipe belum tersedia. Jangan mengisi tabel bukti seolah sesi sudah dilakukan.

## 1. Bukti yang sudah tersedia

| Sumber | Isi yang dilaporkan | Batas bukti |
| --- | --- | --- |
| Proposal FIX §1.1 | Mahasiswa mengurus surat dengan tanda tangan ketua organisasi, diketahui pembina, lalu proses manual melibatkan WD III sebelum disampaikan ke Subbagian Rumah Tangga. Dosen/teknisi mengajukan ke Bagian Umum/Subbagian Rumah Tangga untuk cek jadwal dan koordinasi petugas. Sewa publik melalui aset BLU: cek jadwal/tarif, formulir/surat, tagihan, pembayaran ke rekening resmi, dan perjanjian. | Narasi masalah, bukan SOP rinci atau bukti persetujuan tiap langkah. |
| Proposal FIX §3.3.3 | Dokumen menyatakan wawancara dilakukan dengan Kepala Subbagian Umum dan kuesioner kepada mahasiswa serta masyarakat. | Notulen, tanggal, daftar pertanyaan, jawaban, dan validasi responden tidak terlampir. |
| Dua workbook jawaban pengguna | 45 respons mahasiswa dan 13 respons masyarakat; hitungan, respons kosong, serta inkonsistensi diringkas di `docs/14-validasi-survei-sumber.md`. | Identitas tidak disalin ke repository; lima nama pada survei masyarakat kosong sehingga individu unik tidak dapat diverifikasi penuh. Survei tidak membuktikan alur manual/SOP. |
| Keputusan proyek pengguna | Alur sistem mahasiswa tidak memiliki approval WD III; baseline proyek untuk task 2–7 dan 9 diterima; produksi tetap nonaktif. | Tidak menggantikan persetujuan Subbagian Rumah Tangga, BLU, TI, pemilik arsip, atau pemilik data. |

## 2. Agenda validasi alur manual

### Peserta yang perlu diundang

- Kepala/pengelola Subbagian Rumah Tangga atau Bagian Umum.
- Perwakilan pengelola gedung dan petugas/pemegang kunci.
- Perwakilan mahasiswa/organisasi mahasiswa dan dosen/pegawai.
- Pengelola aset BLU/verifier pembayaran untuk alur sewa publik.
- Calon penyewa publik.

Satu orang dapat mewakili beberapa fungsi hanya jika kewenangannya jelas. Catat jabatan/fungsi, bukan data pribadi berlebihan. Gunakan data dan dokumen sintetis.

### Pertanyaan walkthrough untuk pengelola

1. Siapa menerima permohonan pada setiap kategori, dan informasi minimum apa yang mereka perlukan?
2. Apa yang diperiksa saat pengajuan masuk, siapa yang mencatat hasil, dan status apa yang menjelaskan hasil tersebut?
3. Kapan permohonan dikembalikan untuk revisi? Catatan apa yang boleh dilihat pemohon?
4. Siapa pengambil keputusan akhir untuk masing-masing kategori? Bagaimana assignment, delegasi, dan pengecualian gedung dicatat?
5. Kapan slot kalender menjadi tidak tersedia? Apa yang terjadi bila ada dua permohonan untuk rentang sama?
6. Untuk dokumen mahasiswa, siapa boleh melihat, di mana disimpan, berapa lama, dan bagaimana penghapusan dibuktikan?
7. Untuk sewa publik, kapan tagihan diterbitkan, siapa memverifikasi transfer, dan apa alur gagal, kedaluwarsa, pembatalan, serta refund?
8. Apa yang dicatat petugas saat menyerahkan/menerima kunci, dan bagaimana pengelola menutup penggunaan?
9. Informasi apa yang boleh tampil di kalender/katalog publik dan siapa pemilik pembaruannya?

### Pertanyaan tugas untuk calon pengguna

1. Temukan gedung yang sesuai kapasitas dan fasilitas.
2. Temukan apakah slot contoh tersedia, lalu jelaskan arti status kalender.
3. Mulai pengajuan kategori Anda dan tunjukkan data yang terasa tidak perlu atau membingungkan.
4. Untuk contoh mahasiswa, jelaskan ekspektasi Anda atas berkas dan langkah setelah mengirim.
5. Buka detail status contoh dan jelaskan tindakan berikutnya.
6. Untuk contoh penyewa publik, temukan tarif/syarat yang tersedia dan informasi apa yang masih belum jelas.

Moderator tidak mengarahkan jawaban. Catat tugas selesai/tidak, waktu, bantuan, istilah yang membingungkan, kesalahan, dan usulan peserta. Jangan meminta peserta mengunggah dokumen pribadi atau memakai akun/booking nyata.

## 3. Formulir pencatatan sesi alur

| Metadata sesi | Isian |
| --- | --- |
| Tanggal dan durasi |  |
| Fungsi peserta (tanpa data pribadi yang tidak perlu) |  |
| Fasilitator dan pencatat |  |
| Versi prototipe/dokumen |  |
| Gedung, tarif, dan jadwal uji sintetis |  |
| Persetujuan penggunaan catatan/bukti |  |

| Langkah proses | Fakta proposal | Jawaban pemilik proses | Perubahan baseline | Pemilik/bukti keputusan |
| --- | --- | --- | --- | --- |
| Mahasiswa: masuk, berkas, pemeriksaan, keputusan | Narasi manual §1.1; keputusan sistem tanpa WD III |  |  |  |
| Dosen/pegawai: pemeriksaan dan assignment | Narasi §1.1 menyebut Bagian Umum/Subbagian Rumah Tangga dan petugas gedung |  |  |  |
| Penyewaan publik: tarif, tagihan, transfer, perjanjian | Narasi §1.1 menyebut pengelolaan aset BLU |  |  |  |
| Penjadwalan dan konflik | Detail kebijakan belum ada di sumber |  |  |  |
| Serah-terima dan penyelesaian | Narasi latar belakang menyebut memo/kunci/konfirmasi |  |  |  |

## 4. Protokol review prototype

### Perangkat dan materi

- Prototype multi-layar di `stitch_markdown_document_analyzer/index.html`.
- Perangkat peserta sendiri bila tersedia; catat ukuran viewport dan browser.
- Akun, gedung, tanggal, pemohon, dan dokumen yang sepenuhnya sintetis.
- Tampilkan baseline status proyek dan jelaskan bahwa transaksi, autentikasi, dan upload tidak aktif.

### Rubrik per tugas

| Hasil | Definisi |
| --- | --- |
| Berhasil mandiri | Peserta mencapai tujuan tanpa petunjuk fasilitator dan memahami hasil layar. |
| Berhasil dengan bantuan | Tujuan tercapai setelah satu atau lebih petunjuk; catat pemicunya. |
| Gagal | Peserta tidak dapat menyelesaikan atau mengambil tindakan yang berisiko salah. |
| Isu kritis | Peserta salah memahami status/persetujuan, mengira upload/data benar-benar dikirim, atau melihat informasi privat yang seharusnya dibatasi. |

| Task prototype | Hasil | Waktu | Bantuan | Kebingungan/temuan | Dampak | Usulan perbaikan |
| --- | --- | --- | --- | --- | --- | --- |
| Cari gedung dan cek jadwal |  |  |  |  |  |  |
| Mulai pengajuan kategori internal |  |  |  |  |  |  |
| Memahami berkas dan status mahasiswa |  |  |  |  |  |  |
| Menemukan langkah berikutnya pada detail |  |  |  |  |  |  |
| Menemukan informasi rental publik |  |  |  |  |  |  |
| Pengelola meminta revisi pada assignment |  |  |  |  |  |  |

## 5. Penutupan dan tindak lanjut

- Rekap persentase tugas berhasil mandiri per kelompok peserta; jangan gabungkan kelompok yang memiliki alur berbeda tanpa catatan.
- Catat baseline waktu manual terlebih dahulu sebelum menyimpulkan penghematan waktu.
- Temuan kritis yang memengaruhi status, keputusan, jadwal, dokumen, atau privasi harus diperbaiki dan diuji ulang.
- Simpan bukti yang disanitasi dan persetujuan peserta; jangan menaruh dokumen pengajuan nyata di repository.
- Minta pemilik proses menyetujui revisi alur, baseline MVP, target metrik, dan diagram melalui catatan bertanggal.

**Status per 12 Oktober 2026:** desk review dan revisi prototipe berbasis baseline proyek telah dikerjakan; sesi walkthrough pengelola dan uji prototype bersama calon pengguna belum memiliki jadwal atau bukti hasil.
