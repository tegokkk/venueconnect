import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api-response';
import { readJsonBody } from '@/lib/api-request';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { toUsageHandoverDto } from '@/server/dto/usage.dto';
import { usageService } from '@/server/services/usage.service';
import { ValidationError } from '@/server/errors';

const handoverSchema = z.object({
  conditionBefore: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional()
}).strict();

const returnSchema = z.object({
  conditionAfter: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional()
}).strict();

function parseBody(schema, body, message) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ValidationError(message, parsed.error.format());
  return parsed.data;
}

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['BUILDING_OFFICER']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }

    const body = parseBody(handoverSchema, await readJsonBody(request), 'Invalid key handover data');
    const handover = await usageService.handoverKeys(id, session.user.id, body);
    return successResponse(toUsageHandoverDto(handover), 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['BUILDING_OFFICER']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }

    const body = parseBody(returnSchema, await readJsonBody(request), 'Invalid key return data');
    const handover = await usageService.returnKeys(id, session.user.id, body);
    return successResponse(toUsageHandoverDto(handover));
  } catch (error) {
    return errorResponse(error);
  }
}
