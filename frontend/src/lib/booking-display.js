import { formatDateTime } from './formatters';

export const bookingStatusLabels = {
  DRAFT: 'Draf',
  SUBMITTED: 'Terkirim',
  UNDER_REVIEW: 'Sedang diperiksa',
  REVISION_REQUESTED: 'Perlu perbaikan',
  AWAITING_APPROVAL: 'Menunggu persetujuan',
  AWAITING_PAYMENT: 'Disetujui, menunggu pembayaran',
  CONFIRMED: 'Disetujui',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
  COMPLETED: 'Selesai'
};

export function getBookingStatusLabel(status) {
  return bookingStatusLabels[status] ?? 'Status belum diketahui';
}

export function getBookingStatusClass(status) {
  if (status === 'CONFIRMED') return 'bg-[#dcfce7] text-[#166534]';
  if (status === 'REJECTED') return 'bg-[#fee2e2] text-[#991b1b]';
  if (['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(status)) return 'bg-[#e5e7eb] text-[#374151]';
  if (['AWAITING_PAYMENT', 'AWAITING_APPROVAL', 'REVISION_REQUESTED'].includes(status)) return 'bg-[#fef3c7] text-[#854d0e]';
  return 'bg-[#dbeafe] text-[#1e40af]';
}

export function formatBookingDate(value) {
  return formatDateTime(value);
}

