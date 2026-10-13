export function toNotificationDto(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    resourceType: notification.resourceType,
    resourceId: notification.resourceId,
    readAt: notification.readAt,
    createdAt: notification.createdAt
  };
}
