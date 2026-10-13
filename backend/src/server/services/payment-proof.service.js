import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError } from '@/server/errors';
import { lockBookingForUpdate, lockPaymentForUpdate } from '@/server/db/locks';
import { createStorageProvider } from '@/server/storage/storage-provider';
import { recordAuditEvent } from './audit.service';
import { validatePaymentProofFile, validatePaymentProofContent } from '@/server/validations/payment-proof.validation';
import { toPaymentProofDto } from '@/server/dto/payment.dto';

export class PaymentProofService {
  async uploadProof(paymentId, requesterId, file) {
    const { fileName, mimeType } = validatePaymentProofFile(file);
    const content = Buffer.from(await file.arrayBuffer());
    validatePaymentProofContent(content, mimeType);
    const storage = createStorageProvider();
    let newStorageKey;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const initial = await tx.payment.findUnique({ where: { id: paymentId }, select: { bookingId: true } });
        if (!initial) throw new NotFoundError('Payment not found');
        await lockBookingForUpdate(initial.bookingId, tx);
        await lockPaymentForUpdate(paymentId, tx);
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
          include: { booking: { select: { requesterId: true, bookingType: true, status: true } } }
        });
        if (!payment || payment.booking.requesterId !== requesterId || payment.booking.bookingType !== 'RENTAL') {
          throw new NotFoundError('Payment not found');
        }
        if (payment.status !== 'PENDING_VERIFICATION' || payment.booking.status !== 'AWAITING_PAYMENT') {
          throw new ConflictError('Payment proof can only be changed while verification is pending');
        }

        newStorageKey = await storage.upload(content);
        const updated = await tx.payment.update({
          where: { id: paymentId },
          data: {
            proofStorageKey: newStorageKey,
            proofFileName: fileName,
            proofFileSize: content.length,
            proofMimeType: mimeType,
            proofUploadedAt: new Date()
          }
        });
        await recordAuditEvent(tx, {
          actorId: requesterId,
          action: payment.proofStorageKey ? 'payment.proof_replaced' : 'payment.proof_uploaded',
          entityType: 'Payment',
          entityId: paymentId,
          metadata: { bookingId: payment.bookingId, fileSize: content.length, mimeType }
        });
        return { payment: updated, oldStorageKey: payment.proofStorageKey };
      });
      if (result.oldStorageKey) {
        await storage.delete(result.oldStorageKey).catch(() => console.warn('Orphaned private payment proof requires cleanup'));
      }
      return toPaymentProofDto(result.payment);
    } catch (error) {
      if (newStorageKey) {
        await storage.delete(newStorageKey).catch(() => console.warn('Orphaned private payment proof requires cleanup'));
      }
      throw error;
    }
  }

  async readProof(paymentId, actor) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        proofStorageKey: true,
        proofMimeType: true,
        bookingId: true,
        booking: { select: { requesterId: true, bookingType: true } }
      }
    });
    if (!payment?.proofStorageKey || payment.booking.bookingType !== 'RENTAL'
      || (payment.booking.requesterId !== actor.id && !actor.roles.includes('PAYMENT_VERIFIER'))) {
      throw new NotFoundError('Payment proof not found');
    }
    const content = await createStorageProvider().read(payment.proofStorageKey);
    await recordAuditEvent(prisma, {
      actorId: actor.id,
      action: 'payment.proof_downloaded',
      entityType: 'Payment',
      entityId: paymentId,
      metadata: { bookingId: payment.bookingId }
    });
    return { content, mimeType: payment.proofMimeType };
  }
}

export const paymentProofService = new PaymentProofService();
