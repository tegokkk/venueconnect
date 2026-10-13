'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cancelBooking, downloadPaymentProof, downloadStudentDocument, getAdminBookingDetail, getBookingDetail, getPaymentProofFileError, recordManualPayment, reviewAdminBooking, reviseStudentBooking, submitStudentBooking, uploadPaymentProof, uploadStudentDocument } from '@/lib/api-client';
import { formatBookingDate, getBookingStatusLabel } from '@/lib/booking-display';
import { formatCurrencyAmount } from '@/lib/currency-format';
import { getApiErrorState } from '@/lib/api-error-state';
import StatusBadge from '@/components/status-badge';

function formatRateSnapshot(snapshot) {
  if (!snapshot?.amount) return null;
  const price = formatCurrencyAmount(snapshot.amount, snapshot.currency);
  if (!price) return null;
  const unit = { hour: 'jam', day: 'hari', event: 'acara' }[snapshot.unit] ?? snapshot.unit;
  return `${price}${unit ? ` / ${unit}` : ''}`;
}

function safeDownloadName(value, fallback) {
  const fileName = typeof value === 'string' ? value.split(/[\\/]/).pop() : '';
  return fileName?.replace(/[\x00-\x1f<>:"|?*]/g, '_') || fallback;
}

export default function BookingDetailView({ bookingId, adminMode = false }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [selectedPaymentProof, setSelectedPaymentProof] = useState(null);
  const [paymentProofError, setPaymentProofError] = useState('');
  const [paymentProofDownloadingId, setPaymentProofDownloadingId] = useState('');
  const paymentProofInputRef = useRef(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const developmentActionsEnabled = process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_DEV_USER_ID);

  useEffect(() => {
    let cancelled = false;
    (adminMode ? getAdminBookingDetail(bookingId) : getBookingDetail(bookingId))
      .then((response) => {
        if (cancelled) return;
        if (!response.success || !response.data?.id) throw new Error('Respons detail pengajuan tidak valid.');
        setBooking(response.data);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [adminMode, bookingId, reloadKey]);

  const reload = () => {
    setLoading(true);
    setError(null);
    setReloadKey((value) => value + 1);
  };

  const handleCancel = async (event) => {
    event.preventDefault();
    if (!window.confirm('Batalkan pengajuan ini? Tindakan ini tidak dapat dibatalkan.')) return;

    setCancelling(true);
    setActionError(null);
    setActionNotice('');
    try {
      await cancelBooking(bookingId, cancelReason.trim());
      setActionNotice('Pengajuan berhasil dibatalkan.');
      setCancelReason('');
      reload();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setCancelling(false);
    }
  };

  const runAction = async (action, successMessage) => {
    setActionPending(true);
    setActionError(null);
    setActionNotice('');
    try {
      await action();
      setActionNotice(successMessage);
      reload();
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setActionPending(false);
    }
  };

  const handleDocumentUpload = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (file && (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf') || file.size === 0 || file.size > 5 * 1024 * 1024)) {
      setSelectedDocument(null);
      setActionError(new Error('Pilih satu PDF berukuran maksimal 5 MB.'));
      event.target.value = '';
      return;
    }
    setSelectedDocument(file);
    setActionError(null);
  };

  const handleDownload = async (document) => {
    setActionError(null);
    try {
      const blob = await downloadStudentDocument(bookingId, document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = safeDownloadName(document.fileName, 'berkas-mahasiswa.pdf');
      window.document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setActionError(requestError);
    }
  };

  const handlePaymentProofSelection = (event) => {
    const file = event.target.files?.[0] ?? null;
    const validationError = getPaymentProofFileError(file);
    setSelectedPaymentProof(validationError ? null : file);
    setPaymentProofError(validationError ?? '');
    if (validationError) event.target.value = '';
  };

  const handlePaymentProofDownload = async (payment) => {
    setPaymentProofDownloadingId(payment.id);
    setActionError(null);
    try {
      const blob = await downloadPaymentProof(payment.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = safeDownloadName(payment.proof?.fileName, 'bukti-pembayaran');
      window.document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setPaymentProofDownloadingId('');
    }
  };

  if (loading) {
    return <p role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">Memuat detail pengajuan…</p>;
  }

  if (error) {
    const errorState = getApiErrorState(error, 'pengajuan');
    return (
      <section role="alert" className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-slate-900">{errorState.title}</h1>
        <p className="mb-5 text-sm text-slate-600">{errorState.message}</p>
        {error.requestId && <p className="mb-4 text-xs text-slate-500">Referensi dukungan: {error.requestId}</p>}
        {errorState.canRetry && <button type="button" onClick={reload} className="mr-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Muat ulang</button>}
        <Link href={adminMode ? '/admin' : '/dashboard'} className="font-semibold text-emerald-700 hover:underline">{adminMode ? 'Kembali ke dasbor admin' : 'Kembali ke pengajuan saya'}</Link>
      </section>
    );
  }

  const rate = booking.bookingType === 'RENTAL' ? formatRateSnapshot(booking.rateSnapshot) : null;
  const history = booking.statusHistory ?? [];
  const canCancel = !adminMode && ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'].includes(booking.status);
  const canEditStudentDocument = !adminMode && booking.applicantCategory === 'MAHASISWA' && ['DRAFT', 'REVISION_REQUESTED'].includes(booking.status);
  const pendingPayment = (booking.payments ?? []).some((payment) => payment.status === 'PENDING_VERIFICATION');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link href={adminMode ? '/admin' : '/dashboard'} className="text-sm font-medium text-emerald-700 hover:underline">← {adminMode ? 'Kembali ke dasbor admin' : 'Kembali ke pengajuan saya'}</Link>
      </div>

      {adminMode && <p role="note" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Tindakan review di halaman ini hanya untuk simulasi development dengan akun ADMIN. Assignment petugas dan persetujuan institusi belum ditetapkan.</p>}

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nomor pengajuan</p>
          <p className="mb-3 font-mono text-sm font-semibold text-slate-700">{booking.publicReference}</p>
          <h1 className="text-2xl font-bold text-slate-900">{booking.eventName}</h1>
        </div>
        <StatusBadge status={booking.status} className="px-3 py-1.5 text-sm" />
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="booking-info" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 id="booking-info" className="mb-5 text-lg font-bold text-slate-900">Rincian kegiatan</h2>
          <dl className="space-y-4 text-sm">
            <div><dt className="text-slate-500">Gedung</dt><dd className="mt-1 font-medium text-slate-900">{booking.building?.name ?? 'Informasi gedung tidak tersedia'}</dd></div>
            <div><dt className="text-slate-500">Jenis pengajuan</dt><dd className="mt-1 font-medium text-slate-900">{booking.bookingType === 'RENTAL' ? 'Penyewaan luar kampus' : 'Peminjaman civitas Polinela'}</dd></div>
            <div><dt className="text-slate-500">Kategori pemohon</dt><dd className="mt-1 font-medium text-slate-900">{{ MAHASISWA: 'Mahasiswa Polinela', DOSEN_PEGAWAI: 'Dosen / pegawai Polinela', UMUM: 'Luar kampus' }[booking.applicantCategory] ?? 'Belum tersedia'}</dd></div>
            <div><dt className="text-slate-500">Mulai</dt><dd className="mt-1 font-medium text-slate-900">{formatBookingDate(booking.startsAt)}</dd></div>
            <div><dt className="text-slate-500">Selesai</dt><dd className="mt-1 font-medium text-slate-900">{formatBookingDate(booking.endsAt)}</dd></div>
            {booking.attendeeCount != null && <div><dt className="text-slate-500">Jumlah peserta</dt><dd className="mt-1 font-medium text-slate-900">{booking.attendeeCount}</dd></div>}
            {booking.eventDescription && <div><dt className="text-slate-500">Deskripsi kegiatan</dt><dd className="mt-1 whitespace-pre-line text-slate-800">{booking.eventDescription}</dd></div>}
            {rate && <div><dt className="text-slate-500">Snapshot tarif pengajuan</dt><dd className="mt-1 font-medium text-slate-900">{rate}</dd></div>}
            {booking.paymentDueAt && <div><dt className="text-slate-500">Batas pembayaran</dt><dd className="mt-1 font-medium text-slate-900">{formatBookingDate(booking.paymentDueAt)}</dd></div>}
          </dl>
        </section>

        <section aria-labelledby="booking-timeline" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 id="booking-timeline" className="mb-5 text-lg font-bold text-slate-900">Riwayat status</h2>
          {history.length ? (
            <ol className="space-y-5">
              {history.map((entry, index) => (
                <li key={`${entry.createdAt}-${index}`} className="flex gap-3">
                  <span aria-hidden="true" className={`mt-1 h-3 w-3 shrink-0 rounded-full ${index === history.length - 1 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                  <div>
                    <p className="font-semibold text-slate-900">{getBookingStatusLabel(entry.toStatus)}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatBookingDate(entry.createdAt)}</p>
                    {entry.note && <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{entry.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ) : <p className="text-sm text-slate-600">Riwayat status belum tersedia.</p>}
          {booking.status === 'AWAITING_PAYMENT' && booking.paymentDueAt && (
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Pengajuan disetujui dan menunggu pembayaran sebelum tenggat di atas.</p>
          )}
        </section>
      </div>

      {(booking.documents?.length > 0 || canEditStudentDocument) && <section aria-labelledby="booking-documents" className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 id="booking-documents" className="text-lg font-bold text-slate-900">Berkas mahasiswa</h2>
        {booking.documents?.length ? <ul className="mt-3 space-y-2">{booking.documents.map((document) => <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <span className="break-all">{document.fileName} · {Math.ceil(document.fileSize / 1024)} KB</span>
          {developmentActionsEnabled && <button type="button" onClick={() => handleDownload(document)} disabled={actionPending} className="font-semibold text-emerald-700 hover:underline disabled:opacity-50">Unduh privat</button>}
        </li>)}</ul> : <p className="mt-2 text-sm text-slate-600">Berkas belum diunggah.</p>}
        {canEditStudentDocument && developmentActionsEnabled && <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <label htmlFor="booking-document" className="block text-sm font-medium text-slate-700">{booking.documents?.length ? 'Ganti' : 'Unggah'} satu PDF maksimal 5 MB</label>
          <input id="booking-document" type="file" accept=".pdf,application/pdf" onChange={handleDocumentUpload} className="block w-full text-sm" />
          <button type="button" onClick={() => runAction(async () => { await uploadStudentDocument(bookingId, selectedDocument); setSelectedDocument(null); }, 'Berkas tersimpan.')} disabled={!selectedDocument || actionPending} className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 disabled:opacity-50">{actionPending ? 'Memproses…' : 'Simpan berkas'}</button>
        </div>}
      </section>}

      {!adminMode && developmentActionsEnabled && booking.applicantCategory === 'MAHASISWA' && booking.status === 'DRAFT' && <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Kirim draf mahasiswa</h2>
        <p className="mt-2 text-sm text-slate-600">Satu PDF wajib tersimpan sebelum pengajuan masuk antrean pemeriksaan.</p>
        <button type="button" onClick={() => runAction(() => submitStudentBooking(bookingId), 'Pengajuan terkirim untuk ditinjau.')} disabled={booking.documents?.length !== 1 || actionPending} className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">Kirim pengajuan</button>
      </section>}

      {!adminMode && developmentActionsEnabled && booking.applicantCategory === 'MAHASISWA' && booking.status === 'REVISION_REQUESTED' && <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Kirim perbaikan</h2>
        <p className="mt-2 text-sm text-slate-600">Ganti berkas di atas bila diminta, lalu kirim kembali untuk diperiksa.</p>
        <label htmlFor="revision-note" className="mt-3 block text-sm font-medium text-slate-700">Catatan perbaikan (opsional)</label>
        <textarea id="revision-note" value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} maxLength={2000} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <button type="button" onClick={() => runAction(() => reviseStudentBooking(bookingId, { note: revisionNote.trim() }), 'Perbaikan terkirim.')} disabled={booking.documents?.length !== 1 || actionPending} className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">Kirim perbaikan</button>
      </section>}

      {!adminMode && booking.bookingType === 'RENTAL' && (booking.status === 'AWAITING_PAYMENT' || (booking.payments?.length ?? 0) > 0) && <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Pembayaran sewa</h2>
        <p className="mt-2 text-sm text-slate-600">{booking.status === 'AWAITING_PAYMENT' ? 'Catat referensi transfer setelah menerima instruksi rekening resmi dari pengelola. Pencatatan ini belum memverifikasi pembayaran.' : 'Riwayat pembayaran dan bukti privat pengajuan ini.'}</p>
        {(booking.payments ?? []).map((payment) => <div key={payment.id} className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p className="break-all">Referensi {payment.reference} · {payment.status === 'FAILED' ? 'Ditolak' : payment.status === 'VERIFIED' ? 'Terverifikasi' : 'Menunggu verifikasi'}{payment.reviewNote ? ` · Catatan: ${payment.reviewNote}` : ''}</p>
          <div className="mt-3 border-t border-slate-200 pt-3">
            {payment.proof ? <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 break-all">Bukti privat: {payment.proof.fileName} · {Math.ceil(payment.proof.fileSize / 1024)} KB · diunggah {formatBookingDate(payment.proof.uploadedAt)}</p>
              {developmentActionsEnabled && <button type="button" onClick={() => handlePaymentProofDownload(payment)} disabled={Boolean(paymentProofDownloadingId) || actionPending} className="min-h-10 font-semibold text-emerald-800 underline disabled:opacity-50">{paymentProofDownloadingId === payment.id ? 'Mengunduh…' : 'Unduh bukti privat'}</button>}
            </div> : payment.status === 'PENDING_VERIFICATION' && <p className="text-amber-900">Bukti pembayaran belum diunggah. Verifikasi tetap dilakukan berdasarkan catatan resmi pengelola.</p>}
            {developmentActionsEnabled && booking.status === 'AWAITING_PAYMENT' && payment.status === 'PENDING_VERIFICATION' && <div className="mt-3 space-y-2">
              <label htmlFor={`payment-proof-${payment.id}`} className="block font-medium text-slate-800">{payment.proof ? 'Ganti' : 'Unggah'} bukti pembayaran (PDF, JPG, atau PNG; maksimal 5 MB)</label>
              <input ref={paymentProofInputRef} id={`payment-proof-${payment.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handlePaymentProofSelection} aria-invalid={Boolean(paymentProofError)} aria-describedby={paymentProofError ? `payment-proof-error-${payment.id}` : undefined} className="block w-full text-sm" />
              {paymentProofError && <p id={`payment-proof-error-${payment.id}`} role="alert" className="text-rose-800">{paymentProofError}</p>}
              <button type="button" onClick={() => runAction(async () => {
                await uploadPaymentProof(payment.id, selectedPaymentProof);
                setSelectedPaymentProof(null);
                setPaymentProofError('');
                if (paymentProofInputRef.current) paymentProofInputRef.current.value = '';
              }, 'Bukti pembayaran privat tersimpan untuk pemeriksaan verifier.')} disabled={!selectedPaymentProof || actionPending} className="min-h-10 rounded-lg border border-emerald-700 bg-white px-4 py-2 font-semibold text-emerald-800 disabled:opacity-50">{actionPending ? 'Memproses…' : payment.proof ? 'Simpan bukti pengganti' : 'Simpan bukti'}</button>
            </div>}
          </div>
        </div>)}
        {developmentActionsEnabled && booking.status === 'AWAITING_PAYMENT' && !pendingPayment && <form onSubmit={(event) => { event.preventDefault(); runAction(async () => { await recordManualPayment(bookingId, paymentReference.trim()); setPaymentReference(''); }, 'Referensi transfer tercatat dan menunggu verifikasi.'); }} className="mt-4 flex flex-wrap items-end gap-3">
          <label htmlFor="payment-reference" className="block flex-1 text-sm font-medium text-slate-700">Referensi transfer
            <input id="payment-reference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} minLength={3} maxLength={100} required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <button type="submit" disabled={actionPending || paymentReference.trim().length < 3} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">Catat referensi</button>
        </form>}
      </section>}

      {adminMode && developmentActionsEnabled && ['SUBMITTED', 'UNDER_REVIEW'].includes(booking.status) && <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Pemeriksaan pengelola (development)</h2>
        <label htmlFor="review-action" className="mt-3 block text-sm font-medium text-slate-700">Tindakan</label>
        <select id="review-action" value={reviewAction} onChange={(event) => setReviewAction(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
          <option value="">Pilih tindakan</option>
          {booking.status === 'SUBMITTED' && <option value="START_REVIEW">Mulai pemeriksaan</option>}
          {booking.status === 'UNDER_REVIEW' && booking.applicantCategory === 'MAHASISWA' && <option value="REQUEST_REVISION">Minta perbaikan</option>}
          {booking.status === 'UNDER_REVIEW' && booking.applicantCategory === 'MAHASISWA' && <option value="CONFIRM_STUDENT">Konfirmasi mahasiswa</option>}
          {booking.status === 'UNDER_REVIEW' && booking.applicantCategory !== 'MAHASISWA' && <option value="FORWARD">Teruskan ke approver</option>}
          {booking.status === 'UNDER_REVIEW' && <option value="REJECT">Tolak pengajuan</option>}
        </select>
        <label htmlFor="review-note" className="mt-3 block text-sm font-medium text-slate-700">Catatan {['REQUEST_REVISION', 'REJECT'].includes(reviewAction) ? '(wajib)' : '(opsional)'}</label>
        <textarea id="review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={2000} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <button type="button" onClick={() => runAction(async () => { await reviewAdminBooking(bookingId, reviewAction, reviewNote.trim()); setReviewAction(''); setReviewNote(''); }, 'Keputusan pemeriksaan tercatat.')} disabled={!reviewAction || (['REQUEST_REVISION', 'REJECT'].includes(reviewAction) && reviewNote.trim().length < 3) || actionPending} className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">Simpan keputusan</button>
      </section>}

      {actionNotice && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{actionNotice}</p>}
      {actionError && <div role="alert" className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
        <p>{actionError.status === 400 ? actionError.message : getApiErrorState(actionError, 'pengajuan').message}</p>
        {actionError.requestId && <p className="mt-1 text-xs">Referensi dukungan: {actionError.requestId}</p>}
        {actionError.status === 409 && <button type="button" onClick={reload} className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-2 font-semibold hover:bg-rose-100">Muat status terbaru</button>}
      </div>}

      {canCancel && (
        <section aria-labelledby="requester-actions" className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 id="requester-actions" className="text-lg font-bold text-slate-900">Tindakan pengajuan</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Pengajuan dapat dibatalkan sebelum masuk tahap persetujuan atau pembayaran.</p>
          <form onSubmit={handleCancel} className="mt-4 space-y-3">
            <label htmlFor="cancellation-reason" className="block text-sm font-medium text-slate-700">Alasan pembatalan (opsional)
              <textarea id="cancellation-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} maxLength={500} rows={2} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <button type="submit" disabled={cancelling} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
              {cancelling ? 'Membatalkan…' : 'Batalkan pengajuan'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
