import { z } from 'zod';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { paymentProofService } from '@/server/services/payment-proof.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

async function paymentIdFrom(params) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    throw new ValidationError('Payment id must be a UUID');
  }
  return id;
}

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const id = await paymentIdFrom(params);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data')) {
      throw new ValidationError('A multipart payment proof upload is required');
    }
    const length = Number(request.headers.get('content-length'));
    if (Number.isFinite(length) && length > 6 * 1024 * 1024) {
      throw new ValidationError('The upload exceeds the 5 MB file limit');
    }
    let form;
    try {
      form = await request.formData();
    } catch {
      throw new ValidationError('Invalid multipart form data');
    }
    if (form.getAll('file').length !== 1 || [...form.keys()].some((key) => key !== 'file')) {
      throw new ValidationError('Exactly one payment proof file is required');
    }
    const proof = await paymentProofService.uploadProof(id, session.user.id, form.get('file'));
    return successResponse(proof, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const id = await paymentIdFrom(params);
    const { content, mimeType } = await paymentProofService.readProof(id, session.user);
    const extension = mimeType === 'application/pdf' ? 'pdf' : mimeType === 'image/png' ? 'png' : 'jpg';
    return new Response(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="bukti-pembayaran.${extension}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}
