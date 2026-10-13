import { successResponse, errorResponse } from '@/lib/api-response';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { parsePagination } from '@/server/validations/pagination.validation';
import { notificationService } from '@/server/services/notification.service';

export async function GET(request) {
  try {
    const session = await getDevelopmentSession(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    const result = await notificationService.getInbox(session.user.id, page, pageSize);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
