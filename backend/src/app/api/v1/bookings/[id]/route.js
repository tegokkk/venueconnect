import { prisma } from '@/server/db/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { NotFoundError, ValidationError } from '@/server/errors';
import { toBookingDto } from '@/server/dto/booking.dto';
import { z } from 'zod';
import { getDevelopmentSession } from '@/server/auth/development-session';

export async function GET(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
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
        statusHistory: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Ownership check (in a real app, also check if user is approver or admin)
    if (booking.requesterId !== session.user.id) {
      // Return the same response as a missing record to avoid confirming its existence.
      throw new NotFoundError('Booking not found');
    }

    return successResponse(toBookingDto(booking));
  } catch (error) {
    return errorResponse(error);
  }
}
