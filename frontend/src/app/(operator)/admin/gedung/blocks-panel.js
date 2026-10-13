'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ApiRequestError,
  createBuildingBlock,
  deleteBuildingBlock,
  getAdminBuildings,
  getBuildingBlocks
} from '@/lib/api-client';
import { formatDateTime, localDateTimeToIso } from '@/lib/formatters';

function errorText(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Akses admin belum tersedia. Isi NEXT_PUBLIC_DEV_USER_ID dengan UUID user aktif ber-role ADMIN di development.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
}

export default function BlocksPanel() {
  const [buildings, setBuildings] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ startsAt: '', endsAt: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadBlocks = useCallback(async (slug, nextPage = 1) => {
    if (!slug) return;
    try {
      const result = await getBuildingBlocks(slug, { page: nextPage });
      setBlocks(result.data ?? []);
      setPage(result.meta?.page ?? nextPage);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch (loadError) {
      setError(errorText(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAdminBuildings()
      .then((result) => {
        if (cancelled) return;
        const next = result.data ?? [];
        setBuildings(next);
        const nextSlug = next[0]?.slug || '';
        setSelectedSlug(nextSlug);
        if (!nextSlug) setLoading(false);
      })
      .catch((loadError) => { if (!cancelled) setError(errorText(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedSlug) return undefined;
    let cancelled = false;
    getBuildingBlocks(selectedSlug, { page: 1 })
      .then((result) => {
        if (cancelled) return;
        setBlocks(result.data ?? []);
        setPage(result.meta?.page ?? 1);
        setTotalPages(result.meta?.totalPages ?? 1);
      })
      .catch((loadError) => { if (!cancelled) setError(errorText(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedSlug]);

  const changeBuilding = (slug) => {
    setSelectedSlug(slug);
    setLoading(true);
    setError('');
  };

  const changePage = (nextPage) => {
    setLoading(true);
    setError('');
    loadBlocks(selectedSlug, nextPage);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const startsAt = localDateTimeToIso(form.startsAt);
      const endsAt = localDateTimeToIso(form.endsAt);
      if (!startsAt || !endsAt) throw new Error('Waktu tidak valid pada zona produk. Periksa tanggal atau perubahan waktu zona.');
      await createBuildingBlock(selectedSlug, {
        startsAt,
        endsAt,
        reason: form.reason.trim()
      });
      setNotice('Jadwal gedung berhasil diblokir.');
      setForm({ startsAt: '', endsAt: '', reason: '' });
      await loadBlocks(selectedSlug, 1);
    } catch (saveError) {
      setError(errorText(saveError));
    } finally {
      setSaving(false);
    }
  };

  const remove = (block) => {
    if (!window.confirm(`Hapus blokir jadwal ${formatDateTime(block.startsAt)}? Slot dapat kembali tersedia.`)) return;
    setSaving(true);
    setError('');
    setNotice('');
    deleteBuildingBlock(selectedSlug, block.id)
      .then(async () => { setNotice('Blokir jadwal berhasil dihapus.'); await loadBlocks(selectedSlug, page); })
      .catch((actionError) => setError(errorText(actionError)))
      .finally(() => setSaving(false));
  };

  return (
    <section aria-labelledby="schedule-block-title" className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
      <header>
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-800">Administrasi</p>
        <h2 id="schedule-block-title" className="text-xl font-bold text-slate-900">Blokir jadwal gedung</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Gunakan untuk pemeliharaan atau kegiatan yang tidak menerima booking. Backend menolak blokir yang bertabrakan dengan booking aktif.</p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
      <label className="block text-sm font-medium text-slate-700">Pilih gedung
        <select value={selectedSlug} onChange={(event) => changeBuilding(event.target.value)} disabled={buildings.length === 0} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
          {buildings.length === 0 ? <option value="">Belum ada gedung</option> : buildings.map((building) => <option key={building.id} value={building.slug}>{building.name}</option>)}
        </select>
      </label>

      <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <h3 className="font-semibold text-slate-900 sm:col-span-2">Tambah blokir jadwal</h3>
        <label className="text-sm font-medium text-slate-700">Mulai (zona waktu produk)
          <input type="datetime-local" value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="text-sm font-medium text-slate-700">Selesai (zona waktu produk)
          <input type="datetime-local" value={form.endsAt} onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Alasan
          <input value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} required minLength={3} maxLength={500} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Waktu input dan daftar blokir mengikuti zona yang disetel pada NEXT_PUBLIC_APP_TIME_ZONE (pratinjau saat ini: Asia/Jakarta). Zona operasional resmi masih perlu ditetapkan.</p>
        <button disabled={saving || !selectedSlug} className="min-h-11 w-fit rounded-lg bg-emerald-800 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan…' : 'Blokir jadwal'}</button>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">Daftar blokir</h3>
          <button type="button" onClick={() => changePage(page)} disabled={loading || !selectedSlug} className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-50">Muat ulang</button>
        </div>
        {loading ? <p role="status" className="rounded-lg bg-white p-4 text-sm text-slate-600">Memuat blokir jadwal…</p> : blocks.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Belum ada blokir untuk gedung ini.</p> : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {blocks.map((block) => <li key={block.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="font-medium text-slate-900">{block.reason}</p><p className="mt-1 text-sm text-slate-600">{formatDateTime(block.startsAt)} – {formatDateTime(block.endsAt)}</p></div>
              <button type="button" onClick={() => remove(block)} disabled={saving} className="min-h-9 rounded-lg border border-rose-300 px-3 text-sm text-rose-800 disabled:opacity-50">Hapus blokir</button>
            </li>)}
          </ul>
        )}
        {totalPages > 1 && <div className="flex items-center justify-end gap-3 text-sm">
          <button type="button" disabled={page <= 1 || loading} onClick={() => changePage(page - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:opacity-50">Sebelumnya</button>
          <span>Halaman {page} dari {totalPages}</span>
          <button type="button" disabled={page >= totalPages || loading} onClick={() => changePage(page + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:opacity-50">Berikutnya</button>
        </div>}
      </div>
    </section>
  );
}
