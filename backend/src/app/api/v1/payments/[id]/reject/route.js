import { z } from 'zod';
import { paymentService } from '@/server/services/payment.service';
import { toPaymentDto } from '@/server/dto/payment.dto';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { readJsonBody } from '@/lib/api-request';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

const rejectionSchema = z.object({ reason: z.string().trim().min(3).max(2000) }).strict();

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['PAYMENT_VERIFIER']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Payment id must be a UUID');
    }
    const parsed = rejectionSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      throw new ValidationError('A rejection reason between 3 and 2000 characters is required', parsed.error.format());
    }
    const payment = await paymentService.rejectManualPayment(id, session.user.id, parsed.data.reason);
    return successResponse(toPaymentDto(payment));
  } catch (error) {
    return errorResponse(error);
  }
}
