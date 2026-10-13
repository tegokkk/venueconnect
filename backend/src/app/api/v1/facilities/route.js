import { facilityService } from '@/server/services/facility.service';
import { createFacilitySchema } from '@/server/validations/facility.validation';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';
import { parsePagination } from '@/server/validations/pagination.validation';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    const result = await facilityService.getFacilities(page, pageSize);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const parsed = createFacilitySchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid facility data', parsed.error.format());
    }

    return successResponse(await facilityService.createFacility(parsed.data, session.user.id), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
