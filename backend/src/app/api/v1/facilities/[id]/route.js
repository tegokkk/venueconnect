import { z } from 'zod';
import { facilityService } from '@/server/services/facility.service';
import { updateFacilitySchema } from '@/server/validations/facility.validation';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

export async function PATCH(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Facility id must be a UUID');
    }

    const parsed = updateFacilitySchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid facility data', parsed.error.format());
    }

    return successResponse(await facilityService.updateFacility(id, parsed.data, session.user.id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Facility id must be a UUID');
    }

    return successResponse(await facilityService.deleteFacility(id, session.user.id));
  } catch (error) {
    return errorResponse(error);
  }
}
