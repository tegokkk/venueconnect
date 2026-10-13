import { approvalService } from '@/server/services/approval.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';
import { readJsonBody } from '@/lib/api-request';
import { z } from 'zod';
import { toBookingDto } from '@/server/dto/booking.dto';
import { getDevelopmentSession } from '@/server/auth/development-session';

const rejectionSchema = z.object({
  reason: z.string().trim().min(3).max(2000)
}).strict();

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['APPROVER', 'ADMIN']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }
    const parsedBody = rejectionSchema.safeParse(await readJsonBody(request));
    if (!parsedBody.success) {
      throw new ValidationError('A rejection reason between 3 and 2000 characters is required', parsedBody.error.format());
    }

    const booking = await approvalService.rejectBooking(id, session.user.id, parsedBody.data.reason);
    return successResponse(toBookingDto(booking), 200);
  } catch (error) {
    return errorResponse(error);
  }
}
