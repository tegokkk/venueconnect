import { prisma } from '@/server/db/prisma';

export class BuildingRepository {
  getPublicRatesFilter(now = new Date()) {
    return {
      isActive: true,
      validFrom: { lte: now },
      audienceType: 'EXTERNAL',
      OR: [{ validUntil: null }, { validUntil: { gt: now } }]
    };
  }

  async findAll(options = {}) {
    const { skip, take, where } = options;
    const currentRates = this.getPublicRatesFilter();
    return prisma.building.findMany({
      skip,
      take,
      where,
      include: {
        facilities: {
          include: { facility: true }
        },
        rates: { where: currentRates, orderBy: [{ isBookable: 'desc' }, { amount: 'asc' }, { name: 'asc' }] }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllForAdmin({ skip, take }) {
    return prisma.building.findMany({
      skip,
      take,
      include: {
        facilities: { include: { facility: true } },
        rates: { orderBy: [{ validFrom: 'desc' }, { id: 'desc' }] }
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }]
    });
  }

  async count(where = {}) {
    return prisma.building.count({ where });
  }

  async findByIdOrSlug(identifier) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    const currentRates = this.getPublicRatesFilter();
    return prisma.building.findFirst({
      where: {
        isActive: true,
        ...(isUuid ? { id: identifier } : { slug: identifier })
      },
      include: {
        facilities: {
          include: { facility: true }
        },
        rates: {
          where: currentRates,
          orderBy: [{ isBookable: 'desc' }, { amount: 'asc' }, { name: 'asc' }]
        }
      }
    });
  }
}

export const buildingRepository = new BuildingRepository();
