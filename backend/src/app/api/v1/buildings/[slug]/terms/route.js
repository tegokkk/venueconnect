import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';
import { buildingService } from '@/server/services/building.service';

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const identifier = z.string().trim().min(1).max(100).safeParse(slug);
    if (!identifier.success) {
      throw new ValidationError('Building identifier is invalid');
    }

    return successResponse(await buildingService.getBuildingTerms(identifier.data));
  } catch (error) {
    return errorResponse(error);
  }
}
