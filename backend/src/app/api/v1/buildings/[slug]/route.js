import { buildingService } from '@/server/services/building.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { updateBuildingSchema } from '@/server/validations/building-admin.validation';
import { readJsonBody } from '@/lib/api-request';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { ValidationError } from '@/server/errors';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const building = await buildingService.getBuildingDetails(slug);
    return successResponse(building);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug } = await params;
    const parsed = updateBuildingSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid building data', parsed.error.format());
    }

    const building = await buildingService.updateBuildingBySlug(slug, parsed.data, session.user.id);
    return successResponse(building);
  } catch (error) {
    return errorResponse(error);
  }
}
