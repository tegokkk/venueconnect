import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { AppError, ConflictError } from '@/server/errors';

export function successResponse(data, statusCode = 200, meta = null) {
  const response = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return NextResponse.json(response, { status: statusCode });
}

export function errorResponse(error, requestId = null) {
  const safeRequestId = typeof requestId === 'string' && /^[a-zA-Z0-9._:-]{1,128}$/.test(requestId)
    ? requestId
    : randomUUID();
  const databaseMessage = [
    error?.message,
    error?.meta?.database_error,
    error?.meta?.cause,
    error?.cause?.message
  ].filter(Boolean).join(' ');

  if (
    error?.code === 'P2004' &&
    databaseMessage.includes('booking_no_overlapping_confirmed_slot')
  ) {
    error = new ConflictError('The requested time slot is no longer available');
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId: safeRequestId,
        },
      },
      { status: error.statusCode }
    );
  }

  // Unexpected errors may carry SQL values, request bodies, or provider details.
  // Log a correlation ID and safe diagnostic metadata without serializing the error.
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'api.unhandled_error',
    requestId: safeRequestId,
    errorType: typeof error?.name === 'string' && /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(error.name)
      ? error.name
      : 'UnknownError',
    errorCode: typeof error?.code === 'string' && /^[A-Z0-9_]{1,32}$/.test(error.code)
      ? error.code
      : null
  }));
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
        requestId: safeRequestId,
      },
    },
    { status: 500 }
  );
}
