import { successResponse, errorResponse } from '@/lib/api-response';
import { readJsonBody } from '@/lib/api-request';
import { NotFoundError, ValidationError } from '@/server/errors';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { prisma } from '@/server/db/prisma';
import { buildingRateService } from '@/server/services/building-rate.service';
import { createBuildingRateSchema } from '@/server/validations/building-rate.validation';
import { parsePagination } from '@/server/validations/pagination.validation';

export async function GET(request, { params }) {
  try {
    await getDevelopmentSession(request, ['ADMIN']);
    const { slug } = await params;
    const building = await prisma.building.findUnique({ where: { slug }, select: { id: true } });
    if (!building) throw new NotFoundError('Building not found');

    const { page, pageSize } = parsePagination(new URL(request.url).searchParams);
    const result = await buildingRateService.getRates(building.id, page, pageSize);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug } = await params;
    const building = await prisma.building.findUnique({ where: { slug }, select: { id: true } });
    if (!building) throw new NotFoundError('Building not found');

    const body = await readJsonBody(request);
    const parsed = createBuildingRateSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Invalid building rate data', parsed.error.format());

    const rate = await buildingRateService.createRate(building.id, parsed.data, session.user.id);
    return successResponse(rate, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
