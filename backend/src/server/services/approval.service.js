import { prisma } from '@/server/db/prisma';
import { NotFoundError, ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from '@/server/errors';
import { availabilityService } from './availability.service';
import { recordAuditEvent } from './audit.service';
import { createNotificationSafely } from './notification.service';
import { lockBookingForUpdate } from '@/server/db/locks';

export class ApprovalService {
  async getPendingApprovalStep(tx, bookingId, actorId) {
    const actor = await tx.user.findUnique({
      where: { id: actorId },
      select: {
        id: true,
        isActive: true,
        roles: { select: { roleId: true, role: { select: { name: true } } } }
      }
    });
    if (!actor?.isActive) {
      throw new UnauthorizedError('An active approver account is required');
    }

    const [step] = await tx.approvalStep.findMany({
      where: { bookingId, status: 'PENDING' },
      orderBy: { stepNumber: 'asc' },
      take: 1
    });
    if (!step) {
      throw new ConflictError('The booking has no pending approval step');
    }

    const isAdmin = actor.roles.some(({ role }) => role.name === 'ADMIN');
    const isAssignedUser = step.assigneeId === actorId;
    const isAssignedRole = !step.assigneeId && actor.roles.some(({ roleId }) => roleId === step.roleId);
    if (!isAdmin && !isAssignedUser && !isAssignedRole) {
      throw new ForbiddenError('This approval step is assigned to another user or role');
    }

    return {
      step,
      adminOverride: isAdmin && !isAssignedUser && !isAssignedRole
    };
  }

  async approveBooking(bookingId, actorId, note = '', options = {}) {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { requester: { select: { isActive: true, accountCategory: true } } }
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.status !== 'AWAITING_APPROVAL') {
        throw new ConflictError(`Cannot approve a booking with status ${booking.status}`);
      }
      if (!booking.requester.isActive || booking.requester.accountCategory !== booking.applicantCategory) {
        throw new ConflictError('Requester account category is no longer eligible for this booking');
      }
      if (booking.startsAt <= new Date()) {
        throw new ConflictError('The booking start time has passed');
      }
      const { step: approvalStep, adminOverride } = await this.getPendingApprovalStep(tx, bookingId, actorId);

      // 1. Verify availability again before locking slot
      // If we are transitioning to AWAITING_PAYMENT or CONFIRMED, it locks the slot
      const nextStatus = booking.bookingType === 'RENTAL' ? 'AWAITING_PAYMENT' : 'CONFIRMED';
      await availabilityService.lockBuildingSchedule(booking.buildingId, tx);
      const building = await tx.building.findUnique({
        where: { id: booking.buildingId },
        select: { isActive: true, internalLoanEnabled: true, publicRentalEnabled: true }
      });
      if (!building?.isActive
        || (booking.bookingType === 'INTERNAL' && !building.internalLoanEnabled)
        || (booking.bookingType === 'RENTAL' && !building.publicRentalEnabled)) {
        throw new ConflictError('The building is no longer available for this booking type');
      }
      
      const availability = await availabilityService.getAvailability(
        booking.buildingId,
        booking.startsAt.toISOString(),
        booking.endsAt.toISOString(),
        tx
      );

      if (!availability.isAvailable) {
        // If it overlaps with another booking, reject this one or throw
        throw new ConflictError('The requested time slot is no longer available');
      }

      let paymentDueAt = null;
      if (nextStatus === 'AWAITING_PAYMENT') {
        if (options.paymentDueAt) {
          const due = new Date(options.paymentDueAt);
          if (!Number.isFinite(due.getTime()) || due <= new Date()) {
            throw new ValidationError('paymentDueAt must be a valid future date');
          }
          if (due >= booking.startsAt) {
            throw new ValidationError('paymentDueAt must be before booking start time');
          }
          paymentDueAt = due;
        } else if (options.paymentTtlHours && Number.isFinite(Number(options.paymentTtlHours)) && Number(options.paymentTtlHours) > 0) {
          const due = new Date(Date.now() + Number(options.paymentTtlHours) * 3600 * 1000);
          paymentDueAt = due < booking.startsAt ? due : new Date(booking.startsAt.getTime() - 3600 * 1000);
        }
      }

      // 3. Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: nextStatus,
          paymentDueAt,
        }
      });

      await tx.approvalStep.update({
        where: { id: approvalStep.id },
        data: { status: 'APPROVED' }
      });
      await tx.approvalHistory.create({
        data: {
          stepId: approvalStep.id,
          actorId,
          outcome: 'APPROVED',
          note: note || null
        }
      });

      // 4. Record status history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          actorId,
          fromStatus: booking.status,
          toStatus: nextStatus,
          note: note || 'Approved by operator',
        }
      });

      await recordAuditEvent(tx, {
        actorId,
        action: 'booking.approved',
        entityType: 'Booking',
        entityId: booking.id,
        metadata: { fromStatus: booking.status, toStatus: nextStatus, adminOverride }
      });

      return { booking: updatedBooking, requesterId: booking.requesterId };
    });

    const awaitingPayment = result.booking.status === 'AWAITING_PAYMENT';
    await createNotificationSafely({
      userId: result.requesterId,
      type: awaitingPayment ? 'AWAITING_PAYMENT' : 'BOOKING_APPROVED',
      title: awaitingPayment ? 'Pengajuan disetujui, menunggu pembayaran' : 'Pengajuan disetujui',
      body: awaitingPayment
        ? `Pengajuan ${result.booking.publicReference} disetujui. Informasi pembayaran menunggu konfirmasi pengelola.`
        : `Pengajuan ${result.booking.publicReference} mendapat keputusan.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    });

    return result.booking;
  }

  async rejectBooking(bookingId, actorId, reason = '') {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.status !== 'AWAITING_APPROVAL') {
        throw new ConflictError(`Cannot reject a booking with status ${booking.status}`);
      }

      const { step: approvalStep, adminOverride } = await this.getPendingApprovalStep(tx, bookingId, actorId);

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
        }
      });

      await tx.approvalStep.update({
        where: { id: approvalStep.id },
        data: { status: 'REJECTED' }
      });
      await tx.approvalHistory.create({
        data: {
          stepId: approvalStep.id,
          actorId,
          outcome: 'REJECTED',
          note: reason
        }
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          actorId,
          fromStatus: booking.status,
          toStatus: 'REJECTED',
          note: reason || 'Rejected by operator',
        }
      });

      await recordAuditEvent(tx, {
        actorId,
        action: 'booking.rejected',
        entityType: 'Booking',
        entityId: booking.id,
        metadata: { fromStatus: booking.status, toStatus: 'REJECTED', adminOverride }
      });

      return { booking: updatedBooking, requesterId: booking.requesterId };
    });

    await createNotificationSafely({
      userId: result.requesterId,
      type: 'BOOKING_REJECTED',
      title: 'Status pengajuan berubah',
      body: `Pengajuan ${result.booking.publicReference} mendapat keputusan.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    });

    return result.booking;
  }
  async forwardBookingForApproval(bookingId, actorId, note = '') {
    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { requester: true }
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (!booking.requester?.isActive) {
        throw new UnauthorizedError('An active requester account is required');
      }
      if (!booking.requester.accountCategory || booking.requester.accountCategory !== booking.applicantCategory) {
        throw new ConflictError('Requester account category is no longer eligible for this booking');
      }

      const actor = await tx.user.findUnique({
        where: { id: actorId },
        select: { isActive: true, roles: { select: { role: { select: { name: true } } } } }
      });
      if (!actor?.isActive || !actor.roles.some(({ role }) => role.name === 'ADMIN')) {
        throw new ForbiddenError('An active operator is required');
      }
      if (booking.status !== 'UNDER_REVIEW') {
        throw new ConflictError(`Cannot forward a booking from status ${booking.status}`);
      }
      const category = booking.applicantCategory;
      if (category === 'MAHASISWA') {
        throw new ConflictError('A student booking requires an explicit operator decision');
      }
      const validInternal = category === 'DOSEN_PEGAWAI' && booking.bookingType === 'INTERNAL' && booking.requester.userType === 'INTERNAL';
      const validPublic = category === 'UMUM' && booking.bookingType === 'RENTAL' && booking.requester.userType === 'EXTERNAL';
      if (!validInternal && !validPublic) {
        throw new ValidationError('Booking category and requester account do not match');
      }
      if (booking.startsAt <= new Date()) {
        throw new ConflictError('The booking start time has passed');
      }
      await availabilityService.lockBuildingSchedule(booking.buildingId, tx);
      const building = await tx.building.findUnique({
        where: { id: booking.buildingId },
        select: { isActive: true, internalLoanEnabled: true, publicRentalEnabled: true }
      });
      if (!building?.isActive
        || (booking.bookingType === 'INTERNAL' && !building.internalLoanEnabled)
        || (booking.bookingType === 'RENTAL' && !building.publicRentalEnabled)) {
        throw new ConflictError('The building is no longer available for this booking type');
      }
      const availability = await availabilityService.getAvailability(
        booking.buildingId, booking.startsAt, booking.endsAt, tx
      );
      if (!availability.isAvailable) {
        throw new ConflictError('The requested time slot is no longer available');
      }

      // Generic development assignment; the process owner must configure actual assignees.
      const approverRole = await tx.role.findUnique({ where: { name: 'APPROVER' } });
      if (!approverRole) {
        throw new ConflictError('No approver role is configured for this booking');
      }
      const nextStatus = 'AWAITING_APPROVAL';

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: nextStatus }
      });

      await tx.approvalStep.create({
        data: {
          bookingId: booking.id,
          stepNumber: 1,
          roleId: approverRole.id,
          status: 'PENDING'
        }
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          actorId,
          fromStatus: booking.status,
          toStatus: nextStatus,
          note: note || 'Forwarded to configured approver role',
        }
      });

      await recordAuditEvent(tx, {
        actorId,
        action: 'booking.routed',
        entityType: 'Booking',
        entityId: booking.id,
        metadata: {
          fromStatus: booking.status,
          toStatus: nextStatus,
          bookingType: booking.bookingType,
          applicantCategory: category
        }
      });

      const approvers = await tx.userRole.findMany({
        where: { roleId: approverRole.id, user: { is: { isActive: true } } },
        select: { userId: true }
      });
      return { booking: updatedBooking, requesterId: booking.requesterId, approverIds: approvers.map(({ userId }) => userId) };
    });

    await createNotificationSafely({
      userId: result.requesterId,
      type: 'BOOKING_REVIEW_UPDATED',
      title: 'Status pengajuan berubah',
      body: `Pengajuan ${result.booking.publicReference} sedang diproses.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    });

    await Promise.all(result.approverIds.map((userId) => createNotificationSafely({
      userId,
      type: 'BOOKING_AWAITING_APPROVAL',
      title: 'Pengajuan menunggu keputusan',
      body: `Pengajuan ${result.booking.publicReference} menunggu keputusan pada peran Anda.`,
      resourceType: 'Booking',
      resourceId: result.booking.id
    })));

    return result.booking;
  }
}

export const approvalService = new ApprovalService();
