'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ApiRequestError,
  attachFacilityToBuilding,
  deleteFacility,
  detachFacilityFromBuilding,
  getAdminBuildings,
  getFacilities,
  saveFacility,
  updateBuildingFacility
} from '@/lib/api-client';

const emptyFacility = { name: '', description: '' };

function errorText(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Akses admin belum tersedia. Isi NEXT_PUBLIC_DEV_USER_ID dengan UUID user aktif ber-role ADMIN di development.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
}

export default function FacilitiesPanel() {
  const [facilities, setFacilities] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [facilityForm, setFacilityForm] = useState(emptyFacility);
  const [editingId, setEditingId] = useState(null);
  const [attachId, setAttachId] = useState('');
  const [attachDetail, setAttachDetail] = useState('');
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [facilityResult, buildingResult] = await Promise.all([getFacilities(), getAdminBuildings()]);
      const nextBuildings = buildingResult.data ?? [];
      setFacilities(facilityResult.data ?? []);
      setBuildings(nextBuildings);
      setSelectedSlug((current) => nextBuildings.some((building) => building.slug === current)
        ? current
        : nextBuildings[0]?.slug || '');
    } catch (loadError) {
      setError(errorText(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getFacilities(), getAdminBuildings()])
      .then(([facilityResult, buildingResult]) => {
        if (cancelled) return;
        const nextBuildings = buildingResult.data ?? [];
        setFacilities(facilityResult.data ?? []);
        setBuildings(nextBuildings);
        setSelectedSlug((current) => nextBuildings.some((building) => building.slug === current)
          ? current
          : nextBuildings[0]?.slug || '');
      })
      .catch((loadError) => { if (!cancelled) setError(errorText(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const selectedBuilding = buildings.find((building) => building.slug === selectedSlug);
  const attachedIds = new Set((selectedBuilding?.facilities ?? []).map(({ facility }) => facility.id));
  const availableFacilities = facilities.filter(({ id }) => !attachedIds.has(id));

  const saveMaster = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await saveFacility({ name: facilityForm.name.trim(), description: facilityForm.description.trim() || null }, editingId);
      setNotice(editingId ? 'Fasilitas berhasil diperbarui.' : 'Fasilitas berhasil ditambahkan.');
      setFacilityForm(emptyFacility);
      setEditingId(null);
      await refresh();
    } catch (saveError) {
      setError(errorText(saveError));
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action, successMessage) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      await refresh();
    } catch (actionError) {
      setError(errorText(actionError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="facility-admin-title" className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
      <header>
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-800">Administrasi</p>
        <h2 id="facility-admin-title" className="text-xl font-bold text-slate-900">Kelola fasilitas</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Atur master fasilitas dan fasilitas yang tersedia di setiap gedung.</p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

      <form onSubmit={saveMaster} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <h3 className="font-semibold text-slate-900 sm:col-span-2">{editingId ? 'Ubah fasilitas' : 'Tambah master fasilitas'}</h3>
        <label className="text-sm font-medium text-slate-700">Nama fasilitas
          <input value={facilityForm.name} onChange={(event) => setFacilityForm((current) => ({ ...current, name: event.target.value }))} required maxLength={100} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="text-sm font-medium text-slate-700">Deskripsi
          <input value={facilityForm.description} onChange={(event) => setFacilityForm((current) => ({ ...current, description: event.target.value }))} maxLength={1000} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button disabled={saving} className="min-h-10 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Menyimpan…' : editingId ? 'Simpan fasilitas' : 'Tambah fasilitas'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setFacilityForm(emptyFacility); }} className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm">Batal</button>}
        </div>
      </form>

      {loading ? <p role="status" className="rounded-lg bg-white p-4 text-sm text-slate-600">Memuat data fasilitas…</p> : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            {facilities.length === 0 ? <p className="p-4 text-sm text-slate-600">Belum ada master fasilitas.</p> : (
              <ul className="divide-y divide-slate-100">
                {facilities.map((facility) => (
                  <li key={facility.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div><p className="font-semibold text-slate-900">{facility.name}</p><p className="mt-1 text-sm text-slate-600">{facility.description || 'Tanpa deskripsi'}</p></div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingId(facility.id); setFacilityForm({ name: facility.name, description: facility.description ?? '' }); }} className="min-h-9 rounded-lg border border-slate-300 px-3 text-sm">Ubah</button>
                      <button type="button" disabled={saving} onClick={() => { if (window.confirm(`Hapus fasilitas “${facility.name}”? Fasilitas yang masih terpasang harus dilepas dahulu.`)) runAction(() => deleteFacility(facility.id), 'Fasilitas berhasil dihapus.'); }} className="min-h-9 rounded-lg border border-rose-300 px-3 text-sm text-rose-800 disabled:opacity-50">Hapus</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">Fasilitas per gedung</h3>
            {buildings.length === 0 ? <p className="text-sm text-slate-600">Tambahkan gedung terlebih dahulu.</p> : <>
              <label className="block text-sm font-medium text-slate-700">Pilih gedung
                <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                  {buildings.map((building) => <option key={building.id} value={building.slug}>{building.name}</option>)}
                </select>
              </label>
              <form onSubmit={(event) => { event.preventDefault(); if (!attachId) return; runAction(() => attachFacilityToBuilding(selectedSlug, { facilityId: attachId, detail: attachDetail.trim() || null }), 'Fasilitas berhasil dipasang ke gedung.'); setAttachId(''); setAttachDetail(''); }} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm font-medium text-slate-700">Master fasilitas
                  <select value={attachId} onChange={(event) => setAttachId(event.target.value)} required disabled={availableFacilities.length === 0} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                    <option value="">{availableFacilities.length ? 'Pilih fasilitas' : 'Semua fasilitas sudah terpasang'}</option>
                    {availableFacilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">Detail untuk gedung (opsional)
                  <input value={attachDetail} onChange={(event) => setAttachDetail(event.target.value)} maxLength={500} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" />
                </label>
                <button disabled={saving || !attachId} className="min-h-11 self-end rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Pasang</button>
              </form>
              {(selectedBuilding?.facilities ?? []).length === 0 ? <p className="text-sm text-slate-600">Belum ada fasilitas terpasang.</p> : <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {selectedBuilding.facilities.map(({ facility, detail }) => <li key={facility.id} className="flex flex-wrap items-center gap-3 p-3">
                  <div className="min-w-40 flex-1"><p className="font-medium text-slate-900">{facility.name}</p><p className="text-sm text-slate-600">{detail || 'Tanpa detail khusus'}</p></div>
                  <input aria-label={`Detail ${facility.name}`} value={details[facility.id] ?? detail ?? ''} onChange={(event) => setDetails((current) => ({ ...current, [facility.id]: event.target.value }))} maxLength={500} placeholder="Detail gedung" className="min-h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm" />
                  <button type="button" disabled={saving} onClick={() => runAction(() => updateBuildingFacility(selectedSlug, facility.id, details[facility.id] ?? detail ?? ''), 'Detail fasilitas diperbarui.')} className="min-h-9 rounded-lg border border-slate-300 px-3 text-sm disabled:opacity-50">Simpan detail</button>
                  <button type="button" disabled={saving} onClick={() => runAction(() => detachFacilityFromBuilding(selectedSlug, facility.id), 'Fasilitas dilepas dari gedung.')} className="min-h-9 rounded-lg border border-rose-300 px-3 text-sm text-rose-800 disabled:opacity-50">Lepas</button>
                </li>)}
              </ul>}
            </>}
          </div>
        </>
      )}
      <button type="button" onClick={refresh} disabled={loading} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 disabled:opacity-50">Muat ulang fasilitas</button>
    </section>
  );
}
