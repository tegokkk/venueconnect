import { z } from 'zod';
import { ValidationError } from '@/server/errors';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export function parsePagination(searchParams) {
  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined
  });

  if (!parsed.success) {
    throw new ValidationError('Invalid pagination parameters', parsed.error.format());
  }

  return parsed.data;
}
