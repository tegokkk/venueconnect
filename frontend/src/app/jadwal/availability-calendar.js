'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import listPlugin from '@fullcalendar/react/list';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import idLocale from '@fullcalendar/react/locales/id';
import { getAvailability } from '@/lib/api-client';

const calendarPlugins = [classicThemePlugin, dayGridPlugin, timeGridPlugin, listPlugin];

export default function AvailabilityCalendar({ buildingId }) {
  const calendarRef = useRef(null);
  const mountedRef = useRef(false);
  const loadingTimerRef = useRef(null);
  const errorTimerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCalendarReady, setIsCalendarReady] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    const readyFrame = window.requestAnimationFrame(() => setIsCalendarReady(true));
    return () => {
      window.cancelAnimationFrame(readyFrame);
      mountedRef.current = false;
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleLoading = useCallback((value) => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setIsLoading(value);
    }, 0);
  }, []);

  const scheduleError = useCallback((value) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setHasError(value);
    }, 0);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateView = () => {
      setIsMobile(media.matches);
      calendarRef.current?.getApi().changeView(media.matches ? 'listWeek' : 'dayGridMonth');
    };
    updateView();
    media.addEventListener('change', updateView);
    return () => media.removeEventListener('change', updateView);
  }, []);

  const loadEvents = useCallback(async (fetchInfo) => {
    try {
      const response = await getAvailability({
        buildingId,
        startDate: fetchInfo.start,
        endDate: fetchInfo.end
      });
      scheduleError(false);
      return (response.data?.unavailableSlots ?? []).map((slot, index) => ({
        id: `${slot.status}-${slot.startsAt}-${index}`,
        title: slot.status === 'BOOKED' ? 'Sudah dipesan' : 'Diblokir',
        start: slot.startsAt,
        end: slot.endsAt,
        backgroundColor: slot.status === 'BOOKED' ? '#64748b' : '#1e293b',
        borderColor: slot.status === 'BOOKED' ? '#475569' : '#0f172a',
        textColor: '#ffffff'
      }));
    } catch (error) {
      scheduleError(true);
      throw error;
    }
  }, [buildingId, scheduleError]);

  return (
    <section aria-label="Kalender ketersediaan gedung" className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700" aria-label="Legenda jadwal">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-emerald-600 ring-2 ring-emerald-200" aria-hidden="true" />
          <span>Tersedia (waktu buka)</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-slate-500" aria-hidden="true" />
          <span>Sudah dipesan</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-slate-800" aria-hidden="true" />
          <span>Diblokir / Pemeliharaan</span>
        </span>
      </div>

      {isLoading && <p role="status" className="mb-3 text-sm text-slate-600">Memuat jadwal…</p>}
      {hasError && (
        <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
          <p>Jadwal gagal dimuat. Periksa koneksi lalu coba lagi.</p>
          <button
            type="button"
            onClick={() => calendarRef.current?.getApi().refetchEvents()}
            disabled={isLoading}
            className="rounded-md border border-amber-800 px-3 py-1.5 font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-60"
          >
            Muat ulang jadwal
          </button>
        </div>
      )}

      <div className="min-h-80 overflow-x-auto">
        <FullCalendar
          ref={calendarRef}
          plugins={calendarPlugins}
          initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
          }}
          events={isCalendarReady ? loadEvents : []}
          loading={handleLoading}
          timeZone="Asia/Jakarta"
          locale={idLocale}
          firstDay={1}
          height="auto"
          dayMaxEvents
          displayEventTime
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          noEventsText="Tidak ada waktu terpakai pada rentang ini"
          eventDisplay="block"
        />
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">Jadwal menampilkan waktu dan status umum saja. Ketersediaan dapat berubah sampai pengajuan dikonfirmasi.</p>
    </section>
  );
}
