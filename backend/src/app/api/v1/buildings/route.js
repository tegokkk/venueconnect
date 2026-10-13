import { connection } from 'next/server';
import { buildingService } from '@/server/services/building.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { parsePagination } from '@/server/validations/pagination.validation';
import { parseBuildingCatalogFilters } from '@/server/validations/building.validation';
import { ValidationError } from '@/server/errors';
import { createBuildingSchema } from '@/server/validations/building-admin.validation';
import { readJsonBody } from '@/lib/api-request';
import { getDevelopmentSession } from '@/server/auth/development-session';

export async function GET(request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    
    // For public catalog, only show active buildings
    const filters = {
      isActive: true,
      ...parseBuildingCatalogFilters(searchParams)
    };
    if (filters.purpose === 'loan') filters.internalLoanEnabled = true;
    if (filters.purpose === 'rental') filters.publicRentalEnabled = true;
    delete filters.purpose;
    
    // If a specific query for public rental is requested
    const forPublicRental = searchParams.get('publicRental');
    if (forPublicRental === 'true') {
      filters.publicRentalEnabled = true;
    } else if (forPublicRental !== null && forPublicRental !== 'false') {
      throw new ValidationError('publicRental must be true or false');
    }

    const result = await buildingService.getBuildings(page, pageSize, filters);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const parsed = createBuildingSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('Invalid building data', parsed.error.format());
    }

    const building = await buildingService.createBuilding(parsed.data, session.user.id);
    return successResponse(building, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
