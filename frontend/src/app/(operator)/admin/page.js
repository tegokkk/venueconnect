'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ApiRequestError, getAdminBookingSummary, getAdminBookings, getAdminBuildings } from '@/lib/api-client';
import { formatBookingDate } from '@/lib/booking-display';
import StatusBadge from '@/components/status-badge';

async function getAllAdminBuildings() {
  const firstPage = await getAdminBuildings({ page: 1, pageSize: 100 });
  if (!Array.isArray(firstPage.data)) throw new Error('Format data gedung tidak valid.');

  const buildings = [...firstPage.data];
  const totalPages = firstPage.meta?.totalPages ?? 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const result = await getAdminBuildings({ page, pageSize: 100 });
    if (!Array.isArray(result.data)) throw new Error('Format data gedung tidak valid.');
    buildings.push(...result.data);
  }
  return buildings;
}

function getErrorMessage(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Akses dasbor admin belum tersedia. Di development, atur NEXT_PUBLIC_DEV_USER_ID ke UUID user aktif dengan role ADMIN.';
  }
  return error instanceof Error ? error.message : 'Ringkasan gedung belum dapat dimuat.';
}

export default function OperatorDashboard() {
  const [buildings, setBuildings] = useState([]);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queuePage, setQueuePage] = useState(1);
  const [queueStatus, setQueueStatus] = useState('');
  const [queueCategory, setQueueCategory] = useState('');
  const [queueSearch, setQueueSearch] = useState('');
  const [queueSort, setQueueSort] = useState('createdAt_desc');
  const [queueMeta, setQueueMeta] = useState(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [queueReload, setQueueReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [nextBuildings, nextBookingSummary] = await Promise.all([
        getAllAdminBuildings(),
        getAdminBookingSummary()
      ]);
      setBuildings(nextBuildings);
      setBookingSummary(nextBookingSummary.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadDashboard = () => {
    setLoading(true);
    setError('');
    load();
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllAdminBuildings(), getAdminBookingSummary()])
      .then(([nextBuildings, nextBookingSummary]) => {
        if (cancelled) return;
        setBuildings(nextBuildings);
        setBookingSummary(nextBookingSummary.data);
      })
      .catch((loadError) => { if (!cancelled) setError(getErrorMessage(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAdminBookings({
      page: queuePage,
      pageSize: 20,
      status: queueStatus || undefined,
      category: queueCategory || undefined,
      search: queueSearch || undefined,
      sort: queueSort
    })
      .then((result) => {
        if (cancelled) return;
        setQueue(result.data ?? []);
        setQueueMeta(result.meta ?? null);
      })
      .catch((loadError) => {
        if (!cancelled) setQueueError(getErrorMessage(loadError));
      })
      .finally(() => { if (!cancelled) setQueueLoading(false); });
    return () => { cancelled = true; };
  }, [queuePage, queueStatus, queueCategory, queueSearch, queueSort, queueReload]);

  const activeBuildings = buildings.filter((building) => building.isActive).length;
  const inactiveBuildings = buildings.length - activeBuildings;
  const publicRentalBuildings = buildings.filter((building) => building.isActive && building.publicRentalEnabled).length;
  const facilityCount = new Set(buildings.flatMap((building) => (building.facilities ?? []).map(({ facility }) => facility.id))).size;
  const metrics = [
    ['Total gedung', buildings.length, 'Seluruh status'],
    ['Gedung aktif', activeBuildings, 'Tampil di katalog publik'],
    ['Sewa luar kampus', publicRentalBuildings, 'Gedung aktif dengan izin sewa luar kampus'],
    ['Jenis fasilitas', facilityCount, 'Terpasang pada gedung'],
    ['Total pengajuan', bookingSummary?.total ?? 0, 'Semua status'],
    ['Perlu persetujuan', bookingSummary?.byStatus?.AWAITING_APPROVAL ?? 0, 'Menunggu langkah approval'],
    ['Menunggu pembayaran', bookingSummary?.byStatus?.AWAITING_PAYMENT ?? 0, 'Penyewaan yang disetujui'],
    ['Terkonfirmasi', bookingSummary?.byStatus?.CONFIRMED ?? 0, 'Slot telah dikonfirmasi']
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-800">Administrasi</p>
          <h1 className="text-2xl font-bold text-slate-900">Ringkasan gedung</h1>
          <p className="mt-2 text-sm text-slate-600">Angka di halaman ini dimuat dari API admin, bukan data contoh. Ringkasan booking hanya berisi agregat status tanpa identitas pemohon.</p>
        </div>
        <Link href="/admin/gedung" className="min-h-11 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900">Kelola gedung</Link>
      </header>

      <div role="note" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Metrik booking bersifat baca-saja dan belum menunjukkan daftar antrean atau tugas per role. API antrean serta pembagian capability operator belum tersedia, dan autentikasi production belum diaktifkan.
      </div>

      {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
        <p>{error}</p>
        <button type="button" onClick={reloadDashboard} disabled={loading} className="mt-3 min-h-10 rounded-lg border border-rose-400 px-3 font-semibold hover:bg-rose-100 disabled:opacity-50">Coba lagi</button>
      </div>}

      {loading ? <p role="status" className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Memuat ringkasan gedung…</p> : !error ? (
        <section aria-label="Statistik gedung" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, description]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-slate-600">{label}</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </article>)}
        </section>
      ) : null}

      {!loading && !error && inactiveBuildings > 0 && <p className="text-sm text-slate-600">{inactiveBuildings} gedung berstatus nonaktif dan tidak tampil di katalog.</p>}
      {!loading && !error && buildings.length === 0 && <p role="status" className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Belum ada data gedung. Tambahkan melalui halaman Kelola Gedung.</p>}

      <section aria-labelledby="admin-bookings-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="space-y-4 border-b border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="admin-bookings-heading" className="font-bold text-slate-900">Pengajuan aktif</h2>
              <p className="mt-1 text-sm text-slate-600">Antrean tanpa identitas pemohon. Review tersedia hanya untuk simulasi development dengan akun ADMIN.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={queueSearch}
                onChange={(event) => { setQueueLoading(true); setQueueError(''); setQueueSearch(event.target.value); setQueuePage(1); }}
                placeholder="Cari no. ref / gedung / kegiatan…"
                aria-label="Cari pengajuan"
                className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
            <label className="flex items-center gap-2 font-medium text-slate-700">
              <span>Status:</span>
              <select
                value={queueStatus}
                onChange={(event) => { setQueueLoading(true); setQueueError(''); setQueueStatus(event.target.value); setQueuePage(1); }}
                className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal"
              >
                <option value="">Semua status aktif</option>
                <option value="SUBMITTED">Terkirim</option>
                <option value="UNDER_REVIEW">Sedang diperiksa</option>
                <option value="REVISION_REQUESTED">Perlu perbaikan</option>
                <option value="AWAITING_APPROVAL">Menunggu persetujuan</option>
                <option value="AWAITING_PAYMENT">Menunggu pembayaran</option>
                <option value="CONFIRMED">Disetujui / Terkonfirmasi</option>
                <option value="EXPIRED">Kedaluwarsa</option>
                <option value="REJECTED">Ditolak</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </label>

            <label className="flex items-center gap-2 font-medium text-slate-700">
              <span>Kategori:</span>
              <select
                value={queueCategory}
                onChange={(event) => { setQueueLoading(true); setQueueError(''); setQueueCategory(event.target.value); setQueuePage(1); }}
                className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal"
              >
                <option value="">Semua kategori</option>
                <option value="MAHASISWA">Mahasiswa</option>
                <option value="DOSEN_PEGAWAI">Dosen / Pegawai</option>
                <option value="UMUM">Umum (Sewa Luar Kampus)</option>
              </select>
            </label>

            <label className="flex items-center gap-2 font-medium text-slate-700">
              <span>Urutkan:</span>
              <select
                value={queueSort}
                onChange={(event) => { setQueueLoading(true); setQueueError(''); setQueueSort(event.target.value); setQueuePage(1); }}
                className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 font-normal"
              >
                <option value="createdAt_desc">Terbaru diajukan</option>
                <option value="createdAt_asc">Terlama diajukan</option>
                <option value="startsAt_asc">Pelaksanaan terdekat</option>
                <option value="startsAt_desc">Pelaksanaan terjauh</option>
              </select>
            </label>
          </div>
        </header>
        {queueError && <div role="alert" className="p-5 text-sm text-rose-900">
          <p>{queueError}</p>
          <button type="button" onClick={() => { setQueueLoading(true); setQueueError(''); setQueueReload((value) => value + 1); }} className="mt-3 min-h-10 rounded-lg border border-rose-300 px-3 font-semibold">Coba lagi</button>
        </div>}
        {queueLoading ? <p role="status" className="p-6 text-center text-sm text-slate-600">Memuat pengajuan aktif…</p> : !queueError && queue.length === 0 ? (
          <p role="status" className="p-6 text-center text-sm text-slate-600">Tidak ada pengajuan pada filter ini.</p>
        ) : !queueError ? <>
          <ul className="divide-y divide-slate-100">
            {queue.map((booking) => {
              const categoryBadge = booking.applicantCategory === 'MAHASISWA'
                ? { label: 'Mahasiswa', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
                : booking.applicantCategory === 'DOSEN_PEGAWAI'
                ? { label: 'Dosen / Pegawai', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
                : { label: 'Umum (Sewa)', bg: 'bg-amber-50 text-amber-800 border-amber-200' };

              return (
                <li key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{booking.publicReference}</span>
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${categoryBadge.bg}`}>
                        {categoryBadge.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {booking.building?.name ?? 'Gedung'}
                      {booking.eventName ? <span className="font-normal text-slate-600"> · {booking.eventName}</span> : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatBookingDate(booking.startsAt)} – {formatBookingDate(booking.endsAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={booking.status} />
                    <Link
                      href={`/admin/pengajuan/${booking.id}`}
                      className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
                    >
                      Lihat detail
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
          {queueMeta?.totalPages > 1 && <nav aria-label="Halaman pengajuan aktif" className="flex items-center justify-center gap-4 border-t border-slate-200 p-4">
          <button type="button" onClick={() => { setQueueLoading(true); setQueueError(''); setQueuePage((page) => Math.max(1, page - 1)); }} disabled={queuePage <= 1 || queueLoading} className="min-h-10 rounded-lg border border-slate-300 px-3 disabled:opacity-50">Sebelumnya</button>
            <span className="text-sm text-slate-600">Halaman {queueMeta.page} dari {queueMeta.totalPages}</span>
          <button type="button" onClick={() => { setQueueLoading(true); setQueueError(''); setQueuePage((page) => Math.min(queueMeta.totalPages, page + 1)); }} disabled={queuePage >= queueMeta.totalPages || queueLoading} className="min-h-10 rounded-lg border border-slate-300 px-3 disabled:opacity-50">Berikutnya</button>
          </nav>}
        </> : null}
      </section>
    </div>
  );
}
