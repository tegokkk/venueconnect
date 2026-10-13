import { z } from 'zod';
import { bookingExpiryService } from '@/server/services/booking-expiry.service';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { ValidationError } from '@/server/errors';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';

const expireSchema = z.object({
  bookingId: z.string().uuid().optional(),
  cutoff: z.string().datetime().optional(),
  force: z.boolean().optional().default(false),
  reason: z.string().trim().max(500).optional()
}).strict();

export async function POST(request) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const rawBody = await readJsonBody(request);
    const parsedBody = expireSchema.safeParse(rawBody ?? {});
    if (!parsedBody.success) {
      throw new ValidationError('Invalid expiry request data', parsedBody.error.format());
    }

    const { bookingId, cutoff, force, reason } = parsedBody.data;
    const cutoffDate = cutoff ? new Date(cutoff) : new Date();

    if (bookingId) {
      const result = await bookingExpiryService.expireOverdueBooking(bookingId, {
        actorId: session.user.id,
        cutoff: cutoffDate,
        force,
        reason
      });
      return successResponse(result, 200);
    }

    const result = await bookingExpiryService.expireAllOverdueBookings({
      cutoff: cutoffDate,
      actorId: session.user.id
    });
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
