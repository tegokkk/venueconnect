import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError } from '@/server/errors';
import { createStorageProvider } from '@/server/storage/storage-provider';
import { lockBookingForUpdate } from '@/server/db/locks';
import { recordAuditEvent } from './audit.service';
import { validateStudentPdf, validatePdfContent } from '@/server/validations/student-document.validation';

function toDocumentDto(document) {
  return {
    id: document.id,
    fileName: document.fileName,
    fileSize: document.fileSize,
    mimeType: document.mimeType,
    createdAt: document.createdAt
  };
}

export class BookingDocumentService {
  async uploadStudentDocument(bookingId, requesterId, file) {
    const fileName = validateStudentPdf(file);
    const content = Buffer.from(await file.arrayBuffer());
    validatePdfContent(content);
    const storage = createStorageProvider();
    let storageKey;
    try {
      const result = await prisma.$transaction(async (tx) => {
        await lockBookingForUpdate(bookingId, tx);
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: { id: true, requesterId: true, applicantCategory: true, status: true }
        });
        if (!booking || booking.requesterId !== requesterId) {
          throw new NotFoundError('Booking not found');
        }
        if (booking.applicantCategory !== 'MAHASISWA' || !['DRAFT', 'REVISION_REQUESTED'].includes(booking.status)) {
          throw new ConflictError('Documents can only be added to a student draft or revision');
        }
        const documents = await tx.bookingDocument.findMany({
          where: { bookingId },
          select: { id: true, storageKey: true },
          take: 2
        });
        if (documents.length > 1) {
          throw new ConflictError('Only one student PDF is allowed');
        }

        storageKey = await storage.upload(content);
        const replacement = { fileName, fileSize: content.length, mimeType: 'application/pdf', storageKey, uploadedById: requesterId };
        const created = documents.length
          ? await tx.bookingDocument.update({ where: { id: documents[0].id }, data: replacement })
          : await tx.bookingDocument.create({ data: { bookingId, ...replacement } });
        await recordAuditEvent(tx, {
          actorId: requesterId,
          action: documents.length ? 'booking_document.replaced' : 'booking_document.uploaded',
          entityType: 'BookingDocument',
          entityId: created.id,
          metadata: { bookingId, fileSize: content.length, mimeType: 'application/pdf' }
        });
        return { document: created, oldStorageKey: documents[0]?.storageKey };
      });
      if (result.oldStorageKey) {
        await storage.delete(result.oldStorageKey).catch(() => console.warn('Orphaned private document requires cleanup'));
      }
      return toDocumentDto(result.document);
    } catch (error) {
      if (storageKey) {
        await storage.delete(storageKey).catch(() => console.warn('Orphaned private document requires cleanup'));
      }
      throw error;
    }
  }

  async readDocument(bookingId, documentId, actor) {
    const document = await prisma.bookingDocument.findFirst({
      where: { id: documentId, bookingId },
      select: { storageKey: true, booking: { select: { requesterId: true } } }
    });
    if (!document || (document.booking.requesterId !== actor.id && !actor.roles.includes('ADMIN'))) {
      throw new NotFoundError('Document not found');
    }
    const content = await createStorageProvider().read(document.storageKey);
    await recordAuditEvent(prisma, {
      actorId: actor.id,
      action: 'booking_document.downloaded',
      entityType: 'BookingDocument',
      entityId: documentId,
      metadata: { bookingId }
    });
    return content;
  }

  async deleteDraftDocument(bookingId, documentId, requesterId) {
    const document = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { requesterId: true, applicantCategory: true, status: true }
      });
      if (!booking || booking.requesterId !== requesterId) {
        throw new NotFoundError('Booking not found');
      }
      if (booking.applicantCategory !== 'MAHASISWA' || !['DRAFT', 'REVISION_REQUESTED'].includes(booking.status)) {
        throw new ConflictError('Only draft or revision documents can be removed by the requester');
      }
      const existing = await tx.bookingDocument.findFirst({
        where: { id: documentId, bookingId },
        select: { id: true, storageKey: true }
      });
      if (!existing) throw new NotFoundError('Document not found');
      await tx.bookingDocument.delete({ where: { id: documentId } });
      await recordAuditEvent(tx, {
        actorId: requesterId,
        action: 'booking_document.deleted',
        entityType: 'BookingDocument',
        entityId: documentId,
        metadata: { bookingId }
      });
      return existing;
    });
    await createStorageProvider().delete(document.storageKey).catch(() => console.warn('Orphaned private document requires cleanup'));
  }
}

export const bookingDocumentService = new BookingDocumentService();
