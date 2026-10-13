# Register Keputusan 15 Task VenueConnect

Dokumen ini merangkum keputusan yang sudah memiliki sumber, fakta yang tertulis di proposal, dan baseline proyek yang diterima pengguna. Baseline ini bukan kebijakan resmi Polinela; sistem tetap non-produksi sampai pejabat/unit berwenang mengesahkannya. Diperbarui 13 Oktober 2026: peminjaman hanya untuk mahasiswa, dosen, dan civitas akademika Polinela; penyewaan hanya untuk pemohon luar kampus. Harga publik hanya tarif sewa luar kampus `EXTERNAL`.

## Ringkasan status

| Status | Jumlah | Arti |
| --- | ---: | --- |
| Baseline proyek disepakati pengguna | 9 | Task 1–9 memiliki baseline/keputusan untuk lingkup proyek; fitur terkait belum boleh dipakai di produksi tanpa pengesahan institusi |
| Draft siap ditinjau | 1 | Jadwal dan penugasan mingguan telah disusun untuk ditinjau |
| Pemeriksaan sebagian | 3 | Ada dasar teknis/aritmetika/panduan visual, tetapi keputusan final belum tersedia |
| Belum diputuskan | 2 | Detail autentikasi dan pemilihan vendor/operasional memerlukan TI/pemilik anggaran; produksi akun tetap nonaktif |

## Keputusan, fakta, dan tindak lanjut

