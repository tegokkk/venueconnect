import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError } from '@/server/errors';
import { recordAuditEvent } from './audit.service';
import { createNotificationSafely } from './notification.service';
import { lockBookingForUpdate } from '@/server/db/locks';

export class UsageService {
  async getAdminUsage(page = 1, pageSize = 20) {
    const where = { status: 'CONFIRMED' };
    const [rows, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          publicReference: true,
          bookingType: true,
          startsAt: true,
          endsAt: true,
          status: true,
          building: { select: { name: true, slug: true } },
          usageHandover: {
            select: {
              id: true,
              keyGivenAt: true,
              keyReturnedAt: true,
              conditionBefore: true,
              conditionAfter: true,
              notes: true,
              updatedAt: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);
    return {
      data: rows,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async getUsageHistory(page = 1, pageSize = 20) {
    const where = {
      OR: [
        { status: 'COMPLETED' },
        { status: 'CONFIRMED', usageHandover: { isNot: null } }
      ]
    };
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          publicReference: true,
          status: true,
          building: { select: { name: true } },
          usageHandover: {
            select: {
              id: true,
              keyGivenAt: true,
              keyReturnedAt: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    const handoverIds = bookings.map(({ usageHandover }) => usageHandover?.id).filter(Boolean);
    const bookingIds = bookings.map(({ id }) => id);
    const auditEvents = bookings.length ? await prisma.auditEvent.findMany({
      where: {
        OR: [
          { entityType: 'UsageHandover', entityId: { in: handoverIds }, action: { in: ['usage.keys_handed_over', 'usage.keys_returned'] } },
          { entityType: 'Booking', entityId: { in: bookingIds }, action: 'booking.completed' }
        ]
      },
      select: {
        entityType: true,
        entityId: true,
        action: true,
        createdAt: true,
        actor: { select: { name: true } }
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
    }) : [];

    const bookingByHandover = new Map(bookings
      .filter(({ usageHandover }) => usageHandover)
      .map(({ id, usageHandover }) => [usageHandover.id, id]));
    const actionsByBooking = new Map(bookingIds.map((id) => [id, []]));
    for (const event of auditEvents) {
      const bookingId = event.entityType === 'Booking'
        ? event.entityId
        : bookingByHandover.get(event.entityId);
      actionsByBooking.get(bookingId)?.push({
        action: event.action,
        createdAt: event.createdAt,
        actorName: event.actor?.name ?? 'Akun tidak tersedia'
      });
    }

    return {
      data: bookings.map((booking) => ({
        id: booking.usageHandover?.id ?? booking.id,
        bookingId: booking.id,
        publicReference: booking.publicReference,
        buildingName: booking.building.name,
        bookingStatus: booking.status,
        keyGivenAt: booking.usageHandover?.keyGivenAt ?? null,
        keyReturnedAt: booking.usageHandover?.keyReturnedAt ?? null,
        actions: actionsByBooking.get(booking.id) ?? []
      })),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async handoverKeys(bookingId, officerId, data = {}) {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundError('Booking not found');
      if (booking.status !== 'CONFIRMED') {
        throw new ConflictError('Keys can only be handed over for a confirmed booking');
      }

      const existing = await tx.usageHandover.findUnique({ where: { bookingId } });
      if (existing) throw new ConflictError('Key handover has already been recorded');

      const handover = await tx.usageHandover.create({
        data: {
          bookingId,
          officerId,
          keyGivenAt: new Date(),
          conditionBefore: data.conditionBefore || null,
          notes: data.notes || null
        }
      });

      await recordAuditEvent(tx, {
        actorId: officerId,
        action: 'usage.keys_handed_over',
        entityType: 'UsageHandover',
        entityId: handover.id,
        metadata: { bookingId }
      });

      return {
        handover,
        requesterId: booking.requesterId,
        publicReference: booking.publicReference
      };
    });

    await createNotificationSafely({
      userId: result.requesterId,
      type: 'KEYS_HANDED_OVER',
      title: 'Kunci gedung diserahkan',
      body: `Serah-terima kunci untuk pengajuan ${result.publicReference} telah dicatat.`,
      resourceType: 'Booking',
      resourceId: bookingId
    });

    return result.handover;
  }

  async returnKeys(bookingId, officerId, data = {}) {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { requesterId: true, publicReference: true }
      });
      if (!booking) throw new NotFoundError('Booking not found');

      const handover = await tx.usageHandover.findUnique({ where: { bookingId } });
      if (!handover) throw new NotFoundError('Key handover not found');
      if (handover.keyReturnedAt) {
        throw new ConflictError('Keys have already been returned');
      }

      const updated = await tx.usageHandover.update({
        where: { bookingId },
        data: {
          keyReturnedAt: new Date(),
          conditionAfter: data.conditionAfter || null,
          notes: data.notes ?? handover.notes
        }
      });

      await recordAuditEvent(tx, {
        actorId: officerId,
        action: 'usage.keys_returned',
        entityType: 'UsageHandover',
        entityId: handover.id,
        metadata: { bookingId }
      });

      return {
        handover: updated,
        requesterId: booking.requesterId,
        publicReference: booking.publicReference
      };
    });

    await createNotificationSafely({
      userId: result.requesterId,
      type: 'KEYS_RETURNED',
      title: 'Kunci gedung dikembalikan',
      body: `Pengembalian kunci untuk pengajuan ${result.publicReference} telah dicatat.`,
      resourceType: 'Booking',
      resourceId: bookingId
    });

    return result.handover;
  }

  async completeBooking(bookingId, actorId) {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundError('Booking not found');
      if (booking.status !== 'CONFIRMED') {
        throw new ConflictError('Only a confirmed booking can be completed');
      }

      const handover = await tx.usageHandover.findUnique({ where: { bookingId } });
      if (handover && !handover.keyReturnedAt) {
        throw new ConflictError('Keys must be returned before completing the booking');
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' }
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          actorId,
          fromStatus: booking.status,
          toStatus: 'COMPLETED',
          note: 'Usage completed'
        }
      });

      await recordAuditEvent(tx, {
        actorId,
        action: 'booking.completed',
        entityType: 'Booking',
        entityId: bookingId,
        metadata: { fromStatus: booking.status, toStatus: 'COMPLETED' }
      });

      return { booking: updated, requesterId: booking.requesterId };
    });

    await createNotificationSafely({
      userId: result.requesterId,
      type: 'BOOKING_COMPLETED',
      title: 'Penggunaan gedung selesai',
      body: `Pengajuan ${result.booking.publicReference} telah diselesaikan.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    });

    return result.booking;
  }
}

export const usageService = new UsageService();
