import { ForbiddenError, UnauthorizedError } from '@/server/errors';
import { prisma } from '@/server/db/prisma';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getDevelopmentSession(request, roles = []) {
  if (process.env.NODE_ENV === 'production') {
    throw new UnauthorizedError('Authentication is not configured');
  }

  const userId = request.headers.get('x-user-id');
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw new UnauthorizedError('A valid development user id is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
      roles: { select: { role: { select: { name: true } } } }
    }
  });

  if (!user?.isActive) {
    throw new UnauthorizedError('A valid active development user is required');
  }

  const actualRoles = user.roles.map(({ role }) => role.name);
  const hasRequiredRole = roles.length === 0
    || roles.some((role) => actualRoles.includes(role));

  if (!hasRequiredRole) {
    throw new ForbiddenError('The development user does not have the required role');
  }

  return { user: { id: user.id, roles: actualRoles } };
}
