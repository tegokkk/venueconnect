import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { notificationService } from '@/server/services/notification.service';
import { ValidationError } from '@/server/errors';

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Notification id must be a UUID');
    }

    const notification = await notificationService.markRead(id, session.user.id);
    return successResponse(notification);
  } catch (error) {
    return errorResponse(error);
  }
}