| No. | Task | Hasil yang bisa ditetapkan sekarang | Status / pemilik konfirmasi |
| ---: | --- | --- | --- |
| 1 | Alur mahasiswa dan approval WD III | Keputusan pengguna: mahasiswa tidak menjalani approval WD III di dalam sistem. Proposal menjelaskan proses manual lama yang berbeda. Ini tidak berarti booking otomatis disetujui; pemeriksaan dan keputusan pengelola tetap harus tercatat. | **Dikonfirmasi** oleh pengguna. Tindak lanjut operasional oleh Subbagian Rumah Tangga/pemilik proses. |
| 2 | Tindak lanjut berkas mahasiswa | Baseline: setelah dikirim status `SUBMITTED`; Subbagian Rumah Tangga melakukan pemeriksaan awal (`UNDER_REVIEW`), merekam catatan/aktor/waktu, lalu meminta revisi atau meneruskan kepada pengelola untuk keputusan. Tidak ada langkah WD III dan tidak ada konfirmasi otomatis. | **Baseline proyek diterima pengguna;** pengesahan Subbagian Rumah Tangga tetap wajib sebelum data nyata. |
| 3 | Format dan perlindungan berkas | Baseline: satu PDF maksimum 5 MB; simpan privat, akses pemohon dan petugas yang ditugaskan, tanpa tautan publik atau isi berkas di audit; hapus 90 hari setelah status terminal. Upload dan penghapusan otomatis tetap nonaktif sampai TI/pemilik arsip mengesahkan storage dan masa simpan. | **Baseline proyek diterima pengguna;** sign-off privasi/arsip dan storage wajib sebelum produksi. |
| 4 | Alur dosen/pegawai | Fakta proposal §1.1: dosen dan teknisi menyampaikan surat ke Bagian Umum/Subbagian Rumah Tangga untuk pemeriksaan ketersediaan dan koordinasi dengan petugas gedung. Baseline: pengelola melakukan pemeriksaan awal; tidak menambahkan approval Ketua Jurusan atau delegasi hard-coded. Approval khusus/delegasi hanya dapat diaktifkan lewat assignment resmi. | **Baseline proyek diterima pengguna;** urutan final, delegasi, dan pengecualian wajib disahkan unit terkait. |
| 5 | Sewa luar kampus dan WD II | Keputusan pengguna: penyewaan hanya untuk orang/instansi luar kampus; civitas Polinela memakai peminjaman internal. Fakta proposal §1.1: pengelolaan aset BLU memeriksa jadwal/tarif, menerima formulir dan surat permohonan, menerbitkan tagihan, menerima pembayaran ke rekening resmi BLU, lalu membuat perjanjian penggunaan. Baseline: routing ke approver BLU yang ditetapkan melalui assignment; tidak hard-code WD II atau delegasi yang belum disahkan. | **Segmen pemohon dikonfirmasi pengguna;** pejabat approver/delegasi tetap perlu ditetapkan BLU sebelum produksi. |
| 6 | Field/dokumen pemohon dan minimisasi data | Baseline field bersama: kategori, gedung, rentang waktu, nama kegiatan, deskripsi singkat, estimasi peserta bila perlu, dan kontak dari akun. Dokumen mahasiswa mengikuti butir 3. Jangan meminta NPM/NIP/KTP atau data sensitif lain tanpa kebutuhan dan dasar yang disahkan. | **Baseline proyek diterima pengguna;** field tambahan hanya setelah pemilik proses menyetujui kebutuhannya. |
| 7 | Bentrok, hold, tenggat, jam, durasi, kapasitas, pembatalan | Baseline: interval `[mulai, selesai)`, cek ulang transaksional; hanya `AWAITING_PAYMENT` dan `CONFIRMED` menahan slot; tidak ada hold selama pemeriksaan. Jam, kapasitas, durasi, buffer, dan tenggat dikonfigurasi per gedung; tanpa nilai tenggat aktif sampai BLU menetapkan. Pembatalan setelah tagihan masuk review manual; tidak ada refund otomatis. | **Baseline proyek diterima pengguna;** nilai operasional per gedung dan tenggat tetap menunggu pengelola/BLU. |
| 8 | Tarif resmi | PDF yang diberikan memuat Keputusan Direktur Polinela No. 1185/PL15/KPTS/2026 tanggal 21 Agustus 2026 beserta tarif, satuan, kelompok pengguna, dan batas layanan. Keputusan pengguna: harga publik hanya untuk sewa luar kampus (`EXTERNAL`); peminjaman internal tidak mengambil tarif sewa. Nilai tarif resmi tersedia sebagai sumber, tetapi pemetaan layanan ke gedung aplikasi serta batas kategori `umum` vs `mitra`/`UKM` tetap perlu konfirmasi pemilik tarif. `ALL` tidak dipakai sebagai fallback sewa. | **Segmen tarif dikonfirmasi pengguna; pemetaan angka per gedung tetap terbuka.** BLU/pengelola tarif dan pengelola gedung. |
| 9 | Pembayaran | Fakta proposal: pembayaran dilakukan melalui rekening resmi BLU sebelum perjanjian penggunaan. Baseline: transfer manual, bukti tersimpan privat, verifier BLU terpisah, pemeriksaan nominal terhadap tagihan, tanpa payment gateway dan tanpa refund otomatis pada MVP. Deadline hanya dijalankan jika BLU menetapkan nilainya; pembayaran gagal/ditolak ditangani manual. | **Baseline proyek diterima pengguna;** rekening, prosedur bukti, deadline, penolakan, dan refund wajib disahkan BLU. |
| 10 | Autentikasi, SSO, verifikasi, role | Keputusan pengguna: produksi tetap nonaktif. Usulan teknis bila diaktifkan kelak: utamakan SSO Polinela bila TI menyediakan integrasi dan klaim identitas; hak approver/verifier/petugas ditetapkan pemilik proses, bukan pilihan form pemohon. | **Produksi nonaktif sesuai keputusan pengguna; metode autentikasi/SSO dan role tetap belum diputuskan.** Tim TI/pemilik identitas dan pemilik proses. |
| 11 | Zona waktu, notifikasi, privasi, backup, kalender publik | Zona waktu produk `Asia/Jakarta` (WIB) sudah sesuai lokasi Polinela dan digunakan UI. Notifikasi in-app sudah tersedia untuk sebagian status; kanal tambahan belum dipilih. Usulan operasi: backup terenkripsi harian dengan sasaran awal RPO 24 jam/RTO 8 jam; kalender publik hanya menampilkan slot/status tanpa identitas atau nama acara. Retensi dan publikasi tetap memerlukan persetujuan institusi. | **Produksi nonaktif sesuai keputusan pengguna; kebijakan operasi masih sebagian dan belum disahkan.** TI, pemilik privasi, dan pengelola jadwal. |
| 12 | Domain, hosting, origin, biaya, pemilik operasi | Keputusan pengguna: produksi tetap nonaktif. Proposal mencatat estimasi: domain Rp300.000/tahun, hosting Rp1.200.000/tahun, paket AI Rp2.800.000, internet Rp600.000, dokumentasi/alat tulis Rp200.000; total tabel Rp5.100.000. Ini estimasi proposal, bukan penawaran/vendor terpilih. Usulan: minta TI menetapkan subdomain dan hosting yang dikelola institusi sebelum memilih vendor; tetapkan pemilik biaya AI, backup, dukungan, serta origin/CORS. | **Produksi nonaktif sesuai keputusan pengguna; vendor, biaya aktual, origin, dan pemilik operasi belum diputuskan.** Tim TI, pemilik anggaran, dan pemilik operasi. |
| 13 | Validasi survei | Dua workbook jawaban pengguna telah direkonsiliasi di `docs/14-validasi-survei-sumber.md`. Angka ringkasan cocok memakai denominator seluruh sampel (45/13); satu jawaban mahasiswa untuk pertanyaan bentrok kosong, 16 jawaban penggunaan mahasiswa tidak konsisten secara literal, satu jawaban bebas umum ambigu, dan lima nama umum kosong. Data identitas tidak disalin ke repo. | **Verifikasi sumber selesai dengan temuan dan batas interpretasi.** Tim analisis/pembimbing meninjau cara menyajikan hasil. |
| 14 | Jadwal mingguan, pemilik, deliverable | Draft rencana September–Desember 2026 ada di bagian berikut, dengan owner per peran proposal. Jadwal mengasumsikan keputusan kebijakan diperoleh pada minggu awal; jika tidak, fitur terkait tetap nonaktif dan jadwal harus direvisi. | **Draft siap ditinjau.** Tim proyek dan pembimbing; tanggal sign-off belum diketahui. |
| 15 | Logo resmi dan data publik | Pengguna memberikan PNG lambang Polinela, foto GSG, alamat CB/QB/Sakura/GSG, dan cuplikan tabel tarif sewa. Keputusan terbaru: empat gedung awal untuk peminjaman, GSG juga untuk sewa, serta sebelas ruang/layanan tambahan khusus sewa. Seed development berisi 15 entri dan 18 opsi harga `EXTERNAL` yang tampak pada sumber, tanpa lokasi atau kapasitas rekaan; GSG satu ID pada kedua alur. Harga per jam/orang/minggu/bulan dan tambahan kursi hanya informasi bila kalkulasi belum aman. Rincian `docs/15-inventaris-peminjaman-penyewaan.md`. Jangan publikasikan identitas pemohon, isi surat, alasan blokir internal, atau bukti bayar. | **Sebagian terjawab; izin publikasi resmi, foto/lokasi ruang baru, tanggal efektif, syarat, kapasitas rentang, dan identitas ruang fisik masih terbuka.** Humas, pengelola gedung, BLU, dan pemilik privasi. |

