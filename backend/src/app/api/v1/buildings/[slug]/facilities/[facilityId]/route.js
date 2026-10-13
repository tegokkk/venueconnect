import { z } from 'zod';
import { facilityService } from '@/server/services/facility.service';
import { updateBuildingFacilitySchema } from '@/server/validations/facility.validation';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

export async function PATCH(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug, facilityId } = await params;
    if (!z.string().uuid().safeParse(facilityId).success) {
      throw new ValidationError('Facility id must be a UUID');
    }
    const parsed = updateBuildingFacilitySchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid building facility data', parsed.error.format());
    }

    const relation = await facilityService.updateBuildingFacilityDetail(
      slug,
      facilityId,
      parsed.data.detail,
      session.user.id
    );
    return successResponse(relation);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug, facilityId } = await params;
    if (!z.string().uuid().safeParse(facilityId).success) {
      throw new ValidationError('Facility id must be a UUID');
    }

    return successResponse(
      await facilityService.detachFromBuilding(slug, facilityId, session.user.id)
    );
  } catch (error) {
    return errorResponse(error);
  }
}
