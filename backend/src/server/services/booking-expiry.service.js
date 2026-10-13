import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError } from '@/server/errors';
import { lockBookingForUpdate, lockPaymentForUpdate } from '@/server/db/locks';
import { recordAuditEvent } from './audit.service';
import { createNotificationSafely } from './notification.service';
import { toBookingDto } from '@/server/dto/booking.dto';

export class BookingExpiryService {
  /**
   * Expire a single booking that is awaiting payment.
   * If the booking has passed paymentDueAt, or if forced (e.g. manual admin trigger),
   * transitions the booking to EXPIRED, updates pending payments to EXPIRED,
   * releases the slot (via status transition), logs audit and status history,
   * and notifies the requester.
   */
  async expireOverdueBooking(bookingId, { actorId = null, cutoff = new Date(), reason = '', force = false } = {}) {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          payments: {
            where: { status: { in: ['UNPAID', 'PENDING_VERIFICATION'] } }
          }
        }
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.status === 'EXPIRED') {
        return { booking, alreadyExpired: true };
      }

      if (booking.status !== 'AWAITING_PAYMENT') {
        throw new ConflictError(`Cannot expire booking with status ${booking.status}. Only AWAITING_PAYMENT bookings can expire.`);
      }

      if (!force && booking.paymentDueAt && new Date(booking.paymentDueAt) > new Date(cutoff)) {
        throw new ConflictError('Payment deadline has not passed yet');
      }

      // Expire any pending payment records
      for (const payment of booking.payments) {
        await lockPaymentForUpdate(payment.id, tx);
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'EXPIRED',
            reviewNote: 'Batas waktu pembayaran telah kedaluwarsa'
          }
        });
        await recordAuditEvent(tx, {
          actorId,
          action: 'payment.expired',
          entityType: 'Payment',
          entityId: payment.id,
          metadata: { bookingId, fromStatus: payment.status, toStatus: 'EXPIRED' }
        });
      }

      const expiryReason = reason || 'Batas waktu pembayaran telah kedaluwarsa';
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'EXPIRED',
          cancellationReason: expiryReason,
          cancelledAt: new Date()
        }
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          actorId,
          fromStatus: 'AWAITING_PAYMENT',
          toStatus: 'EXPIRED',
          note: expiryReason
        }
      });

      await recordAuditEvent(tx, {
        actorId,
        action: 'booking.expired',
        entityType: 'Booking',
        entityId: booking.id,
        metadata: {
          fromStatus: 'AWAITING_PAYMENT',
          toStatus: 'EXPIRED',
          releasedSlot: true,
          buildingId: booking.buildingId,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          previousPaymentDueAt: booking.paymentDueAt
        }
      });

      return {
        booking: updatedBooking,
        alreadyExpired: false,
        requesterId: booking.requesterId,
        publicReference: booking.publicReference
      };
    });

    if (result.alreadyExpired) {
      return { expired: false, alreadyExpired: true, booking: toBookingDto(result.booking) };
    }

    await createNotificationSafely({
      userId: result.requesterId,
      type: 'BOOKING_EXPIRED',
      title: 'Batas waktu pembayaran habis',
      body: `Pengajuan ${result.publicReference} telah kedaluwarsa karena melewati tenggat pembayaran. Slot jadwal telah dilepas.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    });

    return { expired: true, alreadyExpired: false, booking: toBookingDto(result.booking) };
  }

  /**
   * Scans and expires all bookings in AWAITING_PAYMENT where paymentDueAt <= cutoff.
   */
  async expireAllOverdueBookings({ cutoff = new Date(), limit = 100, actorId = null } = {}) {
    const overdueBookings = await prisma.booking.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        paymentDueAt: { lte: new Date(cutoff) }
      },
      select: { id: true, publicReference: true, paymentDueAt: true },
      orderBy: { paymentDueAt: 'asc' },
      take: limit
    });

    const expiredBookingIds = [];
    const errors = [];

    for (const item of overdueBookings) {
      try {
        const res = await this.expireOverdueBooking(item.id, {
          actorId,
          cutoff,
          reason: 'Batas waktu pembayaran telah kedaluwarsa otomatis'
        });
        if (res.expired) {
          expiredBookingIds.push(item.id);
        }
      } catch (err) {
        errors.push({ id: item.id, error: err.message });
      }
    }

    return {
      totalFound: overdueBookings.length,
      expiredCount: expiredBookingIds.length,
      expiredBookingIds,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      cutoff: new Date(cutoff).toISOString()
    };
  }
}

export const bookingExpiryService = new BookingExpiryService();
