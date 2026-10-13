'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMyBookingSummary, getMyBookings } from '@/lib/api-client';
import { formatBookingDate } from '@/lib/booking-display';
import { getApiErrorState } from '@/lib/api-error-state';
import StatusBadge from '@/components/status-badge';

export default function MemberBookingsDashboard() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyBookings({ page, pageSize: 20, status: statusFilter || undefined })
      .then((response) => {
        if (cancelled) return;
        if (!response.success || !Array.isArray(response.data)) throw new Error('Respons pengajuan tidak valid.');
        setBookings(response.data);
        setMeta(response.meta ?? null);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, reloadKey, statusFilter]);

  useEffect(() => {
    let cancelled = false;
    getMyBookingSummary()
      .then((response) => { if (!cancelled) setSummary(response.data ?? null); })
      .catch(() => { if (!cancelled) setSummary(null); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setError(null);
    setReloadKey((value) => value + 1);
  };

  const changePage = (nextPage) => {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  };

  const errorState = error ? getApiErrorState(error, 'daftar pengajuan') : null;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dasbor Saya</h1>
          <p className="mt-1 text-sm text-slate-600">Daftar ini hanya memuat pengajuan milik akun yang sedang masuk.</p>
        </div>
        <Link href="/" className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Cari gedung</Link>
      </header>

      {summary && <section aria-label="Ringkasan status pengajuan" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[["Total pengajuan", summary.total], ["Menunggu / diproses", summary.pending], ["Disetujui", summary.confirmed], ["Selesai", summary.completed]].map(([label, value]) => <article key={label} className="home-card p-4 sm:p-5"><h2 className="text-sm font-medium text-slate-600">{label}</h2><p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p></article>)}
      </section>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">Pengajuan saya</h2>
            {meta && <p className="mt-1 text-sm text-slate-600">Total {meta.total} pengajuan</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="booking-status-filter" className="sr-only">Filter status pengajuan</label>
            <select id="booking-status-filter" value={statusFilter} onChange={(event) => { setLoading(true); setError(null); setPage(1); setStatusFilter(event.target.value); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm">
              <option value="">Semua status</option>
              <option value="DRAFT,SUBMITTED,UNDER_REVIEW,REVISION_REQUESTED,AWAITING_APPROVAL,AWAITING_PAYMENT">Draf / diproses</option>
              <option value="CONFIRMED">Dikonfirmasi</option>
              <option value="COMPLETED">Selesai</option>
              <option value="REJECTED">Ditolak</option>
            </select>
            <button type="button" onClick={reload} disabled={loading} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">Muat ulang</button>
          </div>
        </div>

        {loading ? (
          <p role="status" className="p-8 text-center text-slate-600">Memuat pengajuan…</p>
        ) : error ? (
          <div role="alert" className="p-6 text-center">
            <p className="mb-2 font-semibold text-slate-900">{errorState.title}</p>
            <p className="mb-4 text-sm text-slate-600">{errorState.message}</p>
            {error.requestId && <p className="mb-4 text-xs text-slate-500">Referensi dukungan: {error.requestId}</p>}
            {errorState.canRetry && <button type="button" onClick={reload} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Muat ulang</button>}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="mb-2 font-semibold text-slate-900">Belum ada pengajuan</p>
            <p className="mb-4 text-sm text-slate-600">Pengajuan yang Anda kirim akan muncul di sini.</p>
            <Link href="/" className="font-semibold text-emerald-700 hover:underline">Lihat katalog gedung</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Nomor pengajuan</th>
                    <th scope="col" className="px-5 py-3">Kegiatan</th>
                    <th scope="col" className="px-5 py-3">Gedung</th>
                    <th scope="col" className="px-5 py-3">Waktu mulai</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3">Tanggal pengajuan</th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Aksi</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-mono text-xs font-medium text-slate-800">{booking.publicReference}</td>
                      <td className="px-5 py-4 font-medium text-slate-900">{booking.eventName}</td>
                      <td className="px-5 py-4 text-slate-700">{booking.building?.name ?? 'Gedung tidak tersedia'}</td>
                      <td className="px-5 py-4 text-slate-700">{formatBookingDate(booking.startsAt)}</td>
                      <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-5 py-4 text-slate-700">{formatBookingDate(booking.createdAt)}</td>
                      <td className="px-5 py-4"><Link href={`/dashboard/${booking.id}`} className="font-semibold text-emerald-700 hover:underline">Detail</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta?.totalPages > 1 && (
              <nav aria-label="Halaman pengajuan" className="flex items-center justify-center gap-4 border-t border-slate-200 p-4">
                <button type="button" onClick={() => changePage(Math.max(1, page - 1))} disabled={page <= 1} className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40">Sebelumnya</button>
                <span className="text-sm text-slate-600">Halaman {page} dari {meta.totalPages}</span>
                <button type="button" onClick={() => changePage(Math.min(meta.totalPages, page + 1))} disabled={page >= meta.totalPages} className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40">Berikutnya</button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
