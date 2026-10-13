import { z } from 'zod';

const slugSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nullableText = (max) => z.string().trim().max(max).nullable();

export const createBuildingSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(120),
  description: nullableText(2000).optional(),
  location: nullableText(200).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  isActive: z.boolean(),
  internalLoanEnabled: z.boolean(),
  publicRentalEnabled: z.boolean()
}).strict();

export const updateBuildingSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: nullableText(2000).optional(),
  location: nullableText(200).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  termsAndConditions: nullableText(10000).optional(),
  termsApprovalReference: nullableText(160).optional(),
  publishTerms: z.boolean().optional(),
  internalLoanEnabled: z.boolean().optional(),
  publicRentalEnabled: z.boolean().optional(),
  isActive: z.boolean().optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one building field must be provided'
});
