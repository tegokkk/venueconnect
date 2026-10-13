'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiRequestError, createBuilding, getAdminBuildings, updateBuilding } from '@/lib/api-client';
import FacilitiesPanel from './facilities-panel';
import BlocksPanel from './blocks-panel';
import RatesPanel from './rates-panel';
import UsagePanel from './usage-panel';
import UsageHistoryPanel from './usage-history-panel';

const emptyForm = {
  slug: '',
  name: '',
  description: '',
  location: '',
  capacity: '',
  termsAndConditions: '',
  termsApprovalReference: '',
  publishTerms: false,
  isActive: false,
  internalLoanEnabled: false,
  publicRentalEnabled: false
};

function getErrorMessage(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Akses admin belum tersedia. Di development, isi NEXT_PUBLIC_DEV_USER_ID dengan UUID user aktif yang memiliki role ADMIN.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
}

export default function ManageBuildingsPage() {
  const [buildings, setBuildings] = useState([]);
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingSlug, setEditingSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadBuildings = useCallback(async () => {
    try {
      const result = await getAdminBuildings({ page, pageSize: 12 });
      setBuildings(result.data ?? []);
      setPageMeta(result.meta ?? null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    getAdminBuildings({ page, pageSize: 12 })
      .then((result) => { if (!cancelled) { setBuildings(result.data ?? []); setPageMeta(result.meta ?? null); } })
      .catch((loadError) => { if (!cancelled) setError(getErrorMessage(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'termsAndConditions' || name === 'termsApprovalReference' ? { publishTerms: false } : {})
    }));
  };

  const editBuilding = (building) => {
    setEditingSlug(building.slug);
    setForm({
      slug: building.slug,
      name: building.name,
      description: building.description ?? '',
      location: building.location ?? '',
      capacity: building.capacity == null ? '' : String(building.capacity),
      termsAndConditions: building.termsAndConditions ?? '',
      termsApprovalReference: building.termsApprovalReference ?? '',
      publishTerms: Boolean(building.termsPublishedAt),
      isActive: building.isActive,
      internalLoanEnabled: building.internalLoanEnabled,
      publicRentalEnabled: building.publicRentalEnabled
    });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingSlug(null);
    setForm(emptyForm);
    setError('');
    setNotice('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const data = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      capacity: form.capacity === '' ? null : Number(form.capacity),
      isActive: form.isActive,
      internalLoanEnabled: form.internalLoanEnabled,
      publicRentalEnabled: form.publicRentalEnabled
    };
    if (editingSlug) {
      data.termsAndConditions = form.termsAndConditions.trim() || null;
      data.termsApprovalReference = form.termsApprovalReference.trim() || null;
      data.publishTerms = form.publishTerms;
    }

    try {
      if (editingSlug) {
        await updateBuilding(editingSlug, data);
        setNotice('Data gedung berhasil diperbarui.');
      } else {
        await createBuilding(data);
        setNotice('Gedung berhasil ditambahkan.');
      }
      setEditingSlug(null);
      setForm(emptyForm);
      await loadBuildings();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-800">Administrasi</p>
        <h1 className="text-2xl font-bold text-slate-900">Kelola gedung</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Atur informasi publik, kapasitas, status aktif, izin sewa, dan draf syarat penggunaan. Menonaktifkan gedung tidak membatalkan pengajuan yang sudah ada.</p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

      <section aria-labelledby="building-form-title" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 id="building-form-title" className="mb-5 text-lg font-bold text-slate-900">{editingSlug ? 'Ubah data gedung' : 'Tambah gedung'}</h2>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="building-slug" className="mb-1 block text-sm font-medium text-slate-700">Slug URL</label>
            <input id="building-slug" name="slug" value={form.slug} onChange={updateField} required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Gunakan huruf kecil, angka, dan tanda hubung." className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </div>
          <div>
            <label htmlFor="building-name" className="mb-1 block text-sm font-medium text-slate-700">Nama gedung</label>
            <input id="building-name" name="name" value={form.name} onChange={updateField} required maxLength={120} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </div>
          <div>
            <label htmlFor="building-location" className="mb-1 block text-sm font-medium text-slate-700">Lokasi</label>
            <input id="building-location" name="location" value={form.location} onChange={updateField} maxLength={200} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </div>
          <div>
            <label htmlFor="building-capacity" className="mb-1 block text-sm font-medium text-slate-700">Kapasitas (orang)</label>
            <input id="building-capacity" name="capacity" type="number" min="1" step="1" value={form.capacity} onChange={updateField} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="building-description" className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea id="building-description" name="description" value={form.description} onChange={updateField} rows={3} maxLength={2000} className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          </div>
          {editingSlug && <fieldset className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <legend className="px-1 text-sm font-semibold text-slate-800">Syarat penggunaan gedung</legend>
            <div>
              <label htmlFor="building-terms" className="mb-1 block text-sm font-medium text-slate-700">Teks syarat</label>
              <textarea id="building-terms" name="termsAndConditions" value={form.termsAndConditions} onChange={updateField} rows={7} maxLength={10000} aria-describedby="building-terms-help" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5" />
              <p id="building-terms-help" className="mt-1 text-xs text-slate-600">Teks tersimpan sebagai draf privat sampai diterbitkan. Jangan isi syarat yang belum dikonfirmasi pemilik proses.</p>
            </div>
            <div>
              <label htmlFor="building-approval-reference" className="mb-1 block text-sm font-medium text-slate-700">Referensi pengesahan resmi</label>
              <input id="building-approval-reference" name="termsApprovalReference" value={form.termsApprovalReference} onChange={updateField} maxLength={160} placeholder="Nomor keputusan atau dokumen persetujuan" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5" />
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-800">
              <input type="checkbox" name="publishTerms" checked={form.publishTerms} onChange={updateField} disabled={!form.termsAndConditions.trim() || !form.termsApprovalReference.trim()} className="mt-1 h-4 w-4 accent-emerald-700" />
              Terbitkan di detail gedung setelah syarat dan referensinya disahkan
            </label>
            <p className="text-xs text-slate-600">Mengubah teks atau referensi akan melepas status terbit sampai dicentang kembali. Konten yang terbit hanya tersedia pada pratinjau development.</p>
          </fieldset>}
          <fieldset className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-slate-700">Visibilitas dan pemakaian</legend>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={updateField} className="h-4 w-4 accent-emerald-700" />
              Tampilkan sebagai gedung aktif
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input type="checkbox" name="internalLoanEnabled" checked={form.internalLoanEnabled} onChange={updateField} className="h-4 w-4 accent-emerald-700" />
              Izinkan peminjaman civitas Polinela
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input type="checkbox" name="publicRentalEnabled" checked={form.publicRentalEnabled} onChange={updateField} className="h-4 w-4 accent-emerald-700" />
              Izinkan permohonan sewa luar kampus
            </label>
          </fieldset>
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4 sm:col-span-2">
            <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-emerald-800 px-5 py-2.5 font-semibold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">
              {saving ? 'Menyimpan…' : editingSlug ? 'Simpan perubahan' : 'Tambah gedung'}
            </button>
            {editingSlug && <button type="button" onClick={resetForm} className="min-h-11 rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">Batal ubah</button>}
          </div>
        </form>
      </section>

      <section aria-labelledby="building-list-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="building-list-title" className="text-lg font-bold text-slate-900">Daftar gedung</h2>
          <button type="button" onClick={() => { setLoading(true); setError(''); loadBuildings(); }} disabled={loading} className="min-h-10 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Muat ulang</button>
        </div>
        {loading ? <p role="status" className="rounded-lg bg-white p-5 text-sm text-slate-600">Memuat daftar gedung…</p> : buildings.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Belum ada data gedung.</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {buildings.map((building) => (
              <li key={building.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{building.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{building.slug}{building.location ? ` · ${building.location}` : ''}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${building.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-800'}`}>{building.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">Kapasitas: {building.capacity ?? 'Belum ditentukan'} · Fasilitas: {building.facilities?.length ?? 0} · Tarif tersimpan: {building.rates?.length ?? 0}</p>
                <p className="mt-1 text-sm text-slate-600">Peminjaman: {building.internalLoanEnabled ? 'Diizinkan' : 'Tidak diizinkan'} · Sewa luar kampus: {building.publicRentalEnabled ? 'Diizinkan' : 'Tidak diizinkan'}</p>
                <p className="mt-1 text-sm text-slate-600">Syarat: {building.termsPublishedAt ? 'Terbit' : building.termsAndConditions ? 'Draf privat' : 'Belum diisi'}</p>
                <button type="button" onClick={() => editBuilding(building)} className="mt-4 min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Ubah</button>
              </li>
            ))}
          </ul>
        )}
        {!loading && pageMeta?.totalPages > 1 && <nav aria-label="Halaman daftar gedung admin" className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <button type="button" onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }} disabled={page <= 1} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium disabled:opacity-50">Sebelumnya</button>
          <span className="text-sm text-slate-600">Halaman {pageMeta.page} dari {pageMeta.totalPages}</span>
          <button type="button" onClick={() => { setLoading(true); setPage((current) => Math.min(pageMeta.totalPages, current + 1)); }} disabled={page >= pageMeta.totalPages} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium disabled:opacity-50">Berikutnya</button>
        </nav>}
      </section>

      <FacilitiesPanel />
      <RatesPanel />
      <BlocksPanel />
      <UsagePanel mode="completion" />
      <UsageHistoryPanel />
    </div>
  );
}
