import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">VenueConnect Polinela</p>
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mb-6 leading-6 text-slate-600">Alamat ini mungkin berubah atau belum tersedia. Kembali ke katalog untuk mencari gedung.</p>
        <Link href="/" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800">
          Kembali ke katalog
        </Link>
      </section>
    </div>
  );
}
