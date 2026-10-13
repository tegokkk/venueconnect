import { z } from 'zod';

const isoDate = z.string().datetime({ offset: true });
const amount = z.string().trim().regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, 'Amount must be a non-negative decimal with up to 2 fraction digits');

export const createBuildingRateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  audienceType: z.enum(['INTERNAL', 'EXTERNAL', 'ALL']),
  amount,
  currency: z.literal('IDR'),
  unit: z.string().trim().min(1).max(50),
  validFrom: isoDate,
  validUntil: isoDate.nullable().optional(),
  isBookable: z.boolean().optional(),
  maxDurationMinutes: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional()
}).strict().refine(({ validFrom, validUntil }) => (
  validUntil == null || new Date(validUntil) > new Date(validFrom)
), { message: 'validUntil must be later than validFrom', path: ['validUntil'] });

export const updateBuildingRateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  audienceType: z.enum(['INTERNAL', 'EXTERNAL', 'ALL']).optional(),
  amount: amount.optional(),
  currency: z.literal('IDR').optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  validFrom: isoDate.optional(),
  validUntil: isoDate.nullable().optional(),
  isBookable: z.boolean().optional(),
  maxDurationMinutes: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one rate field must be provided'
});
