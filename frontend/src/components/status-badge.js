import { getBookingStatusClass, getBookingStatusLabel } from '@/lib/booking-display';

const icons = {
  SUBMITTED: 'schedule',
  UNDER_REVIEW: 'visibility',
  REVISION_REQUESTED: 'edit_note',
  AWAITING_APPROVAL: 'pending_actions',
  AWAITING_PAYMENT: 'payments',
  CONFIRMED: 'check_circle',
  REJECTED: 'cancel',
  CANCELLED: 'block',
  EXPIRED: 'event_busy',
  COMPLETED: 'task_alt'
};

export default function StatusBadge({ status, className = '' }) {
  return <span className={`inline-flex min-h-[26px] items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${getBookingStatusClass(status)} ${className}`}>
    <span className="material-symbols-outlined text-sm" aria-hidden="true">{icons[status] ?? 'help'}</span>
    {getBookingStatusLabel(status)}
  </span>;
}
