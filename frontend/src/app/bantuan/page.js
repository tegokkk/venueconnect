import AssistantPanel from './assistant-panel';
import Link from 'next/link';

export const metadata = {
  title: 'Bantuan AI | VenueConnect Polinela',
  description: 'Tanyakan informasi gedung, fasilitas, tarif sewa luar kampus, dan ketersediaan VenueConnect.'
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-800">Pusat bantuan</p>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-950">Tanyakan tentang penggunaan gedung</h1>
      <p className="mb-4 max-w-2xl leading-7 text-slate-700">
        Asisten dapat membantu mencari informasi gedung, fasilitas, tarif sewa luar kampus yang aktif, dan jadwal umum.
        Keputusan akhir pada pengelola. Jawaban bersifat informasi, bukan konfirmasi resmi.
      </p>
      <section aria-labelledby="faq-heading" className="mb-8">
        <h2 id="faq-heading" className="mb-3 text-lg font-semibold text-slate-900">Pertanyaan yang sering diajukan</h2>
        <div className="space-y-3">
          {[
            ['Bagaimana mencari gedung?', <>Buka <Link href="/gedung" className="font-semibold text-primary underline">katalog gedung</Link>, lalu gunakan filter nama, fasilitas, dan kapasitas.</>],
            ['Bagaimana memeriksa jadwal?', <>Pilih gedung pada halaman <Link href="/jadwal" className="font-semibold text-primary underline">kalender jadwal</Link>. Informasi publik hanya menampilkan rentang waktu dan status umum.</>],
            ['Siapa yang meminjam dan siapa yang menyewa?', 'Mahasiswa, dosen, dan civitas akademika Polinela mengajukan peminjaman. Orang atau instansi luar kampus mengajukan penyewaan. Harga yang tampil hanya tarif sewa luar kampus.'],
            ['Apakah semua gedung dapat disewa luar kampus?', 'Hanya gedung dengan label sewa luar kampus yang dapat diajukan untuk penyewaan. Syarat dan tarif perlu dikonfirmasi kepada pengelola.'],
            ['Apakah pengajuan dapat dikirim melalui portal?', 'Formulir saat ini dapat digunakan untuk meninjau rincian. Pengiriman belum diaktifkan karena autentikasi produksi, aturan persetujuan, dan kebijakan berkas masih disiapkan.'],
            ['Apakah jawaban asisten merupakan persetujuan?', 'Tidak. Asisten memberikan informasi dari data yang tersedia; keputusan dan konfirmasi resmi tetap berasal dari pengelola fasilitas.']
          ].map(([question, answer], idx) => <details key={question} id={`faq-item-${idx}`} className="home-card group px-5 py-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f7662]">
              <span>{question}</span>
              <span className="material-symbols-outlined text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span>
            </summary>
            <div className="border-t border-slate-100 py-3 text-sm leading-6 text-slate-600">{answer}</div>
          </details>)}
        </div>
      </section>
      <AssistantPanel />
    </div>
  );
}
