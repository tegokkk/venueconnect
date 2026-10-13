import { bookingService } from '@/server/services/booking.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getDevelopmentSession } from '@/server/auth/development-session';

export async function GET(request) {
  try {
    const session = await getDevelopmentSession(request);
    const summary = await bookingService.getRequesterBookingSummary(session.user.id);
    return successResponse(summary);
  } catch (error) {
    return errorResponse(error);
  }
}
