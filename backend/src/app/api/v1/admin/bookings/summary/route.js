import { bookingService } from '@/server/services/booking.service';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    await getDevelopmentSession(request, ['ADMIN']);
    const summary = await bookingService.getAdminOverview();
    return successResponse(summary);
  } catch (error) {
    return errorResponse(error);
  }
}
