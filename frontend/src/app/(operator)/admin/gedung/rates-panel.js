'use client';

import { useEffect, useState } from 'react';
import { ApiRequestError, createAdminBuildingRate, getAdminBuildingRates, getAdminBuildings, updateAdminBuildingRate } from '@/lib/api-client';
import { formatCurrencyAmount } from '@/lib/currency-format';
import { formatDate, instantToLocalDateTime, localDateTimeToIso } from '@/lib/formatters';

const emptyForm = { name: '', audienceType: '', amount: '', unit: '', validFrom: '', validUntil: '', isBookable: false, maxDurationMinutes: '' };

function errorText(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Akses admin belum tersedia. Di development, isi NEXT_PUBLIC_DEV_USER_ID dengan UUID user aktif ber-role ADMIN.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
}

function dateLabel(value) {
  return value ? formatDate(value) : 'Tanpa tanggal akhir';
}

export default function RatesPanel() {
  const [buildings, setBuildings] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    getAdminBuildings()
      .then((result) => {
        if (cancelled) return;
        const nextBuildings = result.data ?? [];
        setBuildings(nextBuildings);
        setSelectedSlug(nextBuildings[0]?.slug ?? '');
        if (!nextBuildings.length) setLoading(false);
      })
      .catch((loadError) => { if (!cancelled) { setError(errorText(loadError)); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedSlug) return undefined;
    let cancelled = false;
    getAdminBuildingRates(selectedSlug, { page })
      .then((result) => {
        if (cancelled) return;
        setRates(result.data ?? []);
        setPage(result.meta?.page ?? page);
        setTotalPages(result.meta?.totalPages ?? 1);
      })
      .catch((loadError) => { if (!cancelled) setError(errorText(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedSlug, page]);

  const refreshRates = async () => {
    if (!selectedSlug) return;
    try {
      const result = await getAdminBuildingRates(selectedSlug, { page });
      setRates(result.data ?? []);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch (loadError) {
      setError(errorText(loadError));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const validFrom = localDateTimeToIso(form.validFrom);
    const validUntil = form.validUntil ? localDateTimeToIso(form.validUntil) : null;
    if (!validFrom || (form.validUntil && !validUntil)) {
      setError('Waktu tarif tidak valid pada zona produk. Periksa tanggal atau perubahan waktu zona.');
      setSaving(false);
      return;
    }
    const data = {
      name: form.name.trim(),
      audienceType: form.audienceType,
      amount: form.amount,
      currency: 'IDR',
      unit: form.unit.trim(),
      validFrom,
      validUntil,
      isBookable: form.isBookable,
      maxDurationMinutes: form.maxDurationMinutes === '' ? null : Number(form.maxDurationMinutes)
    };
    try {
      if (editingId) await updateAdminBuildingRate(selectedSlug, editingId, data);
      else await createAdminBuildingRate(selectedSlug, data);
      setNotice(editingId ? 'Tarif berhasil diperbarui.' : 'Tarif berhasil ditambahkan. Pastikan nilainya telah disahkan sebelum dipublikasikan.');
      setForm(emptyForm);
      setEditingId(null);
      setPage(1);
      const result = await getAdminBuildingRates(selectedSlug, { page: 1 });
      setRates(result.data ?? []);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch (saveError) {
      setError(errorText(saveError));
    } finally {
      setSaving(false);
    }
  };

  const edit = (rate) => {
    setEditingId(rate.id);
    setForm({
      name: rate.name ?? 'Tarif gedung',
      audienceType: rate.audienceType,
      amount: rate.amount,
      unit: rate.unit,
      validFrom: instantToLocalDateTime(rate.validFrom),
      validUntil: rate.validUntil ? instantToLocalDateTime(rate.validUntil) : '',
      isBookable: rate.isBookable,
      maxDurationMinutes: rate.maxDurationMinutes == null ? '' : String(rate.maxDurationMinutes)
    });
    setError('');
    setNotice('');
  };

  const deactivate = async (rate) => {
    if (!window.confirm('Nonaktifkan tarif ini? Snapshot booking yang sudah tercatat tetap dipertahankan.')) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await updateAdminBuildingRate(selectedSlug, rate.id, { isActive: false });
      setNotice('Tarif berhasil dinonaktifkan.');
      await refreshRates();
    } catch (actionError) {
      setError(errorText(actionError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="rate-admin-title" className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
      <header>
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-800">Administrasi</p>
        <h2 id="rate-admin-title" className="text-xl font-bold text-slate-900">Kelola tarif gedung</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Masukkan hanya tarif dan periode berlaku yang sudah disahkan. Hanya tarif kategori Eksternal yang tampil di katalog publik dan dipakai untuk pengajuan sewa luar kampus. Kategori Internal/Semua tetap tercatat untuk administrasi lama, tetapi tidak dipakai pada peminjaman. Akses saat ini terbatas untuk development admin.</p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

      {buildings.length === 0 && !loading ? <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">Tambahkan gedung sebelum mengelola tarif.</p> : <>
        <label className="block text-sm font-medium text-slate-700">Pilih gedung
          <select value={selectedSlug} onChange={(event) => { setLoading(true); setError(''); setPage(1); setSelectedSlug(event.target.value); }} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
            {buildings.map((building) => <option key={building.id} value={building.slug}>{building.name}</option>)}
          </select>
        </label>

        <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <h3 className="font-semibold text-slate-900 sm:col-span-2">{editingId ? 'Ubah tarif' : 'Tambah tarif yang disahkan'}</h3>
          <label className="text-sm font-medium text-slate-700">Nama tarif
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required maxLength={100} placeholder="Contoh: Tarif penggunaan aula" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium text-slate-700">Kategori pemohon
            <select value={form.audienceType} onChange={(event) => setForm((current) => ({ ...current, audienceType: event.target.value }))} required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
              <option value="">Pilih kategori</option><option value="EXTERNAL">Eksternal · sewa luar kampus</option><option value="INTERNAL">Internal · administrasi saja</option><option value="ALL">Semua · administrasi lama saja</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Nominal (IDR)
            <input type="number" min="0" max="9999999999.99" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium text-slate-700">Satuan tarif
            <input value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} required maxLength={50} placeholder="Satuan dari keputusan resmi" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium text-slate-700">Berlaku mulai
            <input type="datetime-local" value={form.validFrom} onChange={(event) => setForm((current) => ({ ...current, validFrom: event.target.value }))} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium text-slate-700">Berlaku sampai (opsional)
            <input type="datetime-local" value={form.validUntil} onChange={(event) => setForm((current) => ({ ...current, validUntil: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isBookable} onChange={(event) => setForm((current) => ({ ...current, isBookable: event.target.checked }))} className="h-4 w-4 accent-emerald-700" />Dapat dipakai untuk tagihan sewa otomatis</label>
          <label className="text-sm font-medium text-slate-700">Durasi maksimum (menit, opsional)
            <input type="number" min="1" step="1" value={form.maxDurationMinutes} onChange={(event) => setForm((current) => ({ ...current, maxDurationMinutes: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </label>
          <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Centang tagihan otomatis hanya untuk tarif tetap dengan ruang fisik dan batas durasi yang jelas; tarif per orang/jam/minggu/bulan atau komponen tambahan tetap informasi sampai rumusnya disahkan. Tanggal memakai NEXT_PUBLIC_APP_TIME_ZONE (pratinjau: Asia/Jakarta). Sistem menolak tarif bernama sama atau dua tarif bookable yang tumpang tindih.</p>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" disabled={saving || !selectedSlug} className="min-h-10 rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Tambah tarif'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="min-h-10 rounded-lg border border-slate-300 px-4 py-2">Batal</button>}
          </div>
        </form>

        {loading ? <p role="status" className="rounded-lg bg-white p-4 text-sm text-slate-600">Memuat tarif…</p> : rates.length === 0 ? <p role="status" className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Belum ada tarif tersimpan untuk gedung ini.</p> : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {rates.map((rate) => <li key={rate.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-slate-900">{rate.name} · {formatCurrencyAmount(rate.amount, rate.currency) ?? 'Nominal tidak valid'} · {rate.unit}</p>
                <p className="mt-1 text-sm text-slate-600">{rate.audienceType} · {dateLabel(rate.validFrom)} – {dateLabel(rate.validUntil)} · {rate.isBookable ? 'Tagihan otomatis' : 'Informasi harga saja'}</p>
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${rate.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-800'}`}>{rate.isActive ? 'Aktif' : 'Nonaktif'}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => edit(rate)} disabled={saving} className="min-h-9 rounded-lg border border-slate-300 px-3 text-sm">Ubah</button>
                {rate.isActive && <button type="button" onClick={() => deactivate(rate)} disabled={saving} className="min-h-9 rounded-lg border border-rose-300 px-3 text-sm text-rose-800 disabled:opacity-50">Nonaktifkan</button>}
              </div>
            </li>)}
          </ul>
        )}
        {totalPages > 1 && <div className="flex items-center justify-end gap-3 text-sm">
          <button type="button" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage((current) => current - 1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:opacity-50">Sebelumnya</button>
          <span>Halaman {page} dari {totalPages}</span>
          <button type="button" disabled={page >= totalPages || loading} onClick={() => { setLoading(true); setPage((current) => current + 1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:opacity-50">Berikutnya</button>
        </div>}
      </>}
    </section>
  );
}
