import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api-response';
import { readJsonBody } from '@/lib/api-request';
import { ValidationError } from '@/server/errors';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { bookingService } from '@/server/services/booking.service';
import { toBookingDto } from '@/server/dto/booking.dto';

const cancelSchema = z.object({
  reason: z.string().trim().max(500).optional().default('')
}).strict();

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }

    const parsedBody = cancelSchema.safeParse(await readJsonBody(request));
    if (!parsedBody.success) {
      throw new ValidationError('Invalid cancellation data', parsedBody.error.format());
    }

    const booking = await bookingService.cancelBooking(id, session.user.id, parsedBody.data.reason);
    return successResponse(toBookingDto(booking));
  } catch (error) {
    return errorResponse(error);
  }
}
