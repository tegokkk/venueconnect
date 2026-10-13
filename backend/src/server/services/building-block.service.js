import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError } from '@/server/errors';
import { availabilityService } from './availability.service';
import { recordAuditEvent } from './audit.service';

export class BuildingBlockService {
  async getBlocks(buildingId, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = { buildingId };
    const [blocks, total] = await Promise.all([
      prisma.buildingBlock.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ startsAt: 'asc' }, { id: 'asc' }]
      }),
      prisma.buildingBlock.count({ where })
    ]);
    return { data: blocks, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async createBlock(data, actorId) {
    return prisma.$transaction(async (tx) => {
      await availabilityService.lockBuildingSchedule(data.buildingId, tx);
      const building = await tx.building.findUnique({
        where: { id: data.buildingId }
      });

      if (!building) {
        throw new NotFoundError('Building not found');
      }

      const startsAt = new Date(data.startsAt);
      const endsAt = new Date(data.endsAt);
      const overlappingBookings = await tx.booking.findMany({
        where: {
          buildingId: data.buildingId,
          status: { in: ['AWAITING_PAYMENT', 'CONFIRMED'] },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt }
        },
        select: { id: true }
      });

      if (overlappingBookings.length > 0) {
        throw new ConflictError('Cannot block schedule while active bookings use this period');
      }

      const block = await tx.buildingBlock.create({
        data: {
          buildingId: data.buildingId,
          startsAt,
          endsAt,
          reason: data.reason,
          createdById: actorId
        }
      });

      await recordAuditEvent(tx, {
        actorId,
        action: 'building_block.created',
        entityType: 'BuildingBlock',
        entityId: block.id,
        metadata: {
          buildingId: data.buildingId,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString()
        }
      });

      return block;
    });
  }

  async deleteBlock(buildingId, blockId, actorId) {
    return prisma.$transaction(async (tx) => {
      await availabilityService.lockBuildingSchedule(buildingId, tx);

      const block = await tx.buildingBlock.findFirst({
        where: { id: blockId, buildingId }
      });
      if (!block) {
        throw new NotFoundError('Schedule block not found');
      }

      await tx.buildingBlock.delete({ where: { id: block.id } });
      await recordAuditEvent(tx, {
        actorId,
        action: 'building_block.deleted',
        entityType: 'BuildingBlock',
        entityId: block.id,
        metadata: {
          buildingId,
          startsAt: block.startsAt.toISOString(),
          endsAt: block.endsAt.toISOString()
        }
      });

      return block;
    });
  }
}

export const buildingBlockService = new BuildingBlockService();
