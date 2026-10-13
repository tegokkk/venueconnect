import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError, ValidationError } from '@/server/errors';
import { availabilityService } from './availability.service';
import { recordAuditEvent } from './audit.service';

const toRateDto = (rate) => ({ ...rate, amount: rate.amount.toString() });

function assertValidPeriod(validFrom, validUntil) {
  if (validUntil && new Date(validUntil) <= new Date(validFrom)) {
    throw new ValidationError('validUntil must be later than validFrom');
  }
}

async function assertNoOverlappingRate(tx, buildingId, rate, excludedId) {
  if (!rate.isActive) return;
  const where = {
    buildingId,
    audienceType: rate.audienceType,
    isActive: true,
    validFrom: { lt: rate.validUntil ?? new Date('9999-12-31T23:59:59.999Z') },
    OR: [{ validUntil: null }, { validUntil: { gt: rate.validFrom } }],
    ...(excludedId ? { id: { not: excludedId } } : {})
  };
  const overlaps = await tx.buildingRate.findMany({ where, select: { name: true, isBookable: true } });
  if (overlaps.some((item) => item.name === rate.name || (item.isBookable && rate.isBookable))) {
    throw new ConflictError('An active rate with the same name or another bookable rate overlaps the selected period');
  }
}

export class BuildingRateService {
  async getRates(buildingId, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where = { buildingId };
    const [rows, total] = await Promise.all([
      prisma.buildingRate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ validFrom: 'desc' }, { id: 'asc' }]
      }),
      prisma.buildingRate.count({ where })
    ]);
    return {
      data: rows.map(toRateDto),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async createRate(buildingId, data, actorId) {
    assertValidPeriod(data.validFrom, data.validUntil);
    const rate = await prisma.$transaction(async (tx) => {
      await availabilityService.lockBuildingSchedule(buildingId, tx);
      const building = await tx.building.findUnique({ where: { id: buildingId }, select: { id: true } });
      if (!building) throw new NotFoundError('Building not found');

      const values = {
        ...data,
        amount: data.amount,
        validFrom: new Date(data.validFrom),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        isBookable: data.isBookable ?? false,
        isActive: data.isActive ?? true
      };
      await assertNoOverlappingRate(tx, buildingId, values);
      const created = await tx.buildingRate.create({ data: { buildingId, ...values } });
      await recordAuditEvent(tx, {
        actorId,
        action: 'building_rate.created',
        entityType: 'BuildingRate',
        entityId: created.id,
        metadata: { name: created.name, audienceType: created.audienceType, amount: created.amount.toString(), currency: created.currency, unit: created.unit }
      });
      return created;
    });
    return toRateDto(rate);
  }

  async updateRate(buildingId, rateId, data, actorId) {
    const rate = await prisma.$transaction(async (tx) => {
      await availabilityService.lockBuildingSchedule(buildingId, tx);
      const existing = await tx.buildingRate.findFirst({ where: { id: rateId, buildingId } });
      if (!existing) throw new NotFoundError('Rate not found');

      const merged = { ...existing, ...data };
      assertValidPeriod(merged.validFrom, merged.validUntil);
      await assertNoOverlappingRate(tx, buildingId, merged, rateId);
      const updateData = {
        ...data,
        ...(data.validFrom !== undefined ? { validFrom: new Date(data.validFrom) } : {}),
        ...(data.validUntil !== undefined ? { validUntil: data.validUntil ? new Date(data.validUntil) : null } : {})
      };
      const updated = await tx.buildingRate.update({ where: { id: rateId }, data: updateData });
      await recordAuditEvent(tx, {
        actorId,
        action: updated.isActive ? 'building_rate.updated' : 'building_rate.deactivated',
        entityType: 'BuildingRate',
        entityId: updated.id,
        metadata: { changedFields: Object.keys(data), name: updated.name, audienceType: updated.audienceType, amount: updated.amount.toString(), currency: updated.currency, unit: updated.unit }
      });
      return updated;
    });
    return toRateDto(rate);
  }
}

export const buildingRateService = new BuildingRateService();
