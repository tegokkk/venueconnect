import { z } from 'zod';
import { paymentService } from '@/server/services/payment.service';
import { toPaymentDto } from '@/server/dto/payment.dto';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

const manualPaymentSchema = z.object({
  reference: z.string().trim().min(3).max(100)
}).strict();

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }
    const parsed = manualPaymentSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('A manual transfer reference is required', parsed.error.format());
    }
    const payment = await paymentService.recordManualPayment(id, session.user.id, parsed.data.reference);
    return successResponse(toPaymentDto(payment), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
