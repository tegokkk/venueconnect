import { connection } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError } from '@/server/errors';
import {
  askAssistant,
  AssistantPrivacyError,
  AssistantRateLimitError,
  AssistantUnavailableError
} from '@/server/ai/assistant.service';

const requestSchema = z.object({
  message: z.string().trim().min(1).max(1_200)
}).strict();

export async function POST(request) {
  await connection();
  try {
    const rawBody = await request.text();
    if (rawBody.length > 8_192) {
      return Response.json({
        success: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Pertanyaan terlalu besar.', requestId: crypto.randomUUID() }
      }, { status: 413 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      throw new ValidationError('Invalid assistant request');
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid assistant request', parsed.error.format());
    }

    const result = await askAssistant(parsed.data.message, request);
    return successResponse(result);
  } catch (error) {
    if (error instanceof AssistantRateLimitError) {
      return Response.json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Terlalu banyak pertanyaan. Coba lagi sebentar.', requestId: crypto.randomUUID() }
      }, { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } });
    }

    if (error instanceof AssistantUnavailableError) {
      return Response.json({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Asisten AI belum diaktifkan.', requestId: crypto.randomUUID() }
      }, { status: 503 });
    }

    if (error instanceof AssistantPrivacyError) {
      return Response.json({
        success: false,
        error: { code: 'PERSONAL_DATA_NOT_ALLOWED', message: 'Hapus email, nomor telepon, atau nomor identitas sebelum mengirim pertanyaan.', requestId: crypto.randomUUID() }
      }, { status: 400 });
    }

    return errorResponse(error);
  }
}
