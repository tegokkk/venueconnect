'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getNotifications } from '@/lib/api-client';

const UPDATED_EVENT = 'venueconnect:notifications-updated';

export default function NotificationNavLink({ className = '' }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionUnavailable, setSessionUnavailable] = useState(false);
  const requestRef = useRef(null);
  const hasDevelopmentSession = process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_DEV_USER_ID);

  const refreshUnreadCount = useCallback(async () => {
    if (document.visibilityState === 'hidden') return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await getNotifications({ page: 1, pageSize: 1, signal: controller.signal });
      if (!controller.signal.aborted && response.success && Number.isInteger(response.meta?.unreadCount)) {
        setUnreadCount(response.meta.unreadCount);
      }
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        setUnreadCount(0);
        setSessionUnavailable(true);
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!hasDevelopmentSession || sessionUnavailable) return;
    const initialRefresh = window.setTimeout(refreshUnreadCount, 0);
    const interval = window.setInterval(refreshUnreadCount, 30_000);
    window.addEventListener('focus', refreshUnreadCount);
    document.addEventListener('visibilitychange', refreshUnreadCount);
    window.addEventListener(UPDATED_EVENT, refreshUnreadCount);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshUnreadCount);
      document.removeEventListener('visibilitychange', refreshUnreadCount);
      window.removeEventListener(UPDATED_EVENT, refreshUnreadCount);
      requestRef.current?.abort();
    };
  }, [hasDevelopmentSession, refreshUnreadCount, sessionUnavailable]);

  const accessibleLabel = unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi';

  return (
    <Link href="/notifikasi" aria-label={accessibleLabel} className={className}>
      <span className="material-symbols-outlined text-base" aria-hidden="true">notifications</span>
      <span>Notifikasi</span>
      {unreadCount > 0 && <span aria-hidden="true" className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </Link>
  );
}
