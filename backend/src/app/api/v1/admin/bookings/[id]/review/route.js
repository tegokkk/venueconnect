import { z } from 'zod';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { approvalService } from '@/server/services/approval.service';
import { operatorReviewService } from '@/server/services/operator-review.service';
import { toBookingDto } from '@/server/dto/booking.dto';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

const reviewSchema = z.object({
  action: z.enum(['START_REVIEW', 'REQUEST_REVISION', 'FORWARD', 'CONFIRM_STUDENT', 'REJECT']),
  note: z.string().trim().max(2000).optional().default('')
}).strict().refine(
  ({ action, note }) => !['REQUEST_REVISION', 'REJECT'].includes(action) || note.length >= 3,
  { path: ['note'], message: 'A reason of at least 3 characters is required' }
);

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }
    const parsed = reviewSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid review decision', parsed.error.format());
    }
    const { action, note } = parsed.data;
    const booking = action === 'FORWARD'
      ? toBookingDto(await approvalService.forwardBookingForApproval(id, session.user.id, note))
      : await operatorReviewService.decide(id, session.user.id, action, note);
    return successResponse(booking);
  } catch (error) {
    return errorResponse(error);
  }
}
