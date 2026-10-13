import { z } from 'zod';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { bookingService } from '@/server/services/booking.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }
    const booking = await bookingService.submitDraftBooking(id, session.user.id);
    return successResponse(booking);
  } catch (error) {
    return errorResponse(error);
  }
}
