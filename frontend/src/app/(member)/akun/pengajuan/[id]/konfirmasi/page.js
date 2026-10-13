import Link from 'next/link';
import { getBookingDetail } from '@/lib/api-client';
import { formatBookingDate } from '@/lib/booking-display';
import StatusBadge from '@/components/status-badge';

export const instant = false;

export default async function BookingConfirmation({ params }) {
  const { id } = await params;
  let booking = null;
  let loadError = false;
  try {
    const response = await getBookingDetail(id);
    booking = response.data ?? null;
  } catch {
    loadError = true;
  }

  return <div className="mx-auto max-w-3xl py-6">
    <section className="home-card p-6 sm:p-9">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-800"><span className="material-symbols-outlined" aria-hidden="true">{booking ? 'task_alt' : 'info'}</span></span>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{booking ? 'Rincian pengajuan' : 'Status pengajuan belum dapat dipastikan'}</h1>
      {loadError ? <p role="alert" className="mt-2 text-sm leading-6 text-slate-600">Portal belum dapat memuat data pengajuan ini. Masuk dan buka daftar pengajuan untuk mencoba kembali. Halaman ini tidak menyatakan pengajuan berhasil dikirim.</p> : booking ? <>
        <p className="mt-2 text-sm leading-6 text-slate-600">Berikut status yang tercatat pada layanan. Status ini menjadi acuan langkah berikutnya.</p>
        <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Nomor pengajuan</dt><dd className="mt-1 font-mono text-sm font-semibold text-slate-900">{booking.publicReference}</dd></div>
          <div><dt className="text-xs text-slate-500">Status</dt><dd className="mt-1"><StatusBadge status={booking.status} /></dd></div>
          <div><dt className="text-xs text-slate-500">Kegiatan</dt><dd className="mt-1 font-medium text-slate-900">{booking.eventName}</dd></div>
          <div><dt className="text-xs text-slate-500">Gedung</dt><dd className="mt-1 font-medium text-slate-900">{booking.building?.name ?? 'Tidak tersedia'}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Waktu mulai</dt><dd className="mt-1 font-medium text-slate-900">{formatBookingDate(booking.startsAt)}</dd></div>
        </dl>
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Periksa perubahan status pada halaman detail. Untuk pemohon eksternal, pastikan pembayaran hanya dilakukan setelah instruksi resmi pengelola diterbitkan.</p>
      </> : <p className="mt-2 text-sm leading-6 text-slate-600">Belum ada data pengajuan yang dapat ditampilkan untuk referensi ini.</p>}
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/akun/pengajuan" className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white">Daftar pengajuan</Link>{booking && <Link href={`/akun/pengajuan/${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800">Lihat detail</Link>}</div>
    </section>
  </div>;
}
