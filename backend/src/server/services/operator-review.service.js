import { prisma } from '@/server/db/prisma';
import { lockBookingForUpdate } from '@/server/db/locks';
import { availabilityService } from './availability.service';
import { recordAuditEvent } from './audit.service';
import { createNotificationSafely } from './notification.service';
import { ConflictError, ForbiddenError, NotFoundError } from '@/server/errors';
import { toBookingDto } from '@/server/dto/booking.dto';

const transitions = {
  START_REVIEW: { from: 'SUBMITTED', to: 'UNDER_REVIEW', action: 'booking.review_started' },
  REQUEST_REVISION: { from: 'UNDER_REVIEW', to: 'REVISION_REQUESTED', action: 'booking.revision_requested' },
  CONFIRM_STUDENT: { from: 'UNDER_REVIEW', to: 'CONFIRMED', action: 'booking.student_confirmed' },
  REJECT: { from: 'UNDER_REVIEW', to: 'REJECTED', action: 'booking.rejected_by_operator' }
};

export class OperatorReviewService {
  async decide(bookingId, actorId, action, note = '') {
    const transition = transitions[action];
    if (!transition) throw new ConflictError('Unsupported review action');

    const result = await prisma.$transaction(async (tx) => {
      await lockBookingForUpdate(bookingId, tx);
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { requester: { select: { isActive: true, accountCategory: true } } }
      });
      if (!booking) throw new NotFoundError('Booking not found');
      const actor = await tx.user.findUnique({
        where: { id: actorId },
        select: { isActive: true, roles: { select: { role: { select: { name: true } } } } }
      });
      if (!actor?.isActive || !actor.roles.some(({ role }) => role.name === 'ADMIN')) {
        throw new ForbiddenError('An active operator is required');
      }
      if (booking.status !== transition.from) {
        throw new ConflictError(`Cannot apply ${action} to a booking with status ${booking.status}`);
      }
      if (['REQUEST_REVISION', 'CONFIRM_STUDENT'].includes(action)
        && (!booking.requester.isActive || booking.requester.accountCategory !== booking.applicantCategory)) {
        throw new ConflictError('Requester account category is no longer eligible for this booking');
      }

      if (action === 'REQUEST_REVISION' && booking.applicantCategory !== 'MAHASISWA') {
        throw new ConflictError('Revision requests are currently supported only for student bookings');
      }

      if (action === 'CONFIRM_STUDENT') {
        if (booking.applicantCategory !== 'MAHASISWA' || booking.bookingType !== 'INTERNAL') {
          throw new ConflictError('Only a student internal booking can receive this operator decision');
        }
        if (booking.startsAt <= new Date()) {
          throw new ConflictError('The booking start time has passed');
        }
        const documentCount = await tx.bookingDocument.count({ where: { bookingId } });
        if (documentCount !== 1) {
          throw new ConflictError('One student PDF must be present before confirmation');
        }
        await availabilityService.lockBuildingSchedule(booking.buildingId, tx);
        const building = await tx.building.findUnique({
          where: { id: booking.buildingId },
          select: { isActive: true, internalLoanEnabled: true }
        });
        if (!building?.isActive || !building.internalLoanEnabled) {
          throw new ConflictError('The building is no longer available for internal loan');
        }
        const availability = await availabilityService.getAvailability(
          booking.buildingId, booking.startsAt, booking.endsAt, tx
        );
        if (!availability.isAvailable) {
          throw new ConflictError('The requested time slot is no longer available');
        }
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: transition.to }
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          actorId,
          fromStatus: transition.from,
          toStatus: transition.to,
          note: note || (action === 'START_REVIEW' ? 'Review started' : 'Operator decision recorded')
        }
      });
      await recordAuditEvent(tx, {
        actorId,
        action: transition.action,
        entityType: 'Booking',
        entityId: bookingId,
        metadata: { fromStatus: transition.from, toStatus: transition.to }
      });
      return updated;
    });

    await createNotificationSafely({
      userId: result.requesterId,
      type: action === 'CONFIRM_STUDENT' ? 'BOOKING_APPROVED' : action === 'REJECT' ? 'BOOKING_REJECTED' : 'BOOKING_REVIEW_UPDATED',
      title: action === 'REQUEST_REVISION' ? 'Perbaikan pengajuan diperlukan' : 'Status pengajuan berubah',
      body: `Status pengajuan ${result.publicReference} berubah menjadi ${result.status}.`,
      resourceType: 'Booking',
      resourceId: result.id
    });
    return toBookingDto(result);
  }
}

export const operatorReviewService = new OperatorReviewService();
