import { z } from 'zod';
import { prisma } from '@/server/db/prisma';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { NotFoundError, ValidationError } from '@/server/errors';
import { toBookingDto } from '@/server/dto/booking.dto';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request, { params }) {
  try {
    await getDevelopmentSession(request, ['ADMIN']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        building: { select: { name: true, slug: true } },
        documents: { select: { id: true, fileName: true, fileSize: true, mimeType: true, createdAt: true } },
        payments: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      }
    });
    if (!booking) throw new NotFoundError('Booking not found');

    return successResponse(toBookingDto(booking));
  } catch (error) {
    return errorResponse(error);
  }
}
