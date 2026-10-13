'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ApiRequestError,
  completeAdminBooking,
  getAdminUsage,
  recordKeyHandover,
  recordKeyReturn
} from '@/lib/api-client';
import { formatDateTime } from '@/lib/formatters';

function messageFor(error, isCompletion) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return isCompletion
      ? 'Akses pengelola belum tersedia. Di development, gunakan akun aktif dengan role ADMIN.'
      : 'Akses petugas gedung belum tersedia. Di development, gunakan akun aktif dengan role BUILDING_OFFICER.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
}

export default function UsagePanel({ mode = 'handover' }) {
  const isCompletion = mode === 'completion';
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [drafts, setDrafts] = useState({});
  const [confirmTarget, setConfirmTarget] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const result = await getAdminUsage({ page, pageSize: 20 });
      if (page > 1 && result.data?.length === 0) {
        setPage(page - 1);
        return;
      }
      setRows(result.data ?? []);
      setPageMeta(result.meta ?? null);
    } catch (loadError) {
      setError(messageFor(loadError, isCompletion));
    } finally {
      setLoading(false);
    }
  }, [page, isCompletion]);

  useEffect(() => {
    let cancelled = false;
    getAdminUsage({ page, pageSize: 20 })
      .then((result) => { if (!cancelled) { setRows(result.data ?? []); setPageMeta(result.meta ?? null); } })
      .catch((loadError) => { if (!cancelled) setError(messageFor(loadError, isCompletion)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, isCompletion]);

  const setDraft = (id, key, value) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  };

  const executeComplete = async (row) => {
    setBusyId(row.id);
    setError('');
    setNotice('');
    try {
      await completeAdminBooking(row.id);
      setNotice(`Penggunaan ${row.publicReference} berhasil diselesaikan.`);
      await refresh();
    } catch (actionError) {
      setError(messageFor(actionError, isCompletion));
    } finally {
      setBusyId('');
      setConfirmTarget(null);
    }
  };

  const runAction = async (row, action) => {
    if (action === 'complete') {
      setConfirmTarget(row);
      return;
    }

    setBusyId(row.id);
    setError('');
    setNotice('');
    try {
      const draft = drafts[row.id] ?? {};
      if (action === 'handover') {
        await recordKeyHandover(row.id, {
          conditionBefore: draft.conditionBefore?.trim() || undefined,
          notes: draft.notes?.trim() || undefined
        });
        setNotice(`Serah-terima kunci ${row.publicReference} tercatat.`);
      } else if (action === 'return') {
        await recordKeyReturn(row.id, {
          conditionAfter: draft.conditionAfter?.trim() || undefined,
          notes: draft.notes?.trim() || undefined
        });
        setNotice(`Pengembalian kunci ${row.publicReference} tercatat.`);
      }
      await refresh();
    } catch (actionError) {
      setError(messageFor(actionError, isCompletion));
    } finally {
      setBusyId('');
    }
  };

  return (
    <section aria-labelledby="usage-panel-title" className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="usage-panel-title" className="text-lg font-bold text-slate-900">{isCompletion ? 'Penyelesaian penggunaan' : 'Serah-terima kunci'}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Menampilkan booking terkonfirmasi tanpa data pribadi pemohon. {isCompletion ? 'Pengelola menutup penggunaan setelah kunci dikembalikan; akses role ADMIN di development.' : 'Petugas mencatat penyerahan dan pengembalian kunci; akses role BUILDING_OFFICER di development. Assignment per gedung belum aktif.'}</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); setError(''); refresh(); }} disabled={loading} className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Muat ulang</button>
      </header>
      {error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {loading ? <p role="status" className="text-sm text-slate-600">Memuat penggunaan terkonfirmasi…</p> : error ? null : rows.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Tidak ada booking terkonfirmasi yang menunggu pengelolaan penggunaan.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            const handover = row.usageHandover;
            const draft = drafts[row.id] ?? {};
            const busy = busyId === row.id;
            return (
              <li key={row.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{row.publicReference} · {row.building.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{formatDateTime(row.startsAt)} – {formatDateTime(row.endsAt)} · {row.bookingType === 'RENTAL' ? 'Sewa' : 'Internal'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">{!handover ? 'Kunci belum diserahkan' : handover.keyReturnedAt ? 'Kunci dikembalikan' : 'Kunci sudah diserahkan'}</span>
                </div>
                {handover && <p className="mt-2 text-xs text-slate-600">{`Diserahkan ${formatDateTime(handover.keyGivenAt)}${handover.keyReturnedAt ? ` · Dikembalikan ${formatDateTime(handover.keyReturnedAt)}` : ''}`}</p>}
                {!isCompletion && <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {!handover ? (
                    <label className="text-sm font-medium text-slate-700">Kondisi sebelum penggunaan
                      <textarea rows={2} maxLength={1000} value={draft.conditionBefore ?? ''} onChange={(event) => setDraft(row.id, 'conditionBefore', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
                    </label>
                  ) : !handover.keyReturnedAt ? (
                    <label className="text-sm font-medium text-slate-700">Kondisi setelah penggunaan
                      <textarea rows={2} maxLength={1000} value={draft.conditionAfter ?? ''} onChange={(event) => setDraft(row.id, 'conditionAfter', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
                    </label>
                  ) : <p className="text-sm text-slate-600">Kunci sudah dikembalikan. Pengelola dapat menutup penggunaan.</p>}
                  {!handover?.keyReturnedAt && <label className="text-sm font-medium text-slate-700">Catatan
                    <textarea rows={2} maxLength={2000} value={draft.notes ?? handover?.notes ?? ''} onChange={(event) => setDraft(row.id, 'notes', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
                  </label>}
                </div>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {isCompletion ? handover && !handover.keyReturnedAt ? (
                    <p className="text-sm text-slate-600">Menunggu pengembalian kunci oleh petugas gedung.</p>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => runAction(row, 'complete')} className="min-h-10 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50">{busy ? 'Menyimpan…' : 'Selesaikan penggunaan'}</button>
                  ) : !handover ? (
                    <button type="button" disabled={busy} onClick={() => runAction(row, 'handover')} className="min-h-10 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50">{busy ? 'Menyimpan…' : 'Catat serah-terima kunci'}</button>
                  ) : !handover.keyReturnedAt ? (
                    <button type="button" disabled={busy} onClick={() => runAction(row, 'return')} className="min-h-10 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50">{busy ? 'Menyimpan…' : 'Catat pengembalian kunci'}</button>
                  ) : <p className="text-sm text-slate-600">Serah-terima telah selesai dicatat.</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {!loading && !error && pageMeta?.totalPages > 1 && <nav aria-label="Halaman penggunaan gedung" className="flex items-center justify-center gap-3">
        <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setError(''); setPage((current) => current - 1); }} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium disabled:opacity-50">Sebelumnya</button>
        <span className="text-sm text-slate-600">Halaman {pageMeta.page} dari {pageMeta.totalPages}</span>
        <button type="button" disabled={page >= pageMeta.totalPages} onClick={() => { setLoading(true); setError(''); setPage((current) => current + 1); }} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium disabled:opacity-50">Berikutnya</button>
      </nav>}
      {confirmTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="complete-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !busyId) setConfirmTarget(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 id="complete-confirm-title" className="text-lg font-bold text-slate-900">
              Konfirmasi penyelesaian
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tandai penggunaan untuk <strong>{confirmTarget.publicReference}</strong> ({confirmTarget.building?.name}) sebagai selesai? Tindakan ini akan mengakhiri siklus peminjaman/penyewaan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={Boolean(busyId)}
                className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeComplete(confirmTarget)}
                disabled={Boolean(busyId)}
                className="min-h-10 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50"
              >
                {busyId ? 'Menyimpan…' : 'Ya, selesaikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
