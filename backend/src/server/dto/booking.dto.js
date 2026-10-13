import { toPaymentDto } from './payment.dto';

export function toBookingDto(booking) {
  return {
    id: booking.id,
    publicReference: booking.publicReference,
    bookingType: booking.bookingType,
    applicantCategory: booking.applicantCategory,
    eventName: booking.eventName,
    eventDescription: booking.eventDescription,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    attendeeCount: booking.attendeeCount,
    status: booking.status,
    paymentDueAt: booking.paymentDueAt,
    rateSnapshot: booking.rateSnapshot,
    createdAt: booking.createdAt,
    documents: (booking.documents ?? []).map(({ id, fileName, fileSize, mimeType, createdAt }) => ({
      id, fileName, fileSize, mimeType, createdAt
    })),
    payments: (booking.payments ?? []).map(toPaymentDto),
    building: booking.building
      ? { name: booking.building.name, slug: booking.building.slug }
      : undefined,
    statusHistory: (booking.statusHistory ?? []).map((entry) => ({
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      note: entry.note,
      createdAt: entry.createdAt
    }))
  };
}

