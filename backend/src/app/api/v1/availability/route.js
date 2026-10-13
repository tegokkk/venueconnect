import { connection } from 'next/server';
import { availabilityService } from '@/server/services/availability.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';
import { NotFoundError, ValidationError } from '@/server/errors';
import { prisma } from '@/server/db/prisma';

const MAX_AVAILABILITY_RANGE_MS = 366 * 24 * 60 * 60 * 1000;

const querySchema = z.object({
  buildingId: z.string().uuid(),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true })
}).refine(
  ({ startDate, endDate }) => {
    const rangeMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    return rangeMs > 0 && rangeMs <= MAX_AVAILABILITY_RANGE_MS;
  },
  {
    message: 'Date range must be positive and no longer than 366 days',
    path: ['endDate']
  }
);

export async function GET(request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      buildingId: searchParams.get('buildingId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    };

    const parsedQuery = querySchema.safeParse(query);
    if (!parsedQuery.success) {
      throw new ValidationError('Invalid query parameters', parsedQuery.error.format());
    }

    const { buildingId, startDate, endDate } = parsedQuery.data;
    const publicBuilding = await prisma.building.findFirst({
      where: { id: buildingId, isActive: true },
      select: { id: true }
    });
    if (!publicBuilding) {
      throw new NotFoundError('Building not found');
    }

    const result = await availabilityService.getAvailability(buildingId, startDate, endDate);
    
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
