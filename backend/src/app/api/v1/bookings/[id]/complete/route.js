import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { toBookingDto } from '@/server/dto/booking.dto';
import { usageService } from '@/server/services/usage.service';
import { ValidationError } from '@/server/errors';

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }

    const booking = await usageService.completeBooking(id, session.user.id);
    return successResponse(toBookingDto(booking));
  } catch (error) {
    return errorResponse(error);
  }
}
