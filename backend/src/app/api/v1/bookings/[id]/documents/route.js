import { z } from 'zod';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { bookingDocumentService } from '@/server/services/booking-document.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

export async function POST(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      throw new ValidationError('Booking id must be a UUID');
    }
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data')) {
      throw new ValidationError('A multipart PDF upload is required');
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
      throw new ValidationError('Exactly one PDF file is required');
    }
    const document = await bookingDocumentService.uploadStudentDocument(id, session.user.id, form.get('file'));
    return successResponse(document, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
