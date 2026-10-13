import { prisma } from '@/server/db/prisma';
import { NotFoundError } from '@/server/errors';
import { toNotificationDto } from '@/server/dto/notification.dto';

export async function createNotificationSafely({ userId, type, title, body, resourceType, resourceId }) {
  if (!userId) return;

  try {
    await prisma.notification.create({
      data: { userId, type, title, body, resourceType, resourceId }
    });
  } catch {
    // Notification delivery must not turn a committed business action into a failure.
    console.warn('In-app notification could not be created');
  }
}

export class NotificationService {
  async getInbox(userId, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = { userId };
    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } })
    ]);

    return {
      data: items.map(toNotificationDto),
      meta: { total, unreadCount, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async markRead(notificationId, userId) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.notification.findFirst({
        where: { id: notificationId, userId },
        select: { id: true }
      });
      if (!existing) throw new NotFoundError('Notification not found');

      await tx.notification.updateMany({
        where: { id: notificationId, userId, readAt: null },
        data: { readAt: new Date() }
      });

      const notification = await tx.notification.findFirst({
        where: { id: notificationId, userId }
      });
      return toNotificationDto(notification);
    });
  }
}

export const notificationService = new NotificationService();