## Draft jadwal kerja mingguan

Jadwal ini disusun ulang karena proposal menyebut rentang September–Desember 2026 tetapi tidak memberi penugasan deliverable mingguan yang lengkap. Tahap September di bawah merekam rentang pada Tabel 5 proposal; pencantuman rentang tidak membuktikan deliverable tersebut sudah selesai. Nama pemilik teknis mengikuti Tabel 7 proposal; pemilik kebijakan harus menunjuk narahubungnya sendiri.

| Pekan proposal | Fokus dan deliverable | Pemilik utama |
| --- | --- | --- |
| September 1 | Penetapan judul, masalah, dan sasaran proyek. | Tim proyek; pembimbing |
| September 2 | Draft proposal dan rancangan kebutuhan; mulai bimbingan. | Reza (analisis); seluruh tim; pembimbing |
| September 3 | Perbaikan proposal dan bimbingan; siapkan materi seminar. | Reza; Nabila & Orlean (UI/UX); pembimbing |
| September 4 | Finalisasi proposal dan materi seminar; jadwalkan seminar. | Seluruh tim; pembimbing |
| Oktober 1 (5–11 Okt) | Seminar proposal/penutupan proposal sesuai rentang Tabel 5; status pelaksanaan aktual belum diverifikasi. | Seluruh tim; pembimbing |

Tanggal kalender dan status aktual kegiatan September harus dicocokkan dengan catatan bimbingan/seminar tim; proposal hanya memberi rentang minggu dan tidak menyimpan bukti pelaksanaannya.

