import { buildingRepository } from '@/server/repositories/building.repository';
import { ConflictError, NotFoundError, ValidationError } from '@/server/errors';
import { toBuildingDto } from '@/server/dto/building.dto';
import { prisma } from '@/server/db/prisma';
import { recordAuditEvent } from './audit.service';
import { availabilityService } from './availability.service';

export class BuildingService {
  async getBuildings(page = 1, pageSize = 20, filters = {}) {
    const skip = (page - 1) * pageSize;
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.publicRentalEnabled !== undefined) {
      where.publicRentalEnabled = filters.publicRentalEnabled;
    }

    if (filters.internalLoanEnabled !== undefined) {
      where.internalLoanEnabled = filters.internalLoanEnabled;
    }

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { location: { contains: filters.q, mode: 'insensitive' } }
      ];
    }

    if (filters.facility) {
      where.facilities = {
        some: {
          facility: { name: { contains: filters.facility, mode: 'insensitive' } }
        }
      };
    }

    if (filters.facilityIds?.length) {
      where.AND = [
        ...(where.AND ?? []),
        ...filters.facilityIds.map((facilityId) => ({
          facilities: { some: { facilityId } }
        }))
      ];
    }

    if (filters.minCapacity !== undefined) {
      where.capacity = { gte: filters.minCapacity };
    }

    const [data, total] = await Promise.all([
      buildingRepository.findAll({ skip, take: pageSize, where }),
      buildingRepository.count(where)
    ]);

    return {
      data: data.map((building) => {
        const dto = toBuildingDto(building);
        return { ...dto, rates: building.publicRentalEnabled ? dto.rates : [] };
      }),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getAdminBuildings(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [buildings, total] = await Promise.all([
      buildingRepository.findAllForAdmin({ skip, take: pageSize }),
      buildingRepository.count()
    ]);

    return {
      data: buildings.map((building) => ({
        ...toBuildingDto(building),
        isActive: building.isActive,
        termsAndConditions: building.termsAndConditions,
        termsApprovalReference: building.termsApprovalReference,
        termsPublishedAt: building.termsPublishedAt
      })),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async getBuildingDetails(identifier) {
    const building = await buildingRepository.findByIdOrSlug(identifier);
    if (!building) {
      throw new NotFoundError(`Building with identifier ${identifier} not found`);
    }
    const dto = toBuildingDto(building);
    return { ...dto, rates: building.publicRentalEnabled ? dto.rates : [] };
  }

  async getBuildingTerms(identifier) {
    const building = await buildingRepository.findByIdOrSlug(identifier);
    if (!building) {
      throw new NotFoundError('Building not found');
    }

    const published = Boolean(building.termsAndConditions && building.termsApprovalReference && building.termsPublishedAt);
    return {
      termsAndConditions: published ? building.termsAndConditions : null,
      status: published ? 'AVAILABLE' : 'PENDING_POLICY'
    };
  }

  async createBuilding(data, actorId) {
    try {
      const building = await prisma.$transaction(async (tx) => {
        const created = await tx.building.create({ data });
        await recordAuditEvent(tx, {
          actorId,
          action: 'building.created',
          entityType: 'Building',
          entityId: created.id,
          metadata: {
            slug: created.slug,
            name: created.name,
            publicRentalEnabled: created.publicRentalEnabled,
            internalLoanEnabled: created.internalLoanEnabled
          }
        });
        return created;
      });
      return toBuildingDto(building);
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictError('A building with this slug already exists');
      }
      throw error;
    }
  }

  async updateBuildingBySlug(slug, data, actorId) {
    try {
      const building = await prisma.$transaction(async (tx) => {
        const existing = await tx.building.findUnique({ where: { slug }, select: { id: true } });
        if (!existing) throw new NotFoundError('Building not found');

        await availabilityService.lockBuildingSchedule(existing.id, tx);
        const current = await tx.building.findUnique({
          where: { id: existing.id },
          select: { termsAndConditions: true, termsApprovalReference: true, termsPublishedAt: true }
        });
        const { publishTerms, ...changes } = data;
        const termsText = changes.termsAndConditions === undefined ? current.termsAndConditions : changes.termsAndConditions;
        const approvalReference = changes.termsApprovalReference === undefined ? current.termsApprovalReference : changes.termsApprovalReference;
        const termsChanged = changes.termsAndConditions !== undefined && changes.termsAndConditions !== current.termsAndConditions;
        const approvalChanged = changes.termsApprovalReference !== undefined && changes.termsApprovalReference !== current.termsApprovalReference;
        if (publishTerms === true) {
          if (!termsText || !approvalReference) {
            throw new ValidationError('Publishing terms requires text and an approval reference');
          }
          changes.termsPublishedAt = current.termsPublishedAt && !termsChanged && !approvalChanged
            ? current.termsPublishedAt
            : new Date();
        } else if (publishTerms === false || termsChanged || approvalChanged) {
          changes.termsPublishedAt = null;
        }
        const updated = await tx.building.update({
          where: { id: existing.id },
          data: changes
        });

        await recordAuditEvent(tx, {
          actorId,
          action: 'building.updated',
          entityType: 'Building',
          entityId: updated.id,
          metadata: { changedFields: Object.keys(changes) }
        });
        return updated;
      });
      return toBuildingDto(building);
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictError('A building with this slug already exists');
      }
      throw error;
    }
  }
}

export const buildingService = new BuildingService();
