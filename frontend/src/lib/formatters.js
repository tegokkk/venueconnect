import { Temporal } from 'temporal-polyfill';

const PRODUCT_TIME_ZONE = process.env.NEXT_PUBLIC_APP_TIME_ZONE || 'Asia/Jakarta';

function validDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const date = validDate(value);
  if (!date) return 'Belum tersedia';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    timeZone: PRODUCT_TIME_ZONE
  }).format(date);
}

export function localDateTimeToIso(value) {
  if (!value) return null;
  try {
    return Temporal.PlainDateTime.from(value)
      .toZonedDateTime(PRODUCT_TIME_ZONE, { disambiguation: 'reject' })
      .toInstant()
      .toString();
  } catch {
    return null;
  }
}

export function instantToLocalDateTime(value) {
  if (!value) return '';
  try {
    return Temporal.Instant.from(value)
      .toZonedDateTimeISO(PRODUCT_TIME_ZONE)
      .toPlainDateTime()
      .toString({ smallestUnit: 'minute' });
  } catch {
    return '';
  }
}

export function formatDate(value) {
  const date = validDate(value);
  if (!date) return 'Belum tersedia';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: PRODUCT_TIME_ZONE
  }).format(date);
}

export function formatTimeRange(start, end) {
  const startDate = validDate(start);
  const endDate = validDate(end);
  if (!startDate || !endDate) return 'Waktu belum tersedia';
  const formatter = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short', timeZone: PRODUCT_TIME_ZONE
  });
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}
