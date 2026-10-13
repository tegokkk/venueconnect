import { errorResponse, successResponse } from '@/lib/api-response';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { paymentService } from '@/server/services/payment.service';
import { parsePagination } from '@/server/validations/pagination.validation';

export async function GET(request) {
  try {
    await getDevelopmentSession(request, ['PAYMENT_VERIFIER']);
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);
    const result = await paymentService.getPendingVerification(page, pageSize);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
