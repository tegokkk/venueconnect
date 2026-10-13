import { bookingService } from '@/server/services/booking.service';
import { createBookingSchema } from '@/server/validations/booking.validation';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';
import { parsePagination } from '@/server/validations/pagination.validation';
import { readJsonBody } from '@/lib/api-request';
import { getDevelopmentSession } from '@/server/auth/development-session';

const bookingStatuses = new Set(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'AWAITING_APPROVAL', 'AWAITING_PAYMENT', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED']);

export async function POST(request) {
  try {
    const session = await getDevelopmentSession(request);
    const body = await readJsonBody(request);

    const parsedData = createBookingSchema.safeParse(body);
    if (!parsedData.success) {
      throw new ValidationError('Invalid booking data', parsedData.error.format());
    }

    const booking = await bookingService.createBooking(parsedData.data, session.user.id);
    return successResponse(booking, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request) {
  try {
    const session = await getDevelopmentSession(request);
    
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    const status = searchParams.get('status')?.split(',').filter(Boolean) ?? [];
    if (status.length > 10 || status.some((value) => !bookingStatuses.has(value))) {
      throw new ValidationError('Invalid booking status filter');
    }

    const result = await bookingService.getBookings(session.user.id, page, pageSize, status);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
