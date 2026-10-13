import { buildingService } from '@/server/services/building.service';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { parsePagination } from '@/server/validations/pagination.validation';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    await getDevelopmentSession(request, ['ADMIN']);
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    const result = await buildingService.getAdminBuildings(page, pageSize);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
