import { z } from 'zod';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { bookingDocumentService } from '@/server/services/booking-document.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';

function readIds(params) {
  if (!z.string().uuid().safeParse(params.id).success || !z.string().uuid().safeParse(params.documentId).success) {
    throw new ValidationError('Booking and document ids must be UUIDs');
  }
  return params;
}

export async function GET(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id, documentId } = readIds(await params);
    const content = await bookingDocumentService.readDocument(id, documentId, session.user);
    return new Response(content, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="student-document.pdf"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getDevelopmentSession(request);
    const { id, documentId } = readIds(await params);
    await bookingDocumentService.deleteDraftDocument(id, documentId, session.user.id);
    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
