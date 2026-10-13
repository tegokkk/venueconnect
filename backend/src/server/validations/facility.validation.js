import { z } from 'zod';

const facilityFields = {
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).nullable().optional()
};

export const createFacilitySchema = z.object({
  name: facilityFields.name,
  description: facilityFields.description
}).strict();

export const updateFacilitySchema = z.object({
  name: facilityFields.name.optional(),
  description: facilityFields.description
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one facility field must be provided'
});

export const attachFacilitySchema = z.object({
  facilityId: z.string().uuid(),
  detail: z.string().trim().max(500).nullable().optional()
}).strict();

export const updateBuildingFacilitySchema = z.object({
  detail: z.string().trim().max(500).nullable()
}).strict();
