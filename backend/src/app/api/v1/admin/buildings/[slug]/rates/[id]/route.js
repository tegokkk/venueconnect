import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api-response';
import { readJsonBody } from '@/lib/api-request';
import { NotFoundError, ValidationError } from '@/server/errors';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { prisma } from '@/server/db/prisma';
import { buildingRateService } from '@/server/services/building-rate.service';
import { updateBuildingRateSchema } from '@/server/validations/building-rate.validation';

export async function PATCH(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug, id } = await params;
    if (!z.string().uuid().safeParse(id).success) throw new ValidationError('Rate id must be a UUID');

    const building = await prisma.building.findUnique({ where: { slug }, select: { id: true } });
    if (!building) throw new NotFoundError('Building not found');
    const body = await readJsonBody(request);
    const parsed = updateBuildingRateSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Invalid building rate data', parsed.error.format());

    const rate = await buildingRateService.updateRate(building.id, id, parsed.data, session.user.id);
    return successResponse(rate);
  } catch (error) {
    return errorResponse(error);
  }
}