| Pekan | Tanggal | Fokus dan deliverable | Pemilik utama |
| --- | --- | --- | --- |
| 1 | 12–18 Okt | Catat baseline keputusan 1–9 yang disetujui pengguna; minta konfirmasi pemilik institusi untuk 10–12; terima/verifikasi sumber survei serta logo/data publik untuk 13 dan 15; pertahankan produksi nonaktif. | Reza (analisis); Subbagian Rumah Tangga; BLU; TI |
| 2 | 19–25 Okt | Finalisasi daftar layanan/gedung, inventaris, kategori tarif, dokumen, dan aturan kalender; validasi jawaban pemilik proses serta revisi register blocker. | Reza (analisis), Tego (fullstack); pengelola gedung/BLU |
| 3 | 26 Okt–1 Nov | Finalisasi alur proses, status, role/capability, field minimal, model data, dan acceptance criteria. | Reza, Tego, Nabila & Orlean (UI/UX) |
| 4 | 2–8 Nov | Implementasi perubahan skema dan API booking sesuai keputusan yang sudah disahkan; pertahankan fitur dokumen nonaktif jika aturan belum sah. | Tego; Nabila & Orlean untuk UI |
| 5 | 9–15 Nov | Implementasi review/routing operator dan status pengajuan beserta catatan/audit. | Tego; Reza; pemilik proses |
| 6 | 16–22 Nov | Integrasi pembayaran manual sesuai kebijakan, notifikasi, handover, dan kontrol akses. | Tego; BLU/TI; Nabila & Orlean untuk UI |
| 7 | 23–29 Nov | Integrasi data tarif/gedung yang telah diverifikasi; tutup risiko privasi, backup, serta konten AI yang bersumber dari data resmi. | Tego; Reza; BLU/TI |
| 8 | 30 Nov–6 Des | Pemeriksaan alur internal, publik, konflik serentak, akses, error, mobile, dan persiapan UAT; simpan bukti hasil. | Reza; Tego; Nabila & Orlean |
| 9 | 7–13 Des | UAT dengan mahasiswa, dosen/pegawai, pengelola, petugas gedung, BLU, dan penyewa umum; kumpulkan temuan. | Reza; Nabila & Orlean; pemilik proses |
| 10 | 14–20 Des | Perbaiki temuan UAT, ulangi skenario terdampak, dan minta sign-off proses/data. | Tego; Nabila & Orlean; pemilik proses |
| 11 | 21–27 Des | Finalisasi panduan pengguna/operator, laporan, dokumentasi teknis, dan prosedur operasi yang telah disahkan. | Reza; Nabila & Orlean; Tego |
| 12 | 28–31 Des | Review kesiapan rilis; rilis hanya jika identitas, data, workflow, keamanan, hosting, backup, dan dukungan telah disahkan. Jika belum, serahkan sebagai preview/non-produksi dengan daftar blocker. | Seluruh tim; TI; pemilik proses |

## Catatan batas kewenangan

Task 1–9 memiliki baseline proyek yang diterima pengguna, dengan batas non-produksi dan kebutuhan sign-off institusi yang tercantum per item. Task 14 memiliki draft jadwal dan pemilik. Produksi tetap nonaktif. Item 10–12 masih memerlukan rincian/keputusan TI dan operasi; item 13 dan 15 menunggu sumber yang akan dikirim pengguna. Baseline ini tidak menggantikan keputusan institusi.

## Sumber yang diperiksa

- Proposal proyek mandiri VenueConnect Polinela yang diberikan pengguna: §1.1 untuk proses berjalan; bagian metodologi/kuesioner untuk ringkasan survei; Tabel 5 untuk rentang jadwal; Tabel 6 untuk estimasi biaya; Tabel 7 untuk pembagian peran tim.
- Keputusan Direktur Polinela No. 1185/PL15/KPTS/2026, lampiran tarif BLU 2026, PDF yang diberikan pengguna.
- [Panduan Penulisan Karya Ilmiah Politeknik Negeri Lampung](https://jpk.polinela.ac.id/wp-content/uploads/2024/10/Panduan-Penulisan-Karya-Ilmiah_Politeknik-Negeri-Lampung-1.pdf), bagian ketentuan logo; diakses 11 Oktober 2026. Sumber ini menyatakan warna lambang, tetapi belum memberikan persetujuan penggunaan aset tertentu untuk aplikasi VenueConnect.
