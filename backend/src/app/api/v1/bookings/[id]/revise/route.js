import { z } from 'zod';
import { bookingService } from '@/server/services/booking.service';
import { studentRevisionSchema } from '@/server/validations/booking.validation';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }

    const parsed = studentRevisionSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid student revision', parsed.error.format());
    }
    const booking = await bookingService.reviseStudentBooking(id, session.user.id, parsed.data);
    return successResponse(booking);
  } catch (error) {
    return errorResponse(error);
  }
}
