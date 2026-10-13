import { z } from 'zod';
import { ValidationError } from '@/server/errors';

const catalogFiltersSchema = z.object({
  q: z.string().trim().max(100).optional(),
  facility: z.string().trim().max(100).optional(),
  facilityIds: z.array(z.string().uuid()).max(20).optional(),
  purpose: z.enum(['loan', 'rental']).optional(),
  minCapacity: z.coerce.number().int().min(1).max(2_147_483_647).optional()
});

export function parseBuildingCatalogFilters(searchParams) {
  const parsed = catalogFiltersSchema.safeParse({
    q: searchParams.get('q') ?? undefined,
    facility: searchParams.get('facility') ?? undefined,
    facilityIds: searchParams.getAll('facilityIds').filter(Boolean),
    purpose: searchParams.get('purpose') ?? undefined,
    minCapacity: searchParams.get('minCapacity') ?? undefined
  });

  if (!parsed.success) {
    throw new ValidationError('Invalid building catalog filters', parsed.error.format());
  }

  return Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0))
  );
}
