'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiRequestError, downloadPaymentProof, getAdminPendingPayments, rejectAdminPayment, verifyAdminPayment } from '@/lib/api-client';
import { formatDateTime } from '@/lib/formatters';

function formatAmount(amount, currency) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${amount} ${currency}`;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(value);
}

function messageFor(error) {
  if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
    return 'Akses verifier belum tersedia. Di development, gunakan NEXT_PUBLIC_DEV_USER_ID untuk user aktif dengan role PAYMENT_VERIFIER.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
}

function safeDownloadName(value) {
  const fileName = typeof value === 'string' ? value.split(/[\\/]/).pop() : '';
  return fileName?.replace(/[\x00-\x1f<>:"|?*]/g, '_') || 'bukti-pembayaran';
}

export default function PaymentPanel() {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState(null);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [proofDownloadingId, setProofDownloadingId] = useState('');
  const [proofDownloadError, setProofDownloadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmPayment, setConfirmPayment] = useState(null);
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!confirmPayment) return undefined;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    cancelRef.current?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setConfirmPayment(null);
      } else if (event.key === 'Tab') {
        const buttons = [...dialog.querySelectorAll('button:not(:disabled)')];
        if (!buttons.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    dialog?.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      dialog?.removeEventListener('keydown', handleDialogKeyDown);
      previousFocus?.focus?.();
    };
  }, [confirmPayment]);

  const refresh = useCallback(async () => {
    try {
      const result = await getAdminPendingPayments({ page, pageSize: 20 });
      if (page > 1 && result.data?.length === 0) {
        setPage(page - 1);
        return;
      }
      setPayments(result.data ?? []);
      setPageMeta(result.meta ?? null);
    } catch (loadError) {
      setError(messageFor(loadError));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    getAdminPendingPayments({ page, pageSize: 20 })
      .then((result) => { if (!cancelled) { setPayments(result.data ?? []); setPageMeta(result.meta ?? null); } })
      .catch((loadError) => { if (!cancelled) setError(messageFor(loadError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const verify = async (payment) => {
    setBusyId(payment.id);
    setError('');
    setNotice('');
    try {
      await verifyAdminPayment(payment.id, notes[payment.id]?.trim() ?? '');
      setNotice(`Pembayaran ${payment.booking.publicReference} terverifikasi; booking dikonfirmasi.`);
      await refresh();
    } catch (verifyError) {
      setError(messageFor(verifyError));
    } finally {
      setBusyId('');
    }
  };

  const reject = async (payment) => {
    const reason = notes[payment.id]?.trim() ?? '';
    if (reason.length < 3 || !window.confirm(`Tolak referensi pembayaran ${payment.booking.publicReference}?`)) return;
    setBusyId(payment.id);
    setError('');
    setNotice('');
    try {
      await rejectAdminPayment(payment.id, reason);
      setNotice(`Referensi pembayaran ${payment.booking.publicReference} ditolak; pemohon dapat mengirim referensi baru.`);
      await refresh();
    } catch (rejectError) {
      setError(messageFor(rejectError));
    } finally {
      setBusyId('');
    }
  };

  const downloadProof = async (payment) => {
    setProofDownloadingId(payment.id);
    setProofDownloadError('');
    try {
      const blob = await downloadPaymentProof(payment.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = safeDownloadName(payment.proof?.fileName);
      window.document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      setProofDownloadError(messageFor(downloadError));
    } finally {
      setProofDownloadingId('');
    }
  };

  return (
    <section aria-labelledby="payment-panel-title" className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="payment-panel-title" className="text-lg font-bold text-slate-900">Verifikasi pembayaran</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Antrean menampilkan referensi transfer yang menunggu pemeriksaan. Verifikasi mengonfirmasi booking; penolakan meminta pemohon mengirim referensi baru. Akses role PAYMENT_VERIFIER di development saja.</p>
        </div>
        <button type="button" onClick={() => { setLoading(true); setError(''); refresh(); }} disabled={loading} className="min-h-10 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Muat ulang</button>
      </header>
      {error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      {proofDownloadError && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{proofDownloadError}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {loading ? <p role="status" className="text-sm text-slate-600">Memuat antrean verifikasi…</p> : error ? null : payments.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Tidak ada pembayaran yang menunggu verifikasi.</p>
      ) : (
        <ul className="space-y-4">
          {payments.map((payment) => (
            <li key={payment.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{payment.booking.publicReference} · {payment.booking.building.name}</h3>
                  <p className="mt-1 text-sm text-slate-700">{formatAmount(payment.amount, payment.currency)}{payment.method ? ` · ${payment.method}` : ''}</p>
                  <p className="mt-1 text-xs text-slate-600">Dibuat {formatDateTime(payment.createdAt)} · Tenggat {payment.dueAt ? formatDateTime(payment.dueAt) : 'belum ditetapkan'}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950">Menunggu verifikasi</span>
              </div>
              {payment.reference && <p className="mt-3 break-all text-sm text-slate-700">Referensi: {payment.reference}</p>}
              {payment.proof ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="min-w-0 break-all">Bukti privat: {payment.proof.fileName} · {Math.ceil(payment.proof.fileSize / 1024)} KB · diunggah {formatDateTime(payment.proof.uploadedAt)}</p>
                <button type="button" onClick={() => downloadProof(payment)} disabled={Boolean(proofDownloadingId) || busyId === payment.id} className="min-h-10 font-semibold text-emerald-800 underline disabled:opacity-50">{proofDownloadingId === payment.id ? 'Mengunduh…' : 'Unduh bukti privat'}</button>
              </div> : <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">Bukti pembayaran belum diunggah. Cocokkan transfer dengan catatan resmi sebelum mengambil keputusan.</p>}
              <label className="mt-3 block text-sm font-medium text-slate-700">Catatan keputusan (minimal 3 karakter untuk penolakan)
                <textarea rows={2} maxLength={2000} value={notes[payment.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [payment.id]: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={busyId === payment.id || !(notes[payment.id]?.trim())} onClick={() => setConfirmPayment(payment)} className="min-h-10 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50">{busyId === payment.id ? 'Memproses…' : 'Verifikasi dan konfirmasi booking'}</button>
                <button type="button" disabled={busyId === payment.id || (notes[payment.id]?.trim().length ?? 0) < 3} onClick={() => reject(payment)} className="min-h-10 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50">Tolak referensi</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && pageMeta?.totalPages > 1 && <nav aria-label="Halaman antrean pembayaran" className="flex items-center justify-center gap-3">
        <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setError(''); setPage((current) => current - 1); }} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium disabled:opacity-50">Sebelumnya</button>
        <span className="text-sm text-slate-600">Halaman {pageMeta.page} dari {pageMeta.totalPages}</span>
        <button type="button" disabled={page >= pageMeta.totalPages} onClick={() => { setLoading(true); setError(''); setPage((current) => current + 1); }} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium disabled:opacity-50">Berikutnya</button>
      </nav>}
      {confirmPayment && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmPayment(null); }}>
        <section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="payment-confirm-title" aria-describedby="payment-confirm-description" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <h3 id="payment-confirm-title" className="text-lg font-bold text-slate-900">Konfirmasi verifikasi pembayaran</h3>
          <p id="payment-confirm-description" className="mt-2 text-sm leading-6 text-slate-700">Pembayaran {confirmPayment.booking.publicReference} akan ditandai terverifikasi dan booking terkait dikonfirmasi. Cocokkan transfer dengan catatan resmi BLU sebelum melanjutkan.</p>
          {!confirmPayment.proof && <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">Bukti belum diunggah. Pastikan verifikasi manual sudah dilakukan terhadap catatan resmi.</p>}
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">Catatan: {notes[confirmPayment.id]?.trim()}</p>
          <div className="mt-5 flex justify-end gap-3">
            <button ref={cancelRef} type="button" onClick={() => setConfirmPayment(null)} className="min-h-11 rounded-lg border border-slate-300 px-4 font-semibold text-slate-700">Kembali</button>
            <button type="button" disabled={busyId === confirmPayment.id} onClick={async () => { const payment = confirmPayment; setConfirmPayment(null); await verify(payment); }} className="min-h-11 rounded-lg bg-emerald-800 px-4 font-semibold text-white disabled:opacity-50">Konfirmasi verifikasi</button>
          </div>
        </section>
      </div>}
    </section>
  );
}
