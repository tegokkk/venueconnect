'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDateTime, localDateTimeToIso } from '@/lib/formatters';
import { formatCurrencyAmount } from '@/lib/currency-format';
import { createBooking, submitStudentBooking, uploadStudentDocument } from '@/lib/api-client';
import { getApiErrorState } from '@/lib/api-error-state';

const applicantTypes = [
  { value: 'MAHASISWA', label: 'Mahasiswa Polinela' },
  { value: 'DOSEN_PEGAWAI', label: 'Dosen / pegawai Polinela' },
  { value: 'UMUM', label: 'Luar kampus (sewa)' }
];

export default function BookingWizard({ building, purpose }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [applicantType, setApplicantType] = useState(purpose === 'rental' ? 'UMUM' : 'MAHASISWA');
  const [documentName, setDocumentName] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [requestedFacilityIds, setRequestedFacilityIds] = useState([]);
  const [confirmedDetails, setConfirmedDetails] = useState(false);
  const [form, setForm] = useState({
    eventName: '',
    eventDescription: '',
    startsAt: '',
    endsAt: '',
    attendeeCount: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const stepHeadingRef = useRef(null);
  const initialStepRef = useRef(true);
  const developmentSubmissionEnabled = process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_DEV_USER_ID);
  const rentalRate = building.rates?.find((rate) => rate.audienceType === 'EXTERNAL' && rate.isBookable);
  const canSubmitForPurpose = purpose === 'loan' || Boolean(rentalRate);

  useEffect(() => {
    if (initialStepRef.current) {
      initialStepRef.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  const handleSubmit = async () => {
    if (!confirmedDetails || submitting || !developmentSubmissionEnabled || !canSubmitForPurpose) return;
    if (applicantType === 'MAHASISWA' && !documentFile) {
      setError('Pilih satu PDF mahasiswa sebelum mengirim pengajuan.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = draftId
        ? { data: { id: draftId } }
        : await createBooking({
          buildingId: building.id,
          bookingType: applicantType === 'UMUM' ? 'RENTAL' : 'INTERNAL',
          applicantCategory: applicantType,
          eventName: form.eventName.trim(),
          eventDescription: form.eventDescription.trim(),
          startsAt: localDateTimeToIso(form.startsAt),
          endsAt: localDateTimeToIso(form.endsAt),
          ...(form.attendeeCount ? { attendeeCount: Number(form.attendeeCount) } : {})
        });
      const id = response.data?.id;
      if (!id) throw new Error('Respons pembuatan pengajuan tidak valid.');
      if (applicantType === 'MAHASISWA') {
        setDraftId(id);
        await uploadStudentDocument(id, documentFile);
        await submitStudentBooking(id);
      }
      router.push(`/akun/pengajuan/${encodeURIComponent(id)}/konfirmasi`);
    } catch (requestError) {
      const state = getApiErrorState(requestError, 'pengajuan');
      setError(requestError.status === 409 || requestError.status === 410
        ? `${state.message} Periksa jadwal dan rincian sebelum mengirim lagi.`
        : requestError.status === 401 || requestError.status === 403 || requestError.status === 429
          ? state.message
          : requestError.message || 'Pengajuan belum berhasil dikirim.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }));
    setError('');
  };

  const continueFromApplicant = () => {
    if (applicantType === 'MAHASISWA' && !documentName) {
      setError('Berkas peminjaman gedung wajib disiapkan untuk pengajuan mahasiswa.');
      document.getElementById('student-document')?.focus();
      return;
    }
    setError('');
    setStep(2);
  };

  const continueFromEvent = () => {
    const nextErrors = {};
    if (form.eventName.trim().length < 3 || form.eventName.length > 100) {
      nextErrors.eventName = 'Nama kegiatan harus berisi 3 sampai 100 karakter.';
    }
    if (form.eventDescription.length > 2000) {
      nextErrors.eventDescription = 'Deskripsi kegiatan maksimal 2.000 karakter.';
    }
    const startsAtIso = localDateTimeToIso(form.startsAt);
    const endsAtIso = localDateTimeToIso(form.endsAt);
    const startsAt = startsAtIso ? Date.parse(startsAtIso) : NaN;
    const endsAt = endsAtIso ? Date.parse(endsAtIso) : NaN;
    if (!Number.isFinite(startsAt) || startsAt <= Date.now()) {
      nextErrors.startsAt = 'Pilih waktu mulai yang valid dan belum lewat.';
    }
    if (!Number.isFinite(endsAt) || !Number.isFinite(startsAt) || endsAt <= startsAt) {
      nextErrors.endsAt = 'Waktu selesai harus setelah waktu mulai.';
    }
    if (form.attendeeCount && (!Number.isInteger(Number(form.attendeeCount)) || Number(form.attendeeCount) < 1)) {
      nextErrors.attendeeCount = 'Jumlah peserta harus berupa bilangan bulat positif.';
    } else if (form.attendeeCount && building.capacity != null && Number(form.attendeeCount) > building.capacity) {
      nextErrors.attendeeCount = `Jumlah peserta melebihi kapasitas tercatat (${building.capacity}).`;
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError('Periksa kembali isian yang ditandai.');
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setError('');
    setStep(3);
  };

  const applicantLabel = applicantTypes.find(({ value }) => value === applicantType)?.label;
  const overCapacity = building.capacity != null && Number(form.attendeeCount) > building.capacity;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link href={`/gedung/${building.slug}?purpose=${purpose}`} className="text-sm font-medium text-emerald-700 hover:underline">← Kembali ke detail gedung</Link>
      </div>
      <header className="mb-8 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">{building.name}</p>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">{purpose === 'loan' ? 'Pengajuan peminjaman gedung' : 'Pengajuan penyewaan ruang / gedung'}</h1>
        <p className="text-slate-600">{purpose === 'loan' ? 'Khusus mahasiswa, dosen, dan civitas akademika Polinela.' : 'Khusus orang atau instansi luar kampus.'} Kategori harus sesuai akun Anda. Data yang belum dikirim tetap di halaman ini.</p>
      </header>

      <ol aria-label="Langkah pengajuan" className="mb-6 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
        {['Kategori & gedung', 'Rincian kegiatan', 'Tinjau & kirim'].map((label, index) => {
          const number = index + 1;
          const current = step === number;
          const complete = step > number;
          return (
            <li key={label} aria-current={current ? 'step' : undefined} className={`rounded-lg px-2 py-3 ${current ? 'bg-emerald-700 text-white' : complete ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              <span className="mb-1 block font-bold">{complete ? '✓' : number}</span>{label}
            </li>
          );
        })}
      </ol>

      <form onSubmit={(event) => event.preventDefault()} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {error && <p role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

        {step === 1 && (
          <section aria-labelledby="applicant-heading" className="space-y-5">
            <div>
              <h2 id="applicant-heading" ref={stepHeadingRef} tabIndex={-1} className="mb-2 text-xl font-bold text-slate-900">Jenis pemohon</h2>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">Saya mengajukan sebagai</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {applicantTypes.filter(({ value }) => purpose === 'rental' ? value === 'UMUM' : value !== 'UMUM').map(({ value, label }) => <label key={value} className={`flex min-h-14 items-center gap-3 rounded-lg border p-3 text-sm font-medium ${applicantType === value ? 'cursor-pointer border-emerald-700 bg-emerald-50 text-emerald-900' : 'cursor-pointer border-slate-200 bg-white text-slate-700'}`}>
                    <input type="radio" name="applicantType" value={value} checked={applicantType === value} onChange={() => { setApplicantType(value); setError(''); }} className="h-4 w-4 accent-emerald-700" />{label}
                  </label>)}
                </div>
                <p className="mt-2 text-xs text-slate-600">Kategori harus sesuai identitas akun yang diverifikasi pengelola. Tarif di katalog hanya berlaku untuk sewa luar kampus.</p>
                {purpose === 'rental' && !rentalRate && <p role="status" className="mt-2 text-xs text-amber-800">Tarif ruang ini hanya dapat ditampilkan sebagai informasi. Pengajuan dengan tagihan otomatis belum tersedia sampai perhitungan sewa dikonfirmasi pengelola.</p>}
              </fieldset>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gedung yang dipilih</p>
              <p className="mt-1 font-semibold text-slate-900">{building.name}</p>
              <p className="mt-1 text-sm text-slate-600">{building.location || 'Lokasi belum dicantumkan'}{building.capacity != null ? ` · Kapasitas ${building.capacity} orang` : ''}</p>
            </div>

            {applicantType === 'MAHASISWA' && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                <label htmlFor="student-document" className="mb-2 block text-sm font-semibold text-amber-950">Berkas peminjaman gedung (wajib)</label>
                <input id="student-document" type="file" accept=".pdf,application/pdf" required aria-describedby="document-note" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf') || file.size > 5 * 1024 * 1024 || file.size === 0)) {
                    setDocumentName('');
                    setDocumentFile(null);
                    setError('Pilih satu PDF berukuran maksimal 5 MB.');
                    event.target.value = '';
                    return;
                  }
                  setDocumentName(file?.name ?? '');
                  setDocumentFile(file ?? null);
                  setError('');
                }} className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:font-medium" />
                <p id="document-note" className="mt-2 text-xs leading-5 text-amber-950">Baseline proyek: satu PDF maksimal 5 MB. Berkas dikirim hanya setelah Anda menekan Kirim pada lingkungan development; produksi tetap nonaktif.</p>
                {documentName && <p className="mt-2 break-all text-xs text-slate-700">Dipilih: {documentName}</p>}
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button type="button" onClick={continueFromApplicant} className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800">Lanjut ke detail kegiatan</button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="event-heading" className="space-y-5">
            <div>
              <h2 id="event-heading" ref={stepHeadingRef} tabIndex={-1} className="mb-2 text-xl font-bold text-slate-900">Detail kegiatan</h2>
      <p className="text-sm text-slate-600">Waktu diisi dan ditampilkan sesuai zona waktu produk yang dikonfigurasi.</p>
            </div>
            <div>
              <label htmlFor="eventName" className="mb-1 block text-sm font-medium text-slate-700">Nama kegiatan <span aria-hidden="true">*</span></label>
                <input id="eventName" name="eventName" value={form.eventName} onChange={updateField} required minLength={3} maxLength={100} aria-invalid={Boolean(fieldErrors.eventName)} aria-describedby={fieldErrors.eventName ? 'eventName-error' : undefined} className={`w-full rounded-lg border px-3 py-2.5 ${fieldErrors.eventName ? 'border-rose-600' : 'border-slate-300'}`} />
                {fieldErrors.eventName && <p id="eventName-error" className="mt-1 flex items-center gap-1 text-sm text-rose-700"><span className="material-symbols-outlined text-base" aria-hidden="true">error</span>{fieldErrors.eventName}</p>}
            </div>
            <div>
              <label htmlFor="eventDescription" className="mb-1 block text-sm font-medium text-slate-700">Deskripsi singkat</label>
              <textarea id="eventDescription" name="eventDescription" value={form.eventDescription} onChange={updateField} rows={3} maxLength={2000} aria-invalid={Boolean(fieldErrors.eventDescription)} aria-describedby={fieldErrors.eventDescription ? 'eventDescription-error' : undefined} className={`w-full rounded-lg border px-3 py-2.5 ${fieldErrors.eventDescription ? 'border-rose-600' : 'border-slate-300'}`} />
              {fieldErrors.eventDescription && <p id="eventDescription-error" className="mt-1 flex items-center gap-1 text-sm text-rose-700"><span className="material-symbols-outlined text-base" aria-hidden="true">error</span>{fieldErrors.eventDescription}</p>}
              <p className="mt-1 text-right text-xs text-slate-500">{form.eventDescription.length}/2.000 karakter</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startsAt" className="mb-1 block text-sm font-medium text-slate-700">Mulai <span aria-hidden="true">*</span></label>
                <input id="startsAt" name="startsAt" type="datetime-local" value={form.startsAt} onChange={updateField} required aria-invalid={Boolean(fieldErrors.startsAt)} aria-describedby={fieldErrors.startsAt ? 'startsAt-error' : undefined} className={`w-full rounded-lg border px-3 py-2.5 ${fieldErrors.startsAt ? 'border-rose-600' : 'border-slate-300'}`} />
                {fieldErrors.startsAt && <p id="startsAt-error" className="mt-1 flex items-center gap-1 text-sm text-rose-700"><span className="material-symbols-outlined text-base" aria-hidden="true">error</span>{fieldErrors.startsAt}</p>}
              </div>
              <div>
                <label htmlFor="endsAt" className="mb-1 block text-sm font-medium text-slate-700">Selesai <span aria-hidden="true">*</span></label>
                <input id="endsAt" name="endsAt" type="datetime-local" value={form.endsAt} onChange={updateField} required aria-invalid={Boolean(fieldErrors.endsAt)} aria-describedby={fieldErrors.endsAt ? 'endsAt-error' : undefined} className={`w-full rounded-lg border px-3 py-2.5 ${fieldErrors.endsAt ? 'border-rose-600' : 'border-slate-300'}`} />
                {fieldErrors.endsAt && <p id="endsAt-error" className="mt-1 flex items-center gap-1 text-sm text-rose-700"><span className="material-symbols-outlined text-base" aria-hidden="true">error</span>{fieldErrors.endsAt}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="attendeeCount" className="mb-1 block text-sm font-medium text-slate-700">Perkiraan jumlah peserta</label>
              <input id="attendeeCount" name="attendeeCount" type="number" min="1" step="1" value={form.attendeeCount} onChange={updateField} aria-invalid={Boolean(fieldErrors.attendeeCount)} aria-describedby={fieldErrors.attendeeCount ? 'attendeeCount-error' : undefined} className={`w-full rounded-lg border px-3 py-2.5 sm:max-w-xs ${fieldErrors.attendeeCount ? 'border-rose-600' : 'border-slate-300'}`} />
              {fieldErrors.attendeeCount && <p id="attendeeCount-error" className="mt-1 flex items-center gap-1 text-sm text-rose-700"><span className="material-symbols-outlined text-base" aria-hidden="true">error</span>{fieldErrors.attendeeCount}</p>}
              {overCapacity && <p role="status" className="mt-2 text-sm text-amber-800">Jumlah peserta melebihi kapasitas yang tercatat ({building.capacity}). Periksa kembali sebelum melanjutkan.</p>}
            </div>
            {(building.facilities ?? []).length > 0 && <fieldset className="rounded-lg border border-slate-200 p-4">
              <legend className="px-1 text-sm font-medium text-slate-700">Fasilitas tambahan yang dibutuhkan</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">{building.facilities.map(({ facility }) => <label key={facility.id} className="flex min-h-9 items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={requestedFacilityIds.includes(facility.id)} onChange={(event) => setRequestedFacilityIds((current) => event.target.checked ? [...current, facility.id] : current.filter((id) => id !== facility.id))} className="h-4 w-4 accent-emerald-700" />{facility.name}</label>)}</div>
              <p className="mt-2 text-xs text-slate-500">Pilihan ini hanya disimpan sementara di halaman dan belum dikirim ke pengelola.</p>
            </fieldset>}
            <div className="flex justify-between border-t border-slate-100 pt-5">
              <button type="button" onClick={() => { setError(''); setStep(1); }} className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50">Kembali</button>
              <button type="button" onClick={continueFromEvent} className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800">Tinjau pengajuan</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="review-heading" className="space-y-5">
            <div>
              <h2 id="review-heading" ref={stepHeadingRef} tabIndex={-1} className="mb-2 text-xl font-bold text-slate-900">Tinjau rincian</h2>
              <p className="text-sm text-slate-600">Pastikan data kegiatan dan waktu sudah benar.</p>
            </div>
            <dl className="booking-review divide-y divide-slate-200 rounded-xl border border-slate-200">
              <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Pemohon</dt><dd className="text-right font-medium text-slate-900">{applicantLabel}</dd></div>
              <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Jenis pengajuan</dt><dd className="text-right font-medium text-slate-900">{applicantType === 'UMUM' ? 'Penyewaan luar kampus' : 'Peminjaman civitas Polinela'}</dd></div>
              {purpose === 'rental' && rentalRate && <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Tarif sewa yang dipakai</dt><dd className="text-right font-medium text-slate-900">{rentalRate.name}: {formatCurrencyAmount(rentalRate.amount, rentalRate.currency)} / {rentalRate.unit}</dd></div>}
              <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Gedung</dt><dd className="text-right font-medium text-slate-900">{building.name}</dd></div>
              <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Kegiatan</dt><dd className="text-right font-medium text-slate-900">{form.eventName}</dd></div>
              <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Mulai – selesai</dt><dd className="text-right font-medium text-slate-900">{formatDateTime(localDateTimeToIso(form.startsAt))} – {formatDateTime(localDateTimeToIso(form.endsAt))}</dd></div>
              {form.attendeeCount && <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Peserta</dt><dd className="text-right font-medium text-slate-900">{form.attendeeCount}</dd></div>}
              {requestedFacilityIds.length > 0 && <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Fasilitas tambahan</dt><dd className="text-right font-medium text-slate-900">{building.facilities.filter(({ facility }) => requestedFacilityIds.includes(facility.id)).map(({ facility }) => facility.name).join(', ')}</dd></div>}
              {applicantType === 'MAHASISWA' && <div className="flex justify-between gap-4 p-4"><dt className="text-slate-600">Berkas wajib</dt><dd className="max-w-[60%] break-all text-right font-medium text-slate-900">{documentName}</dd></div>}
            </dl>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-700"><input type="checkbox" checked={confirmedDetails} onChange={(event) => setConfirmedDetails(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-emerald-700" />Saya menyatakan data kegiatan yang saya tinjau sudah benar.</label>

            <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              {!canSubmitForPurpose
                ? 'Tarif yang tercantum memerlukan perhitungan manual. Pengajuan sewa lewat portal belum dapat dikirim untuk ruang ini.'
                : developmentSubmissionEnabled
                ? 'Pengiriman development memakai akun demo yang dikonfigurasi. Alur ini hanya untuk data uji dan belum boleh digunakan sebagai proses resmi.'
                : 'Pengiriman produksi belum aktif. Formulir ini hanya pratinjau dan tidak tersimpan.'}
            </div>
            {draftId && <p className="text-sm text-amber-900">Draf mahasiswa sudah dibuat. Jika pengiriman terhenti, <Link href={`/akun/pengajuan/${encodeURIComponent(draftId)}`} className="font-semibold underline">buka draf untuk melanjutkan</Link>.</p>}
            <div className="flex justify-between border-t border-slate-100 pt-5">
              <button type="button" onClick={() => { setError(''); setStep(2); }} disabled={Boolean(draftId) || submitting} className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Ubah rincian</button>
              <button type="button" onClick={handleSubmit} disabled={!developmentSubmissionEnabled || !canSubmitForPurpose || !confirmedDetails || submitting} className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">{submitting ? 'Mengirim…' : 'Kirim pengajuan'}</button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
