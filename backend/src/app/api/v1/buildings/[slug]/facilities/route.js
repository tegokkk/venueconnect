import { facilityService } from '@/server/services/facility.service';
import { attachFacilitySchema } from '@/server/validations/facility.validation';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug } = await params;
    const parsed = attachFacilitySchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid building facility data', parsed.error.format());
    }

    const relation = await facilityService.attachToBuilding(slug, parsed.data, session.user.id);
    return successResponse(relation, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
