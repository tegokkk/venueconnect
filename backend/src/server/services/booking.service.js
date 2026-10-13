import { randomUUID } from 'node:crypto';
import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError, ValidationError } from '@/server/errors';
import { availabilityService } from './availability.service';
import { toBookingDto } from '@/server/dto/booking.dto';
import { recordAuditEvent } from './audit.service';
import { createNotificationSafely } from './notification.service';
import { lockBookingForUpdate } from '@/server/db/locks';
import { isApplicantCategoryAllowed } from '@/server/validations/applicant-category.validation';

export class BookingService {
  async getAdminOverview() {
    const grouped = await prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    const byStatus = Object.fromEntries(grouped.map(({ status, _count }) => [status, _count._all]));
    return {
      total: grouped.reduce((sum, { _count }) => sum + _count._all, 0),
      byStatus
    };
  }

  async getAdminBookings(page = 1, pageSize = 20, options = {}) {
    const filterOptions = typeof options === 'string' ? { status: options } : options;
    const { status, category, search, sort = 'createdAt_desc' } = filterOptions;

    const skip = (page - 1) * pageSize;
    const where = {
      ...(status
        ? { status }
        : { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'AWAITING_APPROVAL', 'AWAITING_PAYMENT'] } }),
      ...(category ? { applicantCategory: category } : {}),
      ...(search
        ? {
            OR: [
              { publicReference: { contains: search, mode: 'insensitive' } },
              { eventName: { contains: search, mode: 'insensitive' } },
              { building: { name: { contains: search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    let orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
    if (sort === 'createdAt_asc') {
      orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
    } else if (sort === 'startsAt_asc') {
      orderBy = [{ startsAt: 'asc' }, { id: 'asc' }];
    } else if (sort === 'startsAt_desc') {
      orderBy = [{ startsAt: 'desc' }, { id: 'desc' }];
    }

    const [rows, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          publicReference: true,
          bookingType: true,
          applicantCategory: true,
          eventName: true,
          startsAt: true,
          endsAt: true,
          status: true,
          createdAt: true,
          building: { select: { name: true, slug: true } }
        }
      }),
      prisma.booking.count({ where })
    ]);
    return {
      data: rows,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async createBooking(data, requesterId) {
    const booking = await prisma.$transaction(async (tx) => {
      const requester = await tx.user.findUnique({
        where: { id: requesterId },
        select: { id: true, isActive: true, userType: true, accountCategory: true }
      });
      if (!requester?.isActive) {
        throw new NotFoundError('Requester not found');
      }

      // Read mutable building eligibility only after taking the same lock used by
      // building updates, schedule blocks, and other bookings.
      await availabilityService.lockBuildingSchedule(data.buildingId, tx);
      const building = await tx.building.findUnique({
        where: { id: data.buildingId },
        select: { id: true, isActive: true, internalLoanEnabled: true, publicRentalEnabled: true, capacity: true }
      });
      if (!building?.isActive) {
        throw new NotFoundError('Building not found');
      }

      const startsAt = new Date(data.startsAt);
      const endsAt = new Date(data.endsAt);
      if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) {
        throw new ValidationError('Booking must have valid start and end times');
      }
      if (startsAt <= new Date()) {
        throw new ValidationError('Booking start time must be in the future');
      }
      if (building.capacity != null && data.attendeeCount != null && data.attendeeCount > building.capacity) {
        throw new ValidationError('Attendee count exceeds the building capacity', {
          capacity: building.capacity,
          attendeeCount: data.attendeeCount
        });
      }

      if (!isApplicantCategoryAllowed(requester, data.applicantCategory)) {
        throw new ValidationError('Applicant category is not assigned to this account');
      }
      const isPublicApplicant = data.applicantCategory === 'UMUM';
      if (data.bookingType !== (isPublicApplicant ? 'RENTAL' : 'INTERNAL')) {
        throw new ValidationError('Booking type does not match the applicant category');
      }
      if (data.bookingType === 'RENTAL' && !building.publicRentalEnabled) {
        throw new ValidationError('Public rental is not enabled for this building');
      }
      if (data.bookingType === 'INTERNAL' && !building.internalLoanEnabled) {
        throw new ValidationError('Internal loan is not enabled for this building');
      }

      const availability = await availabilityService.getAvailability(
        data.buildingId,
        startsAt,
        endsAt,
        tx
      );
      if (!availability.isAvailable) {
        throw new ConflictError('The requested time slot is not available');
      }

      let rateSnapshot = null;
      if (data.bookingType === 'RENTAL') {
        const rate = await tx.buildingRate.findFirst({
          where: {
            buildingId: building.id,
            isActive: true,
            isBookable: true,
            audienceType: 'EXTERNAL',
            validFrom: { lte: startsAt },
            OR: [{ validUntil: null }, { validUntil: { gt: startsAt } }]
          },
          orderBy: [{ validFrom: 'desc' }, { id: 'asc' }]
        });
        if (!rate) {
          throw new ValidationError('No active external rental rate applies to this building and booking time');
        }
        if (rate.maxDurationMinutes != null && endsAt.getTime() - startsAt.getTime() > rate.maxDurationMinutes * 60_000) {
          throw new ValidationError('Booking duration exceeds the selected rental rate limit');
        }

        rateSnapshot = {
          id: rate.id,
          name: rate.name,
          amount: rate.amount.toString(),
          currency: rate.currency,
          unit: rate.unit,
          maxDurationMinutes: rate.maxDurationMinutes,
          audienceType: rate.audienceType,
          validFrom: rate.validFrom.toISOString(),
          validUntil: rate.validUntil?.toISOString() ?? null
        };
      }

      const initialStatus = data.applicantCategory === 'MAHASISWA' ? 'DRAFT' : 'SUBMITTED';
      const publicReference = `BK-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;

      const booking = await tx.booking.create({
        data: {
          publicReference,
          requesterId,
          buildingId: data.buildingId,
          bookingType: data.bookingType,
          applicantCategory: data.applicantCategory,
          eventName: data.eventName,
          eventDescription: data.eventDescription,
          startsAt,
          endsAt,
          attendeeCount: data.attendeeCount,
          status: initialStatus,
          rateSnapshot
        }
      });

      if (initialStatus === 'SUBMITTED') {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            actorId: requesterId,
            fromStatus: 'DRAFT',
            toStatus: initialStatus,
            note: 'Booking submitted'
          }
        });
      }

      await recordAuditEvent(tx, {
        actorId: requesterId,
        action: initialStatus === 'DRAFT' ? 'booking.draft_created' : 'booking.submitted',
        entityType: 'Booking',
        entityId: booking.id,
        metadata: {
          fromStatus: initialStatus === 'DRAFT' ? null : 'DRAFT',
          toStatus: initialStatus,
          bookingType: booking.bookingType
        }
      });

      return booking;
    });

    if (booking.status === 'SUBMITTED') {
      await createNotificationSafely({
        userId: requesterId,
        type: 'BOOKING_SUBMITTED',
        title: 'Pengajuan tercatat',
        body: `Pengajuan ${booking.publicReference} sudah diterima untuk ditinjau.`,
        resourceType: 'Booking',
        resourceId: booking.id
      });
    }

    return toBookingDto(booking);
  }

  async submitDraftBooking(bookingId, requesterId) {
    const booking = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const existing = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { requester: { select: { isActive: true } }, building: { select: { isActive: true } } }
      });
      if (!existing || existing.requesterId !== requesterId) {
        throw new NotFoundError('Booking not found');
      }
      if (!existing.requester.isActive || !existing.building.isActive) {
        throw new ConflictError('Requester and building must remain active');
      }
      if (existing.status !== 'DRAFT' || existing.applicantCategory !== 'MAHASISWA') {
        throw new ConflictError('Only a student draft can be submitted through this route');
      }
      if (existing.startsAt <= new Date()) {
        throw new ConflictError('The booking start time has passed');
      }
      const documentCount = await tx.bookingDocument.count({ where: { bookingId } });
      if (documentCount !== 1) {
        throw new ValidationError('One student PDF is required before submission');
      }
      await availabilityService.lockBuildingSchedule(existing.buildingId, tx);
      const building = await tx.building.findUnique({
        where: { id: existing.buildingId },
        select: { isActive: true, internalLoanEnabled: true }
      });
      if (!building?.isActive || !building.internalLoanEnabled) {
        throw new ConflictError('The building is no longer available for internal loan');
      }
      const availability = await availabilityService.getAvailability(
        existing.buildingId,
        existing.startsAt,
        existing.endsAt,
        tx
      );
      if (!availability.isAvailable) {
        throw new ConflictError('The requested time slot is no longer available');
      }
      const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: 'SUBMITTED' } });
      await tx.bookingStatusHistory.create({
        data: { bookingId, actorId: requesterId, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', note: 'Student booking submitted with required PDF' }
      });
      await recordAuditEvent(tx, {
        actorId: requesterId,
        action: 'booking.submitted',
        entityType: 'Booking',
        entityId: bookingId,
        metadata: { fromStatus: 'DRAFT', toStatus: 'SUBMITTED', applicantCategory: 'MAHASISWA' }
      });
      return updated;
    });

    await createNotificationSafely({
      userId: requesterId,
      type: 'BOOKING_SUBMITTED',
      title: 'Pengajuan tercatat',
      body: `Pengajuan ${booking.publicReference} sudah diterima untuk ditinjau.`,
      resourceType: 'Booking',
      resourceId: booking.id
    });
    return toBookingDto(booking);
  }

  async getBookings(requesterId, page = 1, pageSize = 20, statuses = []) {
    const skip = (page - 1) * pageSize;
    const where = { requesterId, ...(statuses.length ? { status: { in: statuses } } : {}) };
    
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          building: { select: { name: true, slug: true } },
          documents: { select: { id: true, fileName: true, fileSize: true, mimeType: true, createdAt: true } },
          statusHistory: { orderBy: { createdAt: 'asc' } }
        }
      }),
      prisma.booking.count({ where })
    ]);

    return {
      data: data.map(toBookingDto),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getRequesterBookingSummary(requesterId) {
    const grouped = await prisma.booking.groupBy({
      by: ['status'],
      where: { requesterId },
      _count: { _all: true }
    });
    const counts = Object.fromEntries(grouped.map(({ status, _count }) => [status, _count._all]));
    return {
      total: Object.values(counts).reduce((sum, count) => sum + count, 0),
      pending: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'AWAITING_APPROVAL', 'AWAITING_PAYMENT'].reduce((sum, status) => sum + (counts[status] ?? 0), 0),
      confirmed: counts.CONFIRMED ?? 0,
      completed: counts.COMPLETED ?? 0,
      rejected: counts.REJECTED ?? 0
    };
  }

  async reviseStudentBooking(bookingId, requesterId, data) {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const existing = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          requester: { select: { isActive: true } },
          building: { select: { isActive: true, capacity: true } }
        }
      });
      if (!existing || existing.requesterId !== requesterId) {
        throw new NotFoundError('Booking not found');
      }
      if (existing.status !== 'REVISION_REQUESTED' || existing.applicantCategory !== 'MAHASISWA') {
        throw new ConflictError('Only a student booking awaiting revision can be resubmitted');
      }
      if (!existing.requester.isActive || !existing.building.isActive) {
        throw new ConflictError('Requester and building must remain active');
      }
      const startsAt = data.startsAt ? new Date(data.startsAt) : existing.startsAt;
      const endsAt = data.endsAt ? new Date(data.endsAt) : existing.endsAt;
      const attendeeCount = data.attendeeCount === undefined ? existing.attendeeCount : data.attendeeCount;
      if (startsAt <= new Date() || endsAt <= startsAt) {
        throw new ValidationError('Revised booking times must be valid and in the future');
      }
      if (attendeeCount != null && existing.building.capacity != null && attendeeCount > existing.building.capacity) {
        throw new ValidationError('Attendee count exceeds the building capacity');
      }
      const documentCount = await tx.bookingDocument.count({ where: { bookingId } });
      if (documentCount !== 1) {
        throw new ValidationError('One student PDF is required before resubmission');
      }
      await availabilityService.lockBuildingSchedule(existing.buildingId, tx);
      const building = await tx.building.findUnique({
        where: { id: existing.buildingId },
        select: { isActive: true, internalLoanEnabled: true, capacity: true }
      });
      if (!building?.isActive || !building.internalLoanEnabled) {
        throw new ConflictError('The building is no longer available for internal loan');
      }
      if (attendeeCount != null && building.capacity != null && attendeeCount > building.capacity) {
        throw new ValidationError('Attendee count exceeds the building capacity');
      }
      const availability = await availabilityService.getAvailability(existing.buildingId, startsAt, endsAt, tx);
      if (!availability.isAvailable) {
        throw new ConflictError('The requested time slot is no longer available');
      }
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'SUBMITTED',
          eventName: data.eventName ?? existing.eventName,
          eventDescription: data.eventDescription === undefined ? existing.eventDescription : data.eventDescription,
          startsAt,
          endsAt,
          attendeeCount
        }
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          actorId: requesterId,
          fromStatus: 'REVISION_REQUESTED',
          toStatus: 'SUBMITTED',
          note: data.note || 'Student booking resubmitted after revision'
        }
      });
      await recordAuditEvent(tx, {
        actorId: requesterId,
        action: 'booking.revised',
        entityType: 'Booking',
        entityId: bookingId,
        metadata: { fromStatus: 'REVISION_REQUESTED', toStatus: 'SUBMITTED' }
      });
      const operators = await tx.user.findMany({
        where: { isActive: true, roles: { some: { role: { name: 'ADMIN' } } } },
        select: { id: true }
      });
      return { booking: updated, operatorIds: operators.map(({ id }) => id) };
    });

    await Promise.all(result.operatorIds.map((userId) => createNotificationSafely({
      userId,
      type: 'BOOKING_REVISED',
      title: 'Pengajuan diperbaiki',
      body: `Pengajuan ${result.booking.publicReference} siap ditinjau kembali.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    })));
    await createNotificationSafely({
      userId: requesterId,
      type: 'BOOKING_SUBMITTED',
      title: 'Perbaikan pengajuan terkirim',
      body: `Perbaikan pengajuan ${result.booking.publicReference} sudah diterima.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    });
    return toBookingDto(result.booking);
  }

  async cancelBooking(bookingId, requesterId, reason = '') {
    const booking = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const existing = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, requesterId: true, publicReference: true, status: true }
      });

      // Hide records owned by another requester in the same way as missing records.
      if (!existing || existing.requesterId !== requesterId) {
        throw new NotFoundError('Booking not found');
      }

      const cancellableStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED'];
      if (!cancellableStatuses.includes(existing.status)) {
        throw new ConflictError('This booking can no longer be cancelled by the requester');
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason || null,
          cancelledAt: new Date()
        }
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          actorId: requesterId,
          fromStatus: existing.status,
          toStatus: 'CANCELLED',
          note: reason || 'Cancelled by requester'
        }
      });

      await recordAuditEvent(tx, {
        actorId: requesterId,
        action: 'booking.cancelled',
        entityType: 'Booking',
        entityId: bookingId,
        metadata: { fromStatus: existing.status, toStatus: 'CANCELLED' }
      });

      return { booking: updated, publicReference: existing.publicReference };
    });

    await createNotificationSafely({
      userId: requesterId,
      type: 'BOOKING_CANCELLED',
      title: 'Pengajuan dibatalkan',
      body: `Pengajuan ${booking.publicReference} berhasil dibatalkan.`,
      resourceType: 'Booking',
      resourceId: booking.booking.id
    });

    return booking.booking;
  }
}

export const bookingService = new BookingService();
