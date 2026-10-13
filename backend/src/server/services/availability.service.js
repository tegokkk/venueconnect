import { prisma } from '@/server/db/prisma';

export class AvailabilityService {
  async lockBuildingSchedule(buildingId, database = prisma) {
    return database.$queryRaw`
      SELECT "id" FROM "Building" WHERE "id" = ${buildingId} FOR UPDATE
    `;
  }

  async getAvailability(buildingId, startDate, endDate, database = prisma) {
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    if (
      Number.isNaN(rangeStart.getTime()) ||
      Number.isNaN(rangeEnd.getTime()) ||
      rangeStart >= rangeEnd
    ) {
      throw new TypeError('Availability range must have valid dates and end after start');
    }

    const overlappingBookings = await database.booking.findMany({
      where: {
        buildingId,
        status: { in: ['AWAITING_PAYMENT', 'CONFIRMED'] },
        startsAt: {
          lt: rangeEnd
        },
        endsAt: {
          gt: rangeStart
        }
      },
      select: {
        startsAt: true,
        endsAt: true
      }
    });

    const overlappingBlocks = await database.buildingBlock.findMany({
      where: {
        buildingId,
        startsAt: {
          lt: rangeEnd
        },
        endsAt: {
          gt: rangeStart
        }
      },
      select: {
        startsAt: true,
        endsAt: true
      }
    });

    // Public availability exposes only occupied time ranges and generic labels.
    const unavailableSlots = [
      ...overlappingBookings.map(({ startsAt, endsAt }) => ({
        startsAt,
        endsAt,
        status: 'BOOKED'
      })),
      ...overlappingBlocks.map(({ startsAt, endsAt }) => ({
        startsAt,
        endsAt,
        status: 'UNAVAILABLE'
      }))
    ].sort((left, right) => left.startsAt - right.startsAt);

    return {
      buildingId,
      startDate: rangeStart.toISOString(),
      endDate: rangeEnd.toISOString(),
      unavailableSlots,
      isAvailable: unavailableSlots.length === 0
    };
  }
}

export const availabilityService = new AvailabilityService();
