# Style Guide dan Desain UI VenueConnect Polinela

> Warna adalah usulan sementara, bukan panduan merek resmi Polinela. Perbarui token brand setelah identitas visual resmi tersedia.

## Arah desain

Bersih, formal, mudah dipindai, dan ramah sebagai layanan kampus. Prioritaskan gedung, kalender, tarif, syarat, dan status. Hindari ornamen yang mengurangi ruang baca.

## Token warna sementara

    --color-brand-900: #173B32;
    --color-brand-700: #245C4D;
    --color-brand-600: #2F7662;
    --color-brand-100: #E8F2EE;
    --color-accent-600: #B7791F;
    --color-accent-100: #FFF4D6;
    --color-text: #1F2933;
    --color-muted: #5F6B76;
    --color-border: #D8E0E5;
    --color-surface: #FFFFFF;
    --color-page: #F6F8F7;
    --color-success: #166534;
    --color-warning: #854D0E;
    --color-danger: #991B1B;
    --color-info: #1E40AF;

Proposal menentukan makna status: kuning menunggu pemeriksaan, biru diproses, hijau disetujui, merah ditolak, abu-abu selesai/dibatalkan. Gunakan token semantik berikut dan selalu tampilkan label teks:

| Status               | Token   |
| -------------------- | ------- |
| Menunggu pemeriksaan | warning |
| Sedang diproses      | info    |
| Disetujui            | success |
| Ditolak              | danger  |
| Selesai/dibatalkan   | muted   |

Pastikan kontras warna memenuhi WCAG AA sebagai target. Ukur ulang setelah logo resmi diterapkan.

## Tipografi dan skala

- Font usulan Inter, fallback Arial/sans-serif atau font sistem.
- Body 16px; teks sekunder minimal 14px.
- H1 32–40px desktop, 28–32px mobile; H2 24–28px; H3 18–20px.
- Weight 400 untuk body, 500 untuk label, 600 untuk judul/aksi utama.
- Gunakan skala spacing 4px: 4, 8, 12, 16, 24, 32, 48, 64.
- Konten maksimum sekitar 1200px; gutter 16px mobile dan 24–32px desktop.
- Grid katalog: 1 kolom pada layar <768px, 2 kolom pada 768–1023px, dan 3 kolom mulai 1024px. Layout operator menumpuk pada mobile dan memakai konten utama + panel review pada layar lebar.
- Radius kartu 10–12px, input/tombol 8px; border tipis dan shadow ringan.

## Komponen dasar

### Tombol

Primary untuk aksi utama, tinggi minimum 44px. Secondary memakai surface dan border. Destructive hanya untuk tindakan berisiko. Gunakan label konkret seperti Ajukan peminjaman, Setujui, Tolak, dan Simpan perubahan.

### Form

Label selalu terlihat; placeholder bukan label. Tandai field wajib dan format tanggal/waktu. Pesan validasi menyebut perbaikan yang harus dilakukan. Sebelum submit, tunjukkan gedung, waktu, tarif/syarat, dan pernyataan.

### Kartu gedung

Foto berasio konsisten dan punya alt text. Susunan: nama, lokasi, kapasitas, fasilitas utama, tarif publik bila berlaku, CTA Lihat detail.

### Kalender

Tampilkan legenda dan rentang waktu. Kalender publik tidak memperlihatkan identitas pemesan. Sediakan agenda/list untuk mobile dan tunjukkan zona waktu.

### Badge dan timeline

Badge menyertakan teks beserta warna. Timeline menunjukkan waktu, keputusan, catatan dan langkah berikutnya. Penolakan/revisi disertai alasan.

### Dialog, alert dan toast

Dialog untuk konfirmasi tindakan, bukan form panjang. Toast untuk sukses singkat. Error yang memerlukan tindakan tetap ditampilkan pada halaman. Perubahan status penting tersimpan di riwayat.

## Layout per konteks

### Publik

Header: identitas, Gedung, Jadwal, Prosedur, Masuk. Hero mengutamakan pencarian. Katalog dalam grid responsif. Footer berisi kontak/prosedur resmi.

### Pemohon

Navigasi ringkas, tombol pengajuan baru, filter status. Gunakan kartu di mobile dan tabel adaptif di desktop.

### Operator

Navigasi sisi: antrean, kalender, gedung, tarif, riwayat. Ringkasan antrean di awal. Detail pemohon hanya terlihat role berwenang.

## Tailwind CSS

Definisikan warna, font, radius dan shadow secara terpusat pada theme atau CSS variables. Hindari nilai hex berulang. Buat komponen reusable untuk Button, Input, Badge, Card, Dialog, Table dan status.

## Aksesibilitas dan aset

- Semua kontrol keyboard-accessible dengan fokus terlihat.
- Status tidak boleh dibedakan hanya dengan warna.
- Foto gedung harus milik Polinela atau memiliki izin penggunaan.
- Gunakan satu keluarga ikon; ikon status didampingi teks.
- Hindari emoji untuk navigasi atau status resmi.

## Checklist setiap layar

- Tindakan berikutnya terlihat dan dipahami.
- Tarif/ketersediaan jelas serta bersumber dari data terbaru.
- Tampilan mobile tetap dapat memakai kalender dan aksi utama.
- Informasi pribadi hanya terlihat oleh role berhak.
- Gaya mengikuti panduan merek resmi jika sudah tersedia.

## Pemetaan warna status dari proposal

Proposal menentukan kuning untuk menunggu pemeriksaan, biru untuk sedang diproses, hijau untuk disetujui, merah untuk ditolak, dan abu-abu untuk selesai/dibatalkan. Gunakan token terpisah agar status mudah disesuaikan:

    --status-pending-bg: #FEF3C7;
    --status-pending-text: #854D0E;
    --status-processing-bg: #DBEAFE;
    --status-processing-text: #1E40AF;
    --status-approved-bg: #DCFCE7;
    --status-approved-text: #166534;
    --status-rejected-bg: #FEE2E2;
    --status-rejected-text: #991B1B;
    --status-closed-bg: #E5E7EB;
    --status-closed-text: #374151;

Makna status konsisten dengan proposal; warna teks gelap menjaga keterbacaan. Pastikan kontras tiap kombinasi diuji pada badge aktual. Status AWAITING_PAYMENT memakai label “Disetujui, menunggu pembayaran” dan gaya pending/info, sedangkan CONFIRMED memakai gaya approved. Jangan memperkenalkan warna status lain tanpa memperbarui mapping lintas UI.

Gunakan nilai token di atas pada ketiga dokumen desain. `Terkirim`, `Perlu perbaikan`, dan `Menunggu persetujuan` memakai warning; `Sedang diperiksa` memakai processing/info; `AWAITING_PAYMENT` memakai warning atau processing/info dengan label eksplisit; `CONFIRMED` memakai approved; `REJECTED` memakai rejected; `CANCELLED`, `EXPIRED`, dan `COMPLETED` memakai closed. Badge selalu memiliki label teks; ikon menjadi penguat, bukan pengganti label.
