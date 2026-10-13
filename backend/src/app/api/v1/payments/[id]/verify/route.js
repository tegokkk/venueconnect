import { paymentService } from '@/server/services/payment.service';
import { readJsonBody } from '@/lib/api-request';
import { z } from 'zod';
import { ValidationError } from '@/server/errors';
import { successResponse, errorResponse } from '@/lib/api-response';
import { toPaymentDto } from '@/server/dto/payment.dto';
import { getDevelopmentSession } from '@/server/auth/development-session';

const verificationSchema = z.object({
  note: z.string().trim().max(2000).optional().default('')
}).strict();

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request, ['PAYMENT_VERIFIER']);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Payment id must be a UUID');
    }
    const parsedBody = verificationSchema.safeParse(await readJsonBody(request));
    if (!parsedBody.success) {
      throw new ValidationError('Invalid payment verification data', parsedBody.error.format());
    }

    const payment = await paymentService.verifyPayment(id, session.user.id, parsedBody.data.note);
    return successResponse(toPaymentDto(payment), 200);
  } catch (error) {
    return errorResponse(error);
  }
}
