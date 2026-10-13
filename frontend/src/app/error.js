'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12">
      <section role="alert" className="w-full rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-800">VenueConnect Polinela</p>
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Halaman gagal dimuat</h1>
        <p className="mb-6 leading-6 text-slate-600">Terjadi gangguan saat menampilkan halaman. Coba muat ulang atau kembali ke katalog.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800">
            Coba lagi
          </button>
          <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">
            Kembali ke katalog
          </Link>
        </div>
      </section>
    </div>
  );
}
