import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError } from '@/server/errors';
import { recordAuditEvent } from './audit.service';

const toFacilityDto = ({ id, name, description }) => ({ id, name, description });

export class FacilityService {
  async getFacilities(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [facilities, total] = await Promise.all([
      prisma.facility.findMany({
        skip,
        take: pageSize,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        select: { id: true, name: true, description: true }
      }),
      prisma.facility.count()
    ]);

    return {
      data: facilities.map(toFacilityDto),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async createFacility(data, actorId) {
    try {
      const facility = await prisma.$transaction(async (tx) => {
        const created = await tx.facility.create({ data });
        await recordAuditEvent(tx, {
          actorId,
          action: 'facility.created',
          entityType: 'Facility',
          entityId: created.id,
          metadata: { name: created.name }
        });
        return created;
      });
      return toFacilityDto(facility);
    } catch (error) {
      if (error?.code === 'P2002') throw new ConflictError('A facility with this name already exists');
      throw error;
    }
  }

  async updateFacility(id, data, actorId) {
    try {
      const facility = await prisma.$transaction(async (tx) => {
        const existing = await tx.facility.findUnique({ where: { id }, select: { id: true } });
        if (!existing) throw new NotFoundError('Facility not found');

        const updated = await tx.facility.update({ where: { id }, data });
        await recordAuditEvent(tx, {
          actorId,
          action: 'facility.updated',
          entityType: 'Facility',
          entityId: id,
          metadata: { changedFields: Object.keys(data) }
        });
        return updated;
      });
      return toFacilityDto(facility);
    } catch (error) {
      if (error?.code === 'P2002') throw new ConflictError('A facility with this name already exists');
      throw error;
    }
  }

  async deleteFacility(id, actorId) {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Facility" WHERE "id" = ${id} FOR UPDATE`;
      const facility = await tx.facility.findUnique({ where: { id } });
      if (!facility) throw new NotFoundError('Facility not found');

      const usageCount = await tx.buildingFacility.count({ where: { facilityId: id } });
      if (usageCount > 0) {
        throw new ConflictError('Remove this facility from its buildings before deleting it');
      }

      await tx.facility.delete({ where: { id } });
      await recordAuditEvent(tx, {
        actorId,
        action: 'facility.deleted',
        entityType: 'Facility',
        entityId: id,
        metadata: { name: facility.name }
      });
      return { id };
    });
  }

  async attachToBuilding(slug, data, actorId) {
    try {
      return await prisma.$transaction(async (tx) => {
        const building = await tx.building.findUnique({ where: { slug }, select: { id: true } });
        if (!building) throw new NotFoundError('Building not found');
        const facility = await tx.facility.findUnique({ where: { id: data.facilityId }, select: { id: true } });
        if (!facility) throw new NotFoundError('Facility not found');

        const relation = await tx.buildingFacility.create({
          data: { buildingId: building.id, facilityId: facility.id, detail: data.detail },
          include: { facility: { select: { id: true, name: true, description: true } } }
        });
        await recordAuditEvent(tx, {
          actorId,
          action: 'building_facility.attached',
          entityType: 'BuildingFacility',
          entityId: relation.id,
          metadata: { buildingId: building.id, facilityId: facility.id }
        });
        return relation;
      });
    } catch (error) {
      if (error?.code === 'P2002') throw new ConflictError('This facility is already attached to the building');
      throw error;
    }
  }

  async updateBuildingFacilityDetail(slug, facilityId, detail, actorId) {
    return prisma.$transaction(async (tx) => {
      const building = await tx.building.findUnique({ where: { slug }, select: { id: true } });
      if (!building) throw new NotFoundError('Building not found');
      const relation = await tx.buildingFacility.findFirst({
        where: { buildingId: building.id, facilityId },
        select: { id: true }
      });
      if (!relation) throw new NotFoundError('Building facility relation not found');

      const updated = await tx.buildingFacility.update({
        where: { id: relation.id },
        data: { detail },
        include: { facility: { select: { id: true, name: true, description: true } } }
      });
      await recordAuditEvent(tx, {
        actorId,
        action: 'building_facility.updated',
        entityType: 'BuildingFacility',
        entityId: relation.id,
        metadata: { buildingId: building.id, facilityId, changedFields: ['detail'] }
      });
      return updated;
    });
  }

  async detachFromBuilding(slug, facilityId, actorId) {
    return prisma.$transaction(async (tx) => {
      const building = await tx.building.findUnique({ where: { slug }, select: { id: true } });
      if (!building) throw new NotFoundError('Building not found');
      const relation = await tx.buildingFacility.findFirst({
        where: { buildingId: building.id, facilityId },
        select: { id: true }
      });
      if (!relation) throw new NotFoundError('Building facility relation not found');

      await tx.buildingFacility.delete({ where: { id: relation.id } });
      await recordAuditEvent(tx, {
        actorId,
        action: 'building_facility.detached',
        entityType: 'BuildingFacility',
        entityId: relation.id,
        metadata: { buildingId: building.id, facilityId }
      });
      return { id: relation.id, facilityId };
    });
  }
}

export const facilityService = new FacilityService();
