'use client';

import { useEffect, useState } from 'react';
import { ApiRequestError, getAdminUsageHistory } from '@/lib/api-client';
import { formatDateTime } from '@/lib/formatters';

const actionLabels = {
  'usage.keys_handed_over': 'Kunci diserahkan',
  'usage.keys_returned': 'Kunci dikembalikan',
  'booking.completed': 'Penggunaan diselesaikan'
};

function messageFor(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Riwayat hanya tersedia bagi ADMIN atau BUILDING_OFFICER pada development.';
  }
  return error instanceof Error ? error.message : 'Riwayat petugas gagal dimuat.';
}

export default function UsageHistoryPanel() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getAdminUsageHistory({ page, pageSize: 20 })
      .then((result) => {
        if (cancelled) return;
        if (page > 1 && result.data?.length === 0) {
          setPage(page - 1);
          return;
        }
        setRows(result.data ?? []);
        setMeta(result.meta ?? null);
      })
      .catch((loadError) => { if (!cancelled) setError(messageFor(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, reloadKey]);

  const reload = () => {
    setLoading(true);
    setError('');
    setReloadKey((value) => value + 1);
  };

  const changePage = (nextPage) => {
    setLoading(true);
    setError('');
    setPage(nextPage);
  };

  return <section aria-labelledby="usage-history-title" className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 id="usage-history-title" className="text-lg font-bold text-slate-900">Riwayat tindakan petugas</h2>
        <p className="mt-1 text-sm text-slate-600">Catatan serah-terima, pengembalian, dan penyelesaian. Identitas pemohon serta isi catatan kondisi tidak ditampilkan.</p>
      </div>
      <button type="button" onClick={reload} disabled={loading} className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50">Muat ulang riwayat</button>
    </header>
    {loading ? <p role="status" className="text-sm text-slate-600">Memuat riwayat petugas…</p> : error ? (
      <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>
    ) : rows.length === 0 ? (
      <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Belum ada tindakan penggunaan yang tercatat.</p>
    ) : <ul className="space-y-3">
      {rows.map((row) => <li key={row.id} className="rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">{row.publicReference} · {row.buildingName}</h3>
        <p className="mt-1 text-xs text-slate-600">{row.keyGivenAt ? `Diserahkan ${formatDateTime(row.keyGivenAt)} · ${row.keyReturnedAt ? `Dikembalikan ${formatDateTime(row.keyReturnedAt)}` : 'Belum dikembalikan'}` : 'Tanpa catatan serah-terima'} · {row.bookingStatus === 'COMPLETED' ? 'Selesai' : 'Terkonfirmasi'}</p>
        <ol className="mt-3 space-y-1 border-l-2 border-slate-200 pl-3 text-sm text-slate-700">
          {row.actions.map((event, index) => <li key={`${event.action}-${event.createdAt}-${index}`}>
            {actionLabels[event.action] ?? 'Tindakan dicatat'} · {formatDateTime(event.createdAt)} · {event.actorName}
          </li>)}
        </ol>
      </li>)}
    </ul>}
    {!loading && !error && meta?.totalPages > 1 && <nav aria-label="Halaman riwayat petugas" className="flex items-center justify-center gap-3">
      <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Sebelumnya</button>
      <span className="text-sm text-slate-600">Halaman {meta.page} dari {meta.totalPages}</span>
      <button type="button" disabled={page >= meta.totalPages} onClick={() => changePage(page + 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Berikutnya</button>
    </nav>}
  </section>;
}
