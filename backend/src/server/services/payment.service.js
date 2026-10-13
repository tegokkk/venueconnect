import { prisma } from '@/server/db/prisma';
import { NotFoundError, ConflictError } from '@/server/errors';
import { recordAuditEvent } from './audit.service';
import { createNotificationSafely } from './notification.service';
import { lockBookingForUpdate, lockPaymentForUpdate } from '@/server/db/locks';
import { toPaymentProofDto } from '@/server/dto/payment.dto';

export class PaymentService {
  async getPendingVerification(page = 1, pageSize = 20) {
    const where = { status: 'PENDING_VERIFICATION' };
    const [rows, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          bookingId: true,
          amount: true,
          currency: true,
          method: true,
          reference: true,
          status: true,
          createdAt: true,
          dueAt: true,
          proofStorageKey: true,
          proofFileName: true,
          proofFileSize: true,
          proofMimeType: true,
          proofUploadedAt: true,
          booking: {
            select: {
              publicReference: true,
              startsAt: true,
              endsAt: true,
              rateSnapshot: true,
              building: { select: { name: true, slug: true } }
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);
    return {
      data: rows.map((payment) => {
        const { proofStorageKey, proofFileName, proofFileSize, proofMimeType, proofUploadedAt, ...visible } = payment;
        return { ...visible, amount: payment.amount.toString(), proof: toPaymentProofDto(payment) };
      }),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async recordManualPayment(bookingId, requesterId, reference) {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.requesterId !== requesterId) {
        throw new NotFoundError('Booking not found');
      }
      if (booking.bookingType !== 'RENTAL' || booking.status !== 'AWAITING_PAYMENT') {
        throw new ConflictError('This booking is not awaiting a manual rental payment');
      }
      const amount = booking.rateSnapshot?.amount;
      const currency = booking.rateSnapshot?.currency;
      if (typeof amount !== 'string' || !/^\d+(\.\d{1,2})?$/.test(amount) || currency !== 'IDR') {
        throw new ConflictError('An approved rate snapshot is required before recording payment');
      }
      const existing = await tx.payment.findFirst({
        where: { bookingId, status: { in: ['PENDING_VERIFICATION', 'VERIFIED'] } },
        orderBy: { createdAt: 'desc' }
      });
      if (existing) {
        if (existing.status === 'PENDING_VERIFICATION' && existing.reference === reference) {
          return { payment: existing, created: false, booking, verifierIds: [] };
        }
        throw new ConflictError('A payment for this booking is already pending or verified');
      }
      const payment = await tx.payment.create({
        data: {
          bookingId,
          amount,
          currency,
          method: 'MANUAL_TRANSFER',
          reference,
          status: 'PENDING_VERIFICATION',
          dueAt: booking.paymentDueAt
        }
      });
      await recordAuditEvent(tx, {
        actorId: requesterId,
        action: 'payment.recorded',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: { bookingId, status: 'PENDING_VERIFICATION' }
      });
      const verifiers = await tx.user.findMany({
        where: { isActive: true, roles: { some: { role: { name: 'PAYMENT_VERIFIER' } } } },
        select: { id: true }
      });
      return { payment, created: true, booking, verifierIds: verifiers.map(({ id }) => id) };
    });
    if (!result.created) return result.payment;

    await Promise.all(result.verifierIds.map((userId) => createNotificationSafely({
      userId,
      type: 'PAYMENT_PENDING_VERIFICATION',
      title: 'Pembayaran menunggu verifikasi',
      body: `Pembayaran pengajuan ${result.booking.publicReference} perlu diperiksa.`,
      resourceType: 'Payment',
      resourceId: result.payment.id
    })));
    await createNotificationSafely({
      userId: requesterId,
      type: 'PAYMENT_RECORDED',
      title: 'Referensi pembayaran tercatat',
      body: `Referensi pembayaran pengajuan ${result.booking.publicReference} menunggu verifikasi.`,
      resourceType: 'Payment',
      resourceId: result.payment.id
    });
    return result.payment;
  }

  async rejectManualPayment(paymentId, verifierId, reason) {
    const result = await prisma.$transaction(async (tx) => {
      const initial = await tx.payment.findUnique({
        where: { id: paymentId },
        select: { bookingId: true }
      });
      if (!initial) throw new NotFoundError('Payment not found');
      await lockBookingForUpdate(initial.bookingId, tx);
      await lockPaymentForUpdate(paymentId, tx);
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { booking: { select: { requesterId: true, publicReference: true, status: true } } }
      });
      if (!payment) throw new NotFoundError('Payment not found');
      if (payment.status === 'FAILED') {
        return { payment, alreadyFailed: true };
      }
      if (payment.status !== 'PENDING_VERIFICATION' || payment.booking.status !== 'AWAITING_PAYMENT') {
        throw new ConflictError('Only a pending payment for an awaiting booking can be rejected');
      }
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', verifiedById: verifierId, verifiedAt: new Date(), reviewNote: reason }
      });
      await recordAuditEvent(tx, {
        actorId: verifierId,
        action: 'payment.rejected',
        entityType: 'Payment',
        entityId: paymentId,
        metadata: { bookingId: initial.bookingId, status: 'FAILED' }
      });
      return {
        payment: updated,
        alreadyFailed: false,
        requesterId: payment.booking.requesterId,
        bookingReference: payment.booking.publicReference
      };
    });
    if (result.alreadyFailed) return result.payment;
    await createNotificationSafely({
      userId: result.requesterId,
      type: 'PAYMENT_REJECTED',
      title: 'Referensi pembayaran ditolak',
      body: `Referensi pembayaran pengajuan ${result.bookingReference} perlu diperbaiki. Lihat catatan pemeriksaan di detail pengajuan.`,
      resourceType: 'Payment',
      resourceId: result.payment.id
    });
    return result.payment;
  }

  async verifyPayment(paymentId, verifierId, note = '') {
    const result = await prisma.$transaction(async (tx) => {
      const initialPayment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: { id: true, bookingId: true }
      });

      if (!initialPayment) {
        throw new NotFoundError('Payment not found');
      }

      // Keep lock ordering consistent: booking first, then payment, then re-read both states.
      await lockBookingForUpdate(initialPayment.bookingId, tx);
      await lockPaymentForUpdate(paymentId, tx);
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true }
      });

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      if (payment.status === 'VERIFIED') {
        return { payment, alreadyVerified: true };
      }

      if (payment.status !== 'PENDING_VERIFICATION') {
        throw new ConflictError(`Cannot verify a payment with status ${payment.status}`);
      }

      if (payment.booking?.status !== 'AWAITING_PAYMENT') {
        throw new ConflictError('The booking is not awaiting payment');
      }

      const rateSnapshot = payment.booking.rateSnapshot;
      const expectedAmount = rateSnapshot?.amount;
      const expectedCurrency = rateSnapshot?.currency;
      if (
        typeof expectedAmount !== 'string'
        || !expectedCurrency
        || payment.amount.comparedTo(expectedAmount) !== 0
        || payment.currency !== expectedCurrency
      ) {
        throw new ConflictError('Payment amount and currency must match the booking rate snapshot');
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'VERIFIED',
          verifiedById: verifierId,
          verifiedAt: new Date(),
          reviewNote: note || null,
        }
      });

      await recordAuditEvent(tx, {
        actorId: verifierId,
        action: 'payment.verified',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: { status: 'VERIFIED' }
      });

      await tx.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'CONFIRMED' }
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: payment.booking.id,
          actorId: verifierId,
          fromStatus: 'AWAITING_PAYMENT',
          toStatus: 'CONFIRMED',
          note: note || 'Payment verified, booking confirmed'
        }
      });

      await recordAuditEvent(tx, {
        actorId: verifierId,
        action: 'booking.payment_confirmed',
        entityType: 'Booking',
        entityId: payment.booking.id,
        metadata: { fromStatus: 'AWAITING_PAYMENT', toStatus: 'CONFIRMED' }
      });

      return {
        payment: updatedPayment,
        alreadyVerified: false,
        requesterId: payment.booking?.requesterId,
        bookingReference: payment.booking?.publicReference
      };
    });

    if (result.alreadyVerified) {
      return result.payment;
    }

    await createNotificationSafely({
      userId: result.requesterId,
      type: 'PAYMENT_VERIFIED',
      title: 'Pembayaran diverifikasi',
      body: `Pembayaran untuk pengajuan ${result.bookingReference} sudah diverifikasi.`,
      resourceType: 'Payment',
      resourceId: result.payment.id
    });

    return result.payment;
  }
}

export const paymentService = new PaymentService();
