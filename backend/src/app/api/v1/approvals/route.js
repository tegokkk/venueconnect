import { prisma } from '@/server/db/prisma';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { parsePagination } from '@/server/validations/pagination.validation';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const session = await getDevelopmentSession(request, ['APPROVER', 'ADMIN']);
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    const isAdmin = session.user.roles.includes('ADMIN');
    const assignedRoles = isAdmin ? [] : await prisma.role.findMany({
      where: { name: { in: session.user.roles } },
      select: { id: true }
    });
    const where = {
      status: 'PENDING',
      stepNumber: 1,
      booking: { is: { status: 'AWAITING_APPROVAL' } },
      ...(!isAdmin ? {
        OR: [
          { assigneeId: session.user.id },
          { assigneeId: null, roleId: { in: assignedRoles.map(({ id }) => id) } }
        ]
      } : {})
    };
    const [steps, total] = await Promise.all([
      prisma.approvalStep.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          createdAt: true,
          booking: {
            select: {
              id: true,
              publicReference: true,
              applicantCategory: true,
              bookingType: true,
              eventName: true,
              startsAt: true,
              endsAt: true,
              building: { select: { name: true } }
            }
          }
        }
      }),
      prisma.approvalStep.count({ where })
    ]);
    return successResponse(steps, 200, {
      total, page, pageSize, totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return errorResponse(error);
  }
}
