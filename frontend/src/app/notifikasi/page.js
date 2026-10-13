'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '@/lib/api-client';
import { formatBookingDate } from '@/lib/booking-display';

export default function NotificationInboxPage() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getNotifications({ page, pageSize: 20 })
      .then((response) => {
        if (cancelled) return;
        if (!response.success || !Array.isArray(response.data)) throw new Error('Respons notifikasi tidak valid.');
        setItems(response.data);
        setMeta(response.meta ?? null);
      })
      .catch((requestError) => { if (!cancelled) setError(requestError); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, reloadKey]);

  const reload = () => {
    setLoading(true);
    setError(null);
    setActionError('');
    setReloadKey((value) => value + 1);
  };

  const handleMarkRead = async (notification) => {
    setSavingId(notification.id);
    setActionError('');
    try {
      const response = await markNotificationRead(notification.id);
      if (!response.success) throw new Error('Notifikasi gagal diperbarui.');
      setItems((current) => current.map((item) => item.id === notification.id ? response.data : item));
      window.dispatchEvent(new Event('venueconnect:notifications-updated'));
    } catch {
      setActionError('Status notifikasi belum dapat diperbarui. Coba lagi.');
    } finally {
      setSavingId(null);
    }
  };

  const changePage = (nextPage) => {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifikasi</h1>
          <p className="mt-1 text-sm text-slate-600">Pemberitahuan untuk akun Anda.</p>
        </div>
        <button type="button" onClick={reload} disabled={loading} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Muat ulang</button>
      </header>

      {actionError && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{actionError}</p>}
      <section aria-label="Kotak masuk notifikasi" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p role="status" className="p-8 text-center text-slate-600">Memuat notifikasi…</p>
        ) : error ? (
          <div role="alert" className="p-8 text-center">
            <p className="mb-2 font-semibold text-slate-900">{error.status === 401 ? 'Sesi masuk belum tersedia' : 'Notifikasi belum dapat dimuat'}</p>
            <p className="mb-4 text-sm text-slate-600">{error.status === 401 ? 'Silakan masuk setelah autentikasi aplikasi dikonfigurasi.' : 'Periksa koneksi layanan, lalu coba lagi.'}</p>
            <button type="button" onClick={reload} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Coba lagi</button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-600">Belum ada notifikasi.</p>
        ) : (
          <>
            <ul className="divide-y divide-slate-200">
              {items.map((notification) => (
                <li key={notification.id} className={`p-5 ${notification.readAt ? 'bg-white' : 'bg-emerald-50/50'}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!notification.readAt && (
                          <>
                            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-700" aria-hidden="true" />
                            <span className="sr-only">Belum dibaca</span>
                          </>
                        )}
                        <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{notification.body}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatBookingDate(notification.createdAt)}</p>
                      {notification.resourceType === 'Booking' && notification.resourceId && (
                        <Link href={`/dashboard/${notification.resourceId}`} className="mt-3 inline-block text-sm font-semibold text-emerald-800 hover:underline">Buka pengajuan</Link>
                      )}
                    </div>
                    {!notification.readAt && (
                      <button type="button" onClick={() => handleMarkRead(notification)} disabled={savingId === notification.id} className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        {savingId === notification.id ? 'Menyimpan…' : 'Tandai dibaca'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {meta?.totalPages > 1 && (
              <nav aria-label="Halaman notifikasi" className="flex items-center justify-center gap-4 border-t border-slate-200 p-4">
                <button type="button" onClick={() => changePage(Math.max(1, page - 1))} disabled={page <= 1} className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40">Sebelumnya</button>
                <span className="text-sm text-slate-600">Halaman {page} dari {meta.totalPages}</span>
                <button type="button" onClick={() => changePage(Math.min(meta.totalPages, page + 1))} disabled={page >= meta.totalPages} className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40">Berikutnya</button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
