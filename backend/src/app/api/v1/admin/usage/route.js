import { getDevelopmentSession } from '@/server/auth/development-session';
import { errorResponse, successResponse } from '@/lib/api-response';
import { parsePagination } from '@/server/validations/pagination.validation';
import { usageService } from '@/server/services/usage.service';

export async function GET(request) {
  try {
    await getDevelopmentSession(request, ['ADMIN', 'BUILDING_OFFICER']);
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    const result = await usageService.getAdminUsage(page, pageSize);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
