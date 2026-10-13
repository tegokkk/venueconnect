import { z } from 'zod';

export const createBookingSchema = z.object({
  buildingId: z.string().uuid('Invalid building ID'),
  bookingType: z.enum(['INTERNAL', 'RENTAL']),
  applicantCategory: z.enum(['MAHASISWA', 'DOSEN_PEGAWAI', 'UMUM']),
  eventName: z.string().trim().min(3, 'Event name must be at least 3 characters').max(100, 'Event name must be at most 100 characters'),
  eventDescription: z.string().trim().max(2000).optional(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  attendeeCount: z.number().int().positive().optional(),
}).strict().refine((data) => {
  return new Date(data.endsAt) > new Date(data.startsAt);
}, {
  message: 'End time must be after start time',
  path: ['endsAt'],
});

export const studentRevisionSchema = z.object({
  eventName: z.string().trim().min(3).max(100).optional(),
  eventDescription: z.string().trim().max(2000).nullable().optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  attendeeCount: z.number().int().positive().nullable().optional(),
  note: z.string().trim().max(2000).optional().default('')
}).strict();
