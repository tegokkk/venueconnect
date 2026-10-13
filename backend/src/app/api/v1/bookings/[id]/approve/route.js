import { approvalService } from '@/server/services/approval.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';
import { readJsonBody } from '@/lib/api-request';
import { z } from 'zod';
import { toBookingDto } from '@/server/dto/booking.dto';
import { getDevelopmentSession } from '@/server/auth/development-session';

const approvalSchema = z.object({
  note: z.string().trim().max(2000).optional().default(''),
  paymentDueAt: z.string().datetime().optional(),
  paymentTtlHours: z.number().positive().max(720).optional()
}).strict();

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['APPROVER', 'ADMIN']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }
    const parsedBody = approvalSchema.safeParse(await readJsonBody(request));
    if (!parsedBody.success) {
      throw new ValidationError('Invalid approval data', parsedBody.error.format());
    }

    const { note, paymentDueAt, paymentTtlHours } = parsedBody.data;
    const booking = await approvalService.approveBooking(id, session.user.id, note, {
      paymentDueAt,
      paymentTtlHours
    });
    return successResponse(toBookingDto(booking), 200);
  } catch (error) {
    return errorResponse(error);
  }
}
