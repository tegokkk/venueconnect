import { z } from 'zod';
import { prisma } from '@/server/db/prisma';
import { buildingBlockService } from '@/server/services/building-block.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError, ValidationError } from '@/server/errors';
import { getDevelopmentSession } from '@/server/auth/development-session';

export async function DELETE(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['ADMIN']);
    const { slug, id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Schedule block id must be a UUID');
    }

    const building = await prisma.building.findUnique({
      where: { slug },
      select: { id: true }
    });
    if (!building) {
      throw new NotFoundError('Building not found');
    }

    const block = await buildingBlockService.deleteBlock(building.id, id, session.user.id);
    return successResponse({ id: block.id });
  } catch (error) {
    return errorResponse(error);
  }
}
