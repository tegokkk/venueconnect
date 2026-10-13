import { buildingBlockService } from '@/server/services/building-block.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError, ValidationError } from '@/server/errors';
import { z } from 'zod';
import { prisma } from '@/server/db/prisma';
import { readJsonBody } from '@/lib/api-request';
import { toBuildingBlockDto } from '@/server/dto/building.dto';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { parsePagination } from '@/server/validations/pagination.validation';

export async function GET(request, { params }) {
  try {
    await getDevelopmentSession(request, ['ADMIN']);
    const { slug } = await params;
    const building = await prisma.building.findUnique({ where: { slug }, select: { id: true } });
    if (!building) throw new NotFoundError('Building not found');

    const { page, pageSize } = parsePagination(new URL(request.url).searchParams);
    const result = await buildingBlockService.getBlocks(building.id, page, pageSize);
    return successResponse(result.data.map(toBuildingBlockDto), 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

const blockSchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  reason: z.string().trim().min(3).max(500)
}).strict().refine(
  ({ startsAt, endsAt }) => new Date(endsAt) > new Date(startsAt),
  { message: 'endsAt must be later than startsAt', path: ['endsAt'] }
);

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug } = await params;
    
    const building = await prisma.building.findUnique({
      where: { slug }
    });

    if (!building) {
        throw new NotFoundError('Building not found');
    }

    const body = await readJsonBody(request);
    const parsedData = blockSchema.safeParse(body);
    
    if (!parsedData.success) {
      throw new ValidationError('Invalid block data', parsedData.error.format());
    }

    const block = await buildingBlockService.createBlock({
      buildingId: building.id,
      ...parsedData.data
    }, session.user.id);
    
    return successResponse(toBuildingBlockDto(block), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
