'use client';

import { useEffect, useState } from 'react';
import { ApiRequestError, decideApproval, getMyPendingApprovals } from '@/lib/api-client';
import { formatBookingDate } from '@/lib/booking-display';

function errorMessage(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Akses approver belum tersedia. Di development, gunakan akun uji aktif dengan role APPROVER atau ADMIN.';
  }
  return error instanceof Error ? error.message : 'Antrean persetujuan belum dapat dimuat.';
}

export default function ApprovalQueuePage() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [steps, setSteps] = useState([]);
  const [meta, setMeta] = useState(null);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const developmentActionsEnabled = process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_DEV_USER_ID);

  useEffect(() => {
    let cancelled = false;
    getMyPendingApprovals({ page, pageSize: 20 })
      .then((response) => {
        if (cancelled) return;
        if (!Array.isArray(response.data)) throw new Error('Respons antrean persetujuan tidak valid.');
        setSteps(response.data);
        setMeta(response.meta ?? null);
      })
      .catch((requestError) => { if (!cancelled) setError(errorMessage(requestError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, reloadKey]);

  const reload = () => {
    setLoading(true);
    setError('');
    setReloadKey((value) => value + 1);
  };

  const decide = async (step, decision) => {
    const note = notes[step.id]?.trim() ?? '';
    if (decision === 'REJECT' && note.length < 3) {
      setError('Alasan penolakan minimal tiga karakter.');
      return;
    }
    if (!window.confirm(`${decision === 'REJECT' ? 'Tolak' : 'Setujui'} pengajuan ${step.booking.publicReference}?`)) return;
    setBusyId(step.id);
    setError('');
    setNotice('');
    try {
      await decideApproval(step.booking.id, decision, note);
      setNotice(`Keputusan untuk ${step.booking.publicReference} tercatat.`);
      reload();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusyId('');
    }
  };

  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Antrean persetujuan</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Langkah yang ditugaskan kepada akun atau role approver ini muncul di sini; ADMIN development juga dapat melihat antrean sebagai override. Rute jabatan dan delegasi resmi belum ditetapkan; gunakan data uji saja.</p>
      <button type="button" onClick={reload} disabled={loading} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Muat ulang</button>
    </header>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
    {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}
    {loading ? <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-600">Memuat antrean persetujuan…</p> : error ? null : steps.length === 0 ? <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-600">Tidak ada pengajuan yang menunggu keputusan Anda.</p> : <ul className="space-y-4">
      {steps.map((step) => <li key={step.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-mono text-sm font-semibold text-slate-900">{step.booking.publicReference}</p>
        <h2 className="mt-2 text-lg font-bold text-slate-900">{step.booking.eventName}</h2>
        <p className="mt-1 text-sm text-slate-700">{step.booking.building.name} · {{ UMUM: 'Penyewaan luar kampus', DOSEN_PEGAWAI: 'Peminjaman dosen / pegawai Polinela' }[step.booking.applicantCategory] ?? 'Kategori belum tersedia'}</p>
        <p className="mt-1 text-sm text-slate-600">{formatBookingDate(step.booking.startsAt)} – {formatBookingDate(step.booking.endsAt)}</p>
        {developmentActionsEnabled && <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <label htmlFor={`approval-note-${step.id}`} className="block text-sm font-medium text-slate-700">Catatan keputusan; alasan penolakan wajib</label>
          <textarea id={`approval-note-${step.id}`} value={notes[step.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [step.id]: event.target.value }))} maxLength={2000} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => decide(step, 'APPROVE')} disabled={busyId === step.id} className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Setujui</button>
            <button type="button" onClick={() => decide(step, 'REJECT')} disabled={busyId === step.id || (notes[step.id]?.trim().length ?? 0) < 3} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800 disabled:opacity-50">Tolak</button>
          </div>
        </div>}
      </li>)}
    </ul>}
    {meta?.totalPages > 1 && <nav aria-label="Halaman persetujuan" className="flex items-center justify-center gap-3">
      <button type="button" onClick={() => { setLoading(true); setError(''); setPage((value) => Math.max(1, value - 1)); }} disabled={page <= 1 || loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Sebelumnya</button>
      <span className="text-sm text-slate-600">Halaman {page} dari {meta.totalPages}</span>
      <button type="button" onClick={() => { setLoading(true); setError(''); setPage((value) => Math.min(meta.totalPages, value + 1)); }} disabled={page >= meta.totalPages || loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Berikutnya</button>
    </nav>}
  </div>;
}
